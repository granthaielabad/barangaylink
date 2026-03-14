import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import { FaRegAddressCard } from 'react-icons/fa';
import { PiUsersThree } from 'react-icons/pi';
import { IoShieldCheckmarkOutline } from 'react-icons/io5';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import { useDashboardStats, useRecentResidents, useRecentActivity } from '../../../hooks/queries/dashboard/useDashboard';
import { useAuth } from '../../../hooks/auth/useAuth';
import { useAuthStore } from '../../../store/authStore';
import { signOut } from '../../../services/supabase/authService';
import toast from 'react-hot-toast';

// Maps audit log table_name + operation to a human-readable label
function activityLabel(log) {
  const op = { INSERT: 'Added', UPDATE: 'Updated', DELETE: 'Deleted' }[log.operation] ?? log.operation;
  const tableMap = {
    residents: 'Resident',
    households: 'Household',
    electronic_ids: 'eID',
    document_requests: 'Document Request',
    qr_verifications: 'QR Verification',
  };
  const table = tableMap[log.table_name] ?? log.table_name;

  // Build a human-readable subject name from the record data
  let name = '';
  const d = log.new_data ?? log.old_data;
  if (log.table_name === 'qr_verifications') {
    const result = d?.result ? ` — ${d.result.charAt(0).toUpperCase() + d.result.slice(1)}` : '';
    return `QR Verified${result}`;
  } else if (d?.first_name) {
    name = `${d.first_name} ${d.last_name ?? ''}`.trim();
  } else if (d?.eid_number) {
    name = d.eid_number;
  } else if (d?.house_no) {
    name = `House ${d.house_no}`;
  } else {
    name = log.profiles?.full_name ? `by ${log.profiles.full_name}` : '';
  }
  return `${table} ${op}${name ? ': ' + name : ''}`;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  return `${Math.floor(hrs / 24)} day(s) ago`;
}

const ACTIVITY_ICONS = {
  residents: PiUsersThree,
  households: FiHome,
  electronic_ids: FaRegAddressCard,
  qr_verifications: IoShieldCheckmarkOutline,
};

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { profile } = useAuth();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentResidents = [] } = useRecentResidents();
  const { data: recentActivity = [] } = useRecentActivity();

  const handleLogout = async () => {
    try {
      await signOut();
      clearAuth();
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.message ?? 'Logout failed.');
    }
  };

  const statCards = [
    {
      label: 'Total Residents',
      icon: PiUsersThree,
      value: statsLoading ? '—' : (stats?.totalResidents ?? 0).toLocaleString(),
      sub: 'Live count',
    },
    {
      label: 'Total Households',
      icon: FiHome,
      value: statsLoading ? '—' : (stats?.totalHouseholds ?? 0).toLocaleString(),
      sub: 'Live count',
    },
    {
      label: 'Active eID',
      icon: FaRegAddressCard,
      value: statsLoading ? '—' : (stats?.activeEids ?? 0).toLocaleString(),
      sub: 'Live count',
    },
  ];

  return (
    <div className="min-h-screen flex bg-[#F3F7F3]">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1">
        <DashboardHeader
          title="Dashboard"
          userName={profile?.full_name ?? 'Loading...'}
          userRole={profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : ''}
          onLogout={handleLogout}
          onMenuToggle={() => setSidebarOpen((o) => !o)}
        />

        <section className="px-5 py-7">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="bg-white rounded-xl border border-gray-200 border-r-6 border-r-[#005F02] shadow-sm p-8 relative"
                >
                  <div className="grid gap-y-3">
                    <div className="grid grid-cols-[44px_1fr] items-center gap-x-2">
                      <div className="flex items-center justify-center text-[#005F02]">
                        <Icon className="w-10 h-10" />
                      </div>
                      <div className="text-2xl font-semibold text-gray-800">{card.label}</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900">{card.value}</div>
                      <div className="text-lg text-gray-500">{card.sub}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Lower panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Recent Residents */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden border-r-6 border-r-[#005F02] shadow-sm p-8">
              <div className="px-5 py-1 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-[21px] font-semibold text-gray-900">Recent Residents</h2>
              </div>
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-base">
                    <thead>
                      <tr className="text-left text-[12px] bg-gray-50 text-gray-500 border-b border-gray-200">
                        <th className="py-2 pr-4 font-semibold">Residents Name</th>
                        <th className="py-2 pr-4 font-semibold">Address</th>
                        <th className="py-2 pr-4 font-semibold">Gender</th>
                        <th className="py-2 font-semibold">Date Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentResidents.map((r) => (
                        <tr key={r.id} className="border-b border-gray-50 last:border-b-0">
                          <td className="py-3 pr-4 text-gray-800">
                            {`${r.first_name} ${r.middle_name ? r.middle_name + ' ' : ''}${r.last_name}`.trim()}
                          </td>
                          <td className="py-3 pr-4 text-gray-800">{r.address_line ?? r.puroks?.name ?? '—'}</td>
                          <td className="py-3 pr-4 text-gray-800">{r.sex === 'M' ? 'Male' : r.sex === 'F' ? 'Female' : r.sex ?? '—'}</td>
                          <td className="py-3 text-gray-800">
                            {new Date(r.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                      {recentResidents.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-gray-400 text-sm">No residents yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Recent System Activity */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden border-r-6 border-r-[#005F02] shadow-sm p-8">
              <div className="px-5 py-1 border-b border-gray-100">
                <h2 className="text-[21px] font-semibold text-gray-900">Recent System Activity</h2>
              </div>
              <div className="p-5 space-y-4">
                {recentActivity.map((a) => {
                  const Icon = ACTIVITY_ICONS[a.table_name] ?? IoShieldCheckmarkOutline;
                  return (
                    <div key={a.id} className="flex items-start gap-3 border-b border-gray-100">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[#005F02] shrink-0">
                        <Icon className="w-12 h-12" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-base font-semibold text-gray-800 truncate">{activityLabel(a)}</div>
                        <div className="text-base text-gray-500 mt-0.5">{timeAgo(a.changed_at)}</div>
                      </div>
                    </div>
                  );
                })}
                {recentActivity.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No activity yet.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}