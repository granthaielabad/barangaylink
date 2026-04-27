import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const { data: analyticsData } = useAnalytics(parseInt(filters.year, 10));

  const handleExport = async (format) => {
    if (!analyticsData) return;
    
    const loadingToast = toast.loading(`Generating ${format.toUpperCase()} report...`);
    
    try {
      if (format === 'csv') {
        exportToCSV(analyticsData, filters);
      } else if (format === 'pdf') {
        await exportToPDF('analytics-report-content', `BarangayLink_Analytics_${filters.year}`);
      } else {
        // For DOCX and XLSX, we need to capture individual charts
        const chartIds = [
          'population-age-group',
          'gender-distribution',
          'household-per-sitio',
          'id-renewal-stats',
          'active-vs-inactive'
        ];
        const chartImages = await captureCharts(chartIds);
        
        if (format === 'xlsx') {
          await exportToXLSX(analyticsData, filters, chartImages);
        } else if (format === 'docx') {
          await exportToDOCX(analyticsData, filters, chartImages);
        }
      }
      toast.success(`${format.toUpperCase()} exported successfully!`, { id: loadingToast });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(`Failed to export ${format.toUpperCase()}.`, { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F3F7F3]">
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

            {/* Brgy ID Section - ID Renewal Statistics and Status side by side */}
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
                <NewResidentsPerYear filters={filters} />
                <ResidentsTransferredOut filters={filters} />
                <PopulationGrowth filters={filters} />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}