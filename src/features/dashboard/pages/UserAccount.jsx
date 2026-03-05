import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import { UserTable, RoleTabs } from '../components/UserAccount';
import { SortFilter, OrderFilter, Pagination, SearchBox, DeleteModal } from '../../../shared';
import { useProfiles, useMutateProfile } from '../../../hooks/queries/profiles/useProfiles';
import { useAuth } from '../../../hooks/auth/useAuth';
import { useAuthStore } from '../../../store/authStore';
import { signOut } from '../../../services/supabase/authService';
import toast from 'react-hot-toast';

const PAGE_SIZE = 8;

export default function UserManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const navigate = useNavigate();
  const { profile } = useAuth();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  // Map UI sort values → DB column names
  const sortMap = {
    'name-asc': { sortBy: 'full_name', order: 'asc' },
    'name-desc': { sortBy: 'full_name', order: 'desc' },
    'date-newest': { sortBy: 'created_at', order: 'desc' },
    'date-oldest': { sortBy: 'created_at', order: 'asc' },
  };
  const { sortBy: dbSort, order } = sortMap[sortBy] ?? { sortBy: 'full_name', order: 'asc' };

  const { data, isLoading } = useProfiles({
    page, pageSize: PAGE_SIZE, search,
    role: roleFilter === 'all' ? 'all' : roleFilter.toLowerCase().replace(' ', '_'),
    sortBy: dbSort, order,
  });
  const { changeRole, remove } = useMutateProfile();

  const profiles = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalEntries = data?.total ?? 0;

  // Adapter: map DB profile → UserTable display shape
  const tableUsers = profiles.map((p) => ({
    id: p.id,
    name: p.full_name ?? '—',
    email: '—', // email lives in auth.users; not exposed via profiles table for security
    role: p.role ? p.role.charAt(0).toUpperCase() + p.role.slice(1) : '—',
    access: p.role === 'superadmin' ? 'Full Access' : p.role === 'staff' ? 'Limited Access' : 'Read-Only',
    status: p.is_active ? 'Enabled' : 'Disabled',
    _raw: p,
  }));

  // Role counts for tabs — computed from current page data (best effort without full count)
  const roleCounts = {
    all: totalEntries,
    'Super Admin': profiles.filter((p) => p.role === 'superadmin').length,
    'Staff': profiles.filter((p) => p.role === 'staff').length,
    'Resident': profiles.filter((p) => p.role === 'resident').length,
  };

  const handleLogout = async () => {
    try { await signOut(); clearAuth(); navigate('/login', { replace: true }); }
    catch (err) { toast.error(err.message ?? 'Logout failed.'); }
  };

  const handleRoleChange = (userId, newRole) => {
    const dbRole = newRole.toLowerCase().replace(' ', '_');
    changeRole.mutate({ id: userId, role: dbRole });
  };

  const handleConfirmDelete = () => {
    if (userToDelete) remove.mutate(userToDelete._raw?.id ?? userToDelete.id);
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  return (
    <div className="min-h-screen flex bg-[#F3F7F3]">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-auto relative">
        <DashboardHeader
          title="User Accounts"
          userName={profile?.full_name ?? ''}
          userRole={profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : ''}
          onLogout={handleLogout}
          onMenuToggle={() => setSidebarOpen((o) => !o)}
        />

        <section className="px-5 py-7">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h1 className="mb-6 font-semibold text-[25px]">User Accounts</h1>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search" />
                <div className="flex items-center gap-2">
                  <SortFilter value={sortBy} onChange={setSortBy} />
                  <OrderFilter value={sortBy} onChange={setSortBy} />
                </div>
              </div>
            </div>

            <RoleTabs
              roleFilter={roleFilter}
              onRoleChange={(r) => { setRoleFilter(r); setPage(1); }}
              roleCounts={roleCounts}
            />

            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin w-8 h-8 border-4 border-[#005F02] border-t-transparent rounded-full" />
              </div>
            ) : (
              <UserTable
                users={tableUsers}
                onDeleteUser={(u) => { setUserToDelete(u); setDeleteModalOpen(true); }}
                onRoleChange={handleRoleChange}
              />
            )}

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalEntries={totalEntries}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        </section>
      </main>

      <DeleteModal
        isOpen={deleteModalOpen}
        title="User"
        message="This action is permanent and cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => { setDeleteModalOpen(false); setUserToDelete(null); }}
      />
    </div>
  );
}