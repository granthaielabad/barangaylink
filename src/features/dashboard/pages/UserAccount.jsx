import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import { UserTable, RoleTabs } from '../components/UserAccount';
import { ActionDropdown, SortFilter, StatusFilter, Pagination, SearchBox, DeleteModal } from '../../../shared';
import { useProfiles, useProfileRoleCounts, useMutateProfile } from '../../../hooks/queries/profiles/useProfiles';
import { useAuth } from '../../../hooks/auth/useAuth';
import { useAuthStore } from '../../../store/authStore';
import { signOut } from '../../../services/supabase/authService';
import toast from 'react-hot-toast';
import { SORT_FIELDS, USER_ACCOUNT_STATUS_OPTIONS } from '../../../core/constants';

// Map RoleTabs UI labels → DB role values
const ROLE_TAB_TO_DB = {
  'all':         'all',
  'Super Admin': 'superadmin',
  'Staff':       'staff',
  'Resident':    'resident',
};

export default function UserManagement() {
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [search,           setSearch]           = useState('');
  const [sortBy,           setSortBy]           = useState('created_at:desc');
  const [status,           setStatus]           = useState('all');
  const [roleFilter,       setRoleFilter]       = useState('all');
  const [page,             setPage]             = useState(1);
  const [deleteModalOpen,  setDeleteModalOpen]  = useState(false);
  const [userToDelete,     setUserToDelete]     = useState(null);

  const navigate    = useNavigate();
  const { profile, isSuperadmin } = useAuth();
  const clearAuth   = useAuthStore((s) => s.clearAuth);

  const [dbSort, dbOrder] = sortBy.split(':');

  // Paginated user list
  const { data, isLoading } = useProfiles({
    page, pageSize: PAGE_SIZE, search,
    role: ROLE_TAB_TO_DB[roleFilter] ?? 'all',
    status,
    sortBy: dbSort, order: dbOrder,
  });

  // Accurate role counts across ALL users (not just current page)
  const { data: roleCounts = { all: 0, superadmin: 0, staff: 0, resident: 0 } } = useProfileRoleCounts();

  const { changeRole, toggleActive, remove } = useMutateProfile();

  const profiles     = data?.data       ?? [];
  const totalPages   = data?.totalPages ?? 1;
  const totalEntries = data?.total      ?? 0;

  // Adapter: map DB profile → UserTable display shape
  const tableUsers = profiles.map((p) => ({
    id:     p.id,
    name:   p.full_name ?? '—',
    email:  p.residents?.[0]?.email ?? p.email ?? '—',
    role:   p.role ? p.role.charAt(0).toUpperCase() + p.role.slice(1).replace('_', ' ') : '—',
    access: p.role === 'superadmin' ? 'Full Access'
          : p.role === 'staff'      ? 'Limited Access'
          : 'Read-Only',
    status:   p.is_active ? 'Enabled' : 'Disabled',
    isActive: p.is_active ?? true,
    _raw: p,
  }));

  const handleLogout = async () => {
    try { await signOut(); clearAuth(); navigate('/login', { replace: true }); }
    catch (err) { toast.error(err.message ?? 'Logout failed.'); }
  };

  const handleRoleChange = (userId, newRole) => {
    // newRole comes from UI as e.g. "Super Admin" → map to DB value
    const dbRole = ROLE_TAB_TO_DB[newRole] ?? newRole.toLowerCase().replace(/\s+/g, '');
    changeRole.mutate({ id: userId, role: dbRole });
  };

  const handleToggleActive = (userId, currentlyActive) => {
    toggleActive.mutate({ id: userId, isActive: !currentlyActive });
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
                <SearchBox
                  value={search}
                  onChange={(v) => { setSearch(v); setPage(1); }}
                  placeholder="Search by name"
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Filter By:</span>
                  <StatusFilter
                    value={status}
                    onChange={(v) => { setStatus(v); setPage(1); }}
                    options={USER_ACCOUNT_STATUS_OPTIONS}
                  />
                  <SortFilter
                    value={sortBy}
                    onChange={(v) => { setSortBy(v); setPage(1); }}
                    options={SORT_FIELDS.USER_ACCOUNTS}
                  />
                </div>
              </div>
            </div>

            {/* Role tabs with accurate global counts */}
            <RoleTabs
              roleFilter={roleFilter}
              onRoleChange={(r) => { setRoleFilter(r); setPage(1); }}
              roleCounts={{
                all:         roleCounts.all,
                'Super Admin': roleCounts.superadmin,
                'Staff':       roleCounts.staff,
                'Resident':    roleCounts.resident,
              }}
            />

            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin w-8 h-8 border-4 border-[#005F02] border-t-transparent rounded-full" />
              </div>
            ) : (
              <UserTable
                users={tableUsers}
                canChangeRole={isSuperadmin}
                canDelete={isSuperadmin}
                onDeleteUser={(u)  => { setUserToDelete(u); setDeleteModalOpen(true); }}
                onRoleChange={handleRoleChange}
                onToggleActive={handleToggleActive}
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