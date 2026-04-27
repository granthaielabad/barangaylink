import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsBarChartLine, BsPersonVcard } from 'react-icons/bs';
import { PiUsersThree } from 'react-icons/pi';
import { FaWheelchair, FaFemale } from 'react-icons/fa';
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
import toast from 'react-hot-toast';

const SECTORAL_STATUS_CARDS = [
  { label: 'Solo Parent', value: 180, icon: PiUsersThree },
  { label: 'PWDs', value: 120, icon: FaWheelchair },
  { label: 'Indigent', value: 520, icon: PiUsersThree },
];

const BENEFICIARY_INSIGHTS_CARDS = [
  { label: 'Senior Citizens', value: 315, icon: PiUsersThree },
  { label: 'PWDs', value: 102, icon: FaWheelchair },
  { label: 'Children', value: 875, icon: FaChildReaching },
  { label: 'Pregnant', value: 56, icon: FaFemale },
];

const TREND_SUMMARY_CARDS = [
  {
    title: 'Population Growth',
    icon: BsBarChartLine,
    description: 'The population has grown consistently over the past 5 years',
    metric: '+50.0%',
    period: 'from 2021 to 2025',
  },
  {
    title: 'ID Issuance',
    icon: BsPersonVcard,
    description: 'Increasing trend in montly ID requests. Keep monitoring for resource planning.',
    metric: '+55.6%',
    period: 'from January to June',
  },
  {
    title: 'Household Concentration',
    icon: HiOutlineHomeModern,
    description: 'Purok 6, 2 and 4 have the highest household counts.',
    note: 'Focus areas in barangay programs.',
  },
];

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

  // Single parallel fetch — all chart components read from this one result.
  // Pass selected year so monthly queries respect the filter.
  const { data: analyticsData } = useAnalytics(parseInt(filters.year, 10));

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

        <section className="px-5 py-7">
          <Filters onFilterChange={setFilters} />
          <AnalyticsCards filters={filters} analyticsData={analyticsData} />

          <div className="mb-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Trend Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {TREND_SUMMARY_CARDS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-xl border border-gray-200 bg-[#F7F2F4] p-4 lg:p-5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-[#0A7A2A] pt-1 shrink-0">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                          <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">{item.description}</p>
                          {item.metric && <p className="text-4xl leading-none font-bold text-[#8C0B1A] mt-4">{item.metric}</p>}
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
              <PopulationByAgeGroup filters={filters} analyticsData={analyticsData} />
              <GenderDistribution filters={filters} analyticsData={analyticsData} />
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2.5">Sectoral Status</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SECTORAL_STATUS_CARDS.map((card) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={card.label}
                        className="relative rounded-lg border border-gray-300 bg-[#F6F6F6] px-4 py-3 min-h-[88px] flex flex-col items-center justify-center"
                      >
                        <span className="text-sm font-semibold text-gray-700">{card.label}</span>
                        <span className="text-[32px] font-bold text-gray-900 leading-tight mt-1">{card.value}</span>
                        <Icon className="absolute left-2.5 bottom-2.5 w-4 h-4 text-gray-500" />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2.5">Beneficiary Insights</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {BENEFICIARY_INSIGHTS_CARDS.map((card) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={card.label}
                        className="relative rounded-lg border border-gray-300 bg-[#F6F6F6] px-4 py-3 min-h-[88px] flex flex-col items-center justify-center"
                      >
                        <span className="text-sm font-semibold text-gray-700">{card.label}</span>
                        <span className="text-[32px] font-bold text-gray-900 leading-tight mt-1">{card.value}</span>
                        <Icon className="absolute left-2.5 bottom-2.5 w-4 h-4 text-gray-500" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>


          {/* Household Section — paused pending Purok/Zone data decision */}
          <div className="mb-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[21px] font-semibold text-gray-900">Household</h2>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                  Coming Soon
                </span>
              </div>
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                <svg className="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <p className="text-sm font-medium text-gray-500">Household analytics coming soon</p>
                <p className="text-xs text-gray-400 mt-1">Purok/Zone breakdown will be available once configured</p>
              </div>
            </div>
          </div>

          {/* Brgy ID Section - ID Renewal Statistics and Status side by side */}
          <div className="mb-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-[21px] font-semibold text-gray-900 mb-4">Brgy ID</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <IdRenewalStatistics filters={filters} analyticsData={analyticsData} />
                <div>
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
      </main>
    </div>
  );
}

