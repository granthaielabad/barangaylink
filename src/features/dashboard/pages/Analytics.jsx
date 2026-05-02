import { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsBarChartLine, BsPersonVcard } from 'react-icons/bs';
import { PiUsersThree } from 'react-icons/pi';
import { FaWheelchair } from 'react-icons/fa';
import { FaChildReaching } from 'react-icons/fa6';
import { HiOutlineHomeModern } from 'react-icons/hi2';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import {
  Filters,
  AnalyticsCards,
  PopulationByAgeGroup,
  GenderDistribution,
  IdRenewalStatistics,
  HouseholdsPerPurok,
  ActiveVsInactive,
  NewResidentsPerYear,
  ResidentsTransferredOut,
  PopulationGrowth,
} from '../components/analytics';
import { useAnalytics } from '../../../hooks/queries/analytics/useAnalytics';
import { useAuth } from '../../../hooks/auth/useAuth';
import { useAuthStore } from '../../../store/authStore';
import { signOut } from '../../../services/supabase/authService';
import { 
  exportToCSV, 
  exportToXLSX, 
  exportToPDF, 
  exportToDOCX,
  captureCharts 
} from '../../../services/export/exportService';
import toast from 'react-hot-toast';

export default function Analytics() {
  const [filters, setFilters] = useState({
    dateRange:      'last30',
    dateRangeLabel: 'Last 30 days',
    customStart:    '',
    customEnd:      '',
    year:           String(new Date().getFullYear()),
    filterAll:      'All',
    category:       'Category',
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate  = useNavigate();
  const { profile } = useAuth();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const handleLogout = async () => {
    try { await signOut(); clearAuth(); navigate('/login', { replace: true }); }
    catch (err) { toast.error(err.message ?? 'Logout failed.'); }
  };

  const { data: analyticsData, isLoading } = useAnalytics(parseInt(filters.year, 10));

  // ── Dynamic Card Data Mapping ──────────────────────────────────────────────
  const sectoralStatusCards = useMemo(() => [
    { label: 'Solo Parent', value: analyticsData?.sectoral?.soloParent ?? 0, icon: PiUsersThree },
    { label: 'PWDs', value: analyticsData?.sectoral?.pwd ?? 0, icon: FaWheelchair },
    { label: 'LGBTQ+', value: analyticsData?.sectoral?.lgbtq ?? 0, icon: PiUsersThree },
  ], [analyticsData]);

  const beneficiaryInsightsCards = useMemo(() => [
    { label: 'Senior Citizens', value: analyticsData?.insights?.seniors ?? 0, icon: PiUsersThree },
    { label: 'PWDs', value: analyticsData?.insights?.pwds ?? 0, icon: FaWheelchair },
    { label: 'Children', value: analyticsData?.insights?.children ?? 0, icon: FaChildReaching },
  ], [analyticsData]);

  const trendSummaryCards = useMemo(() => {
    // Basic calculation for growth from first to last year in data
    const growth = analyticsData?.populationGrowth ?? [];
    const firstYearCount = growth[0]?.count ?? 1;
    const lastYearCount = growth[growth.length - 1]?.count ?? 0;
    const growthPercent = (((lastYearCount - firstYearCount) / firstYearCount) * 100).toFixed(1);

    const puroks = analyticsData?.householdsPerPurok ?? [];
    const topPurok = puroks.length ? [...puroks].sort((a, b) => b.count - a.count)[0] : null;

    return [
      {
        title: 'Population Growth',
        icon: BsBarChartLine,
        description: 'The population growth trend based on registry entries.',
        metric: `${growthPercent > 0 ? '+' : ''}${growthPercent}%`,
        period: growth.length > 0 ? `from ${growth[0].year} to ${growth[growth.length - 1].year}` : 'No data available',
      },
      {
        title: 'ID Issuance',
        icon: BsPersonVcard,
        description: 'Recent trend in digital EID generation for residents.',
        metric: `${analyticsData?.totals?.eids ?? 0}`,
        period: 'Total Active IDs',
      },
      {
        title: 'Household Concentration',
        icon: HiOutlineHomeModern,
        description: 'Sitio concentration based on active household records.',
        metric: topPurok?.name ?? null,
        period: topPurok
          ? `Top sitio · ${Number(topPurok.count).toLocaleString()} households`
          : 'No household-per-sitio data yet.',
      },
    ];
  }, [analyticsData]);

  const handleExport = async (format) => {
    if (!analyticsData) return;
    const loadingToast = toast.loading(`Generating ${format.toUpperCase()} report...`);
    try {
      if (format === 'csv') exportToCSV(analyticsData, filters);
      else if (format === 'pdf') await exportToPDF('analytics-report-content', `BarangayLink_Analytics_${filters.year}`);
      else {
        const chartIds = ['population-age-group', 'gender-distribution', 'household-per-sitio', 'id-renewal-stats', 'active-vs-inactive'];
        const chartImages = await captureCharts(chartIds);
        if (format === 'xlsx') await exportToXLSX(analyticsData, filters, chartImages);
        else if (format === 'docx') await exportToDOCX(analyticsData, filters, chartImages);
      }
      toast.success(`${format.toUpperCase()} exported successfully!`, { id: loadingToast });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(`Failed to export ${format.toUpperCase()}.`, { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FFFBFC]">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-auto">
        <DashboardHeader
          title="Analytics"
          userName={profile?.full_name ?? ''}
          userRole={profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : ''}
          onLogout={handleLogout}
          onMenuToggle={() => setSidebarOpen(o => !o)}
        />

        <div id="analytics-report-content">
          <section className="px-5 py-7">
            <Filters onFilterChange={setFilters} onExport={handleExport} />
            <AnalyticsCards filters={filters} analyticsData={analyticsData} />

            {/* Trend Summary Section */}
            <div className="mb-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Trend Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {trendSummaryCards.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="rounded-xl border border-gray-200 bg-[#F7F2F4] p-4 lg:p-5">
                        <div className="flex items-start gap-3">
                          <div className="text-[#0A7A2A] pt-1 shrink-0"><Icon className="w-6 h-6" /></div>
                          <div className="min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                            <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">{item.description}</p>
                            {item.metric != null && item.metric !== '' && (
                              <p className="text-4xl leading-tight font-bold text-[#8C0B1A] mt-4 break-words">
                                {item.metric}
                              </p>
                            )}
                            {item.period && <p className="text-sm text-gray-800 mt-2">{item.period}</p>}
                            {item.note && <p className="text-sm text-gray-800 mt-4">{item.note}</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Demographic Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
              <h2 className="text-[21px] font-semibold text-gray-900 mb-4">Demographic</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div id="population-age-group">
                  <PopulationByAgeGroup filters={filters} analyticsData={analyticsData} />
                </div>
                <div id="gender-distribution">
                  <GenderDistribution filters={filters} analyticsData={analyticsData} />
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2.5">Sectoral Status</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sectoralStatusCards.map((card) => {
                      const Icon = card.icon;
                      return (
                        <div key={card.label} className="relative rounded-lg border border-gray-300 bg-[#F6F6F6] px-4 py-3 min-h-[88px] flex flex-col items-center justify-center">
                          <span className="text-sm font-semibold text-gray-700">{card.label}</span>
                          <span className="text-[32px] font-bold text-gray-900 leading-tight mt-1">
                            {isLoading ? '...' : card.value}
                          </span>
                          <Icon className="absolute left-2.5 bottom-2.5 w-4 h-4 text-gray-500" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2.5">Beneficiary Insights</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {beneficiaryInsightsCards.map((card) => {
                      const Icon = card.icon;
                      return (
                        <div key={card.label} className="relative rounded-lg border border-gray-300 bg-[#F6F6F6] px-4 py-3 min-h-[88px] flex flex-col items-center justify-center">
                          <span className="text-sm font-semibold text-gray-700">{card.label}</span>
                          <span className="text-[32px] font-bold text-gray-900 leading-tight mt-1">
                            {isLoading ? '...' : card.value}
                          </span>
                          <Icon className="absolute left-2.5 bottom-2.5 w-4 h-4 text-gray-500" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Household Section */}
            <div className="mb-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[21px] font-semibold text-gray-900">Household</h2>
                </div>
                <div id="household-per-sitio">
                  <HouseholdsPerPurok filters={filters} analyticsData={analyticsData} />
                </div>
              </div>
            </div>

            {/* Brgy ID Section */}
            <div className="mb-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-[21px] font-semibold text-gray-900 mb-4">Brgy ID</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div id="id-renewal-stats">
                    <IdRenewalStatistics filters={filters} analyticsData={analyticsData} />
                  </div>
                  <div id="active-vs-inactive">
                    <h3 className="text-base font-medium text-gray-700 mb-3">Status</h3>
                    <ActiveVsInactive filters={filters} analyticsData={analyticsData} />
                  </div>
                </div>
              </div>
            </div>

            {/* Growth Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-[21px] font-semibold text-gray-900 mb-4">Growth</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <NewResidentsPerYear filters={filters} analyticsData={analyticsData} />
                <ResidentsTransferredOut filters={filters} analyticsData={analyticsData} />
                <PopulationGrowth filters={filters} analyticsData={analyticsData} />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
