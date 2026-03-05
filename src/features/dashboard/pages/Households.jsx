import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import { HouseholdTable, HouseholdAddEdit } from '../components/households';
import { SortFilter, OrderFilter, StatusFilter, Pagination, SearchBox, ArchiveModal, DeleteModal } from '../../../shared';
import { useHouseholds, useMutateHousehold } from '../../../hooks/queries/households/useHouseholds';
import { useHouseholdFilters } from '../../../store/filterStore';
import { useAuth } from '../../../hooks/auth/useAuth';
import { useAuthStore } from '../../../store/authStore';
import { signOut } from '../../../services/supabase/authService';
import toast from 'react-hot-toast';

export default function Household() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState(null);

  const navigate = useNavigate();
  const { profile } = useAuth();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  // ── Filter store — select each primitive individually ─────────
  const search    = useHouseholdFilters((s) => s.search);
  const sortBy    = useHouseholdFilters((s) => s.sortBy);
  const order     = useHouseholdFilters((s) => s.order);
  const status    = useHouseholdFilters((s) => s.status);
  const page      = useHouseholdFilters((s) => s.page);
  const pageSize  = useHouseholdFilters((s) => s.pageSize);
  const setSearch = useHouseholdFilters((s) => s.setSearch);
  const setSortBy = useHouseholdFilters((s) => s.setSortBy);
  const setOrder  = useHouseholdFilters((s) => s.setOrder);
  const setStatus = useHouseholdFilters((s) => s.setStatus);
  const setPage   = useHouseholdFilters((s) => s.setPage);

  const { data, isLoading } = useHouseholds();
  const { create, update, archive, remove } = useMutateHousehold();

  const households = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalEntries = data?.total ?? 0;

  // Adapter: map DB fields → table display shape
  const tableHouseholds = households.map((h) => ({
    id: h.id,
    householdNo: h.house_no ?? '—',
    headMemberName: h.head
      ? `${h.head.first_name} ${h.head.last_name}`.trim()
      : '—',
    address: [h.house_no, h.street, h.puroks?.name].filter(Boolean).join(', ') || '—',
    members: '—', // member count requires a separate count query — deferred
    status: h.status ? h.status.charAt(0).toUpperCase() + h.status.slice(1) : '—',
    _raw: h,
  }));

  const handleLogout = async () => {
    try { await signOut(); clearAuth(); navigate('/login', { replace: true }); }
    catch (err) { toast.error(err.message ?? 'Logout failed.'); }
  };

  const handleAddHousehold = (data) => {
    create.mutate({
      house_no: data.householdNo || null,
      street: data.address || null,
      status: 'active',
    });
    setAddModalOpen(false);
  };

  const handleUpdateHousehold = (data) => {
    if (!selectedHousehold) return;
    update.mutate({
      id: selectedHousehold._raw?.id ?? selectedHousehold.id,
      payload: {
        house_no: data.householdNo || null,
        street: data.address || null,
      },
    });
    setEditModalOpen(false);
    setSelectedHousehold(null);
  };

  const handleConfirmArchive = () => {
    if (selectedHousehold) archive.mutate(selectedHousehold._raw?.id ?? selectedHousehold.id);
    setArchiveModalOpen(false);
    setSelectedHousehold(null);
  };

  const handleConfirmDelete = () => {
    if (selectedHousehold) remove.mutate(selectedHousehold._raw?.id ?? selectedHousehold.id);
    setDeleteModalOpen(false);
    setSelectedHousehold(null);
  };

  return (
    <div className="min-h-screen flex bg-[#F3F7F3]">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-auto relative">
        <DashboardHeader
          title="Household"
          userName={profile?.full_name ?? ''}
          userRole={profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : ''}
          onLogout={handleLogout}
          onMenuToggle={() => setSidebarOpen((o) => !o)}
        />

        <section className="px-5 py-7">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h1 className="mb-10 font-semibold text-[25px]">Household List</h1>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search" />
                <div className="flex items-center gap-2 flex-wrap">
                  <SortFilter value={sortBy} onChange={setSortBy} />
                  <StatusFilter value={status} onChange={(v) => { setStatus(v); setPage(1); }} />
                  <OrderFilter value={order} onChange={setOrder} />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(true)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium bg-[#005F02] text-white hover:bg-[#004A01] transition-colors whitespace-nowrap"
                >
                  Add New Household
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin w-8 h-8 border-4 border-[#005F02] border-t-transparent rounded-full" />
              </div>
            ) : (
              <HouseholdTable
                households={tableHouseholds}
                onEditHousehold={(h) => { setSelectedHousehold(h); setEditModalOpen(true); }}
                onArchiveHousehold={(h) => { setSelectedHousehold(h); setArchiveModalOpen(true); }}
                onDeleteHousehold={(h) => { setSelectedHousehold(h); setDeleteModalOpen(true); }}
              />
            )}

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalEntries={totalEntries}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </div>
        </section>
      </main>

      <HouseholdAddEdit isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} onSubmit={handleAddHousehold} mode="add" />
      <HouseholdAddEdit
        isOpen={editModalOpen}
        onClose={() => { setEditModalOpen(false); setSelectedHousehold(null); }}
        onSubmit={handleUpdateHousehold}
        initialData={selectedHousehold}
        mode="edit"
      />
      <ArchiveModal
        isOpen={archiveModalOpen}
        title="Household"
        message="This record will be archived and removed from the active list."
        onConfirm={handleConfirmArchive}
        onCancel={() => { setArchiveModalOpen(false); setSelectedHousehold(null); }}
      />
      <DeleteModal
        isOpen={deleteModalOpen}
        title="Household"
        message="This action is permanent and cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => { setDeleteModalOpen(false); setSelectedHousehold(null); }}
      />
    </div>
  );
}