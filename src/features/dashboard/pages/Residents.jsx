import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import { ResidentTable, ResidentAddEdit } from '../components/residents';
import { SortFilter, OrderFilter, Pagination, SearchBox, ArchiveModal, DeleteModal } from '../../../shared';
import { useResidents, useMutateResident } from '../../../hooks/queries/residents/useResidents';
import { useResidentFilters } from '../../../store/filterStore';
import { useAuth } from '../../../hooks/auth/useAuth';
import { useAuthStore } from '../../../store/authStore';
import { signOut } from '../../../services/supabase/authService';
import toast from 'react-hot-toast';

export default function Residents() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);

  const navigate = useNavigate();
  const { profile } = useAuth();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  // ── Filter store — select each primitive individually ─────────
  // Never destructure useXxxFilters() with no selector; it subscribes
  // to the entire store object and causes an infinite render loop.
  const search   = useResidentFilters((s) => s.search);
  const sortBy   = useResidentFilters((s) => s.sortBy);
  const order    = useResidentFilters((s) => s.order);
  const page     = useResidentFilters((s) => s.page);
  const pageSize = useResidentFilters((s) => s.pageSize);
  const setSearch = useResidentFilters((s) => s.setSearch);
  const setSortBy = useResidentFilters((s) => s.setSortBy);
  const setOrder  = useResidentFilters((s) => s.setOrder);
  const setPage   = useResidentFilters((s) => s.setPage);

  // ── Server data ───────────────────────────────────────────────
  const { data, isLoading, isFetching } = useResidents();
  const { create, update, archive, remove } = useMutateResident();

  const residents = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalEntries = data?.total ?? 0;

  // ── Adapter: map DB fields → table display shape ──────────────
  const tableResidents = residents.map((r) => ({
    id: r.id,
    residentNo: r.id.slice(0, 8).toUpperCase(),
    name: `${r.last_name}, ${r.first_name}${r.middle_name ? ' ' + r.middle_name : ''}${r.suffix ? ' ' + r.suffix : ''}`,
    address: r.address_line ?? [r.households?.house_no, r.households?.street, r.puroks?.name].filter(Boolean).join(', ') ?? '—',
    gender: r.sex === 'M' ? 'Male' : r.sex === 'F' ? 'Female' : r.sex ?? '—',
    birthdate: r.date_of_birth ?? '—',
    contactNo: r.contact_number ?? '—',
    status: r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : '—',
    _raw: r, // keep the raw DB object for edit pre-fill
  }));

  // ── Handlers ──────────────────────────────────────────────────
  const handleLogout = async () => {
    try { await signOut(); clearAuth(); navigate('/login', { replace: true }); }
    catch (err) { toast.error(err.message ?? 'Logout failed.'); }
  };

  const handleAddResident = (data) => {
    const payload = {
      first_name: data.firstName,
      middle_name: data.middleName || null,
      last_name: data.lastName,
      suffix: data.suffix || null,
      date_of_birth: data.birthdate || null,
      sex: data.gender === 'Male' ? 'M' : data.gender === 'Female' ? 'F' : null,
      contact_number: data.contactNumber || null,
      address_line: [data.houseNo, data.street, data.purok, data.barangay].filter(Boolean).join(', ') || null,
      status: (data.status ?? 'active').toLowerCase(),
      // purok_id must be set — defaults to staff's own purok via RLS
    };
    create.mutate(payload);
    setAddModalOpen(false);
  };

  const handleUpdateResident = (data) => {
    if (!selectedResident) return;
    const payload = {
      first_name: data.firstName,
      middle_name: data.middleName || null,
      last_name: data.lastName,
      suffix: data.suffix || null,
      date_of_birth: data.birthdate || null,
      sex: data.gender === 'Male' ? 'M' : data.gender === 'Female' ? 'F' : null,
      contact_number: data.contactNumber || null,
      address_line: [data.houseNo, data.street, data.purok, data.barangay].filter(Boolean).join(', ') || null,
      status: (data.status ?? 'active').toLowerCase(),
    };
    update.mutate({ id: selectedResident._raw?.id ?? selectedResident.id, payload });
    setEditModalOpen(false);
    setSelectedResident(null);
  };

  const handleConfirmArchive = () => {
    if (selectedResident) archive.mutate(selectedResident._raw?.id ?? selectedResident.id);
    setArchiveModalOpen(false);
    setSelectedResident(null);
  };

  const handleConfirmDelete = () => {
    if (selectedResident) remove.mutate(selectedResident._raw?.id ?? selectedResident.id);
    setDeleteModalOpen(false);
    setSelectedResident(null);
  };

  return (
    <div className="min-h-screen flex bg-[#F3F7F3]">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-auto relative">
        <DashboardHeader
          title="Resident"
          userName={profile?.full_name ?? ''}
          userRole={profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : ''}
          onLogout={handleLogout}
          onMenuToggle={() => setSidebarOpen((o) => !o)}
        />

        <section className="px-5 py-7">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h1 className="mb-10 font-semibold text-[25px]">Resident List</h1>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <SearchBox
                  value={search}
                  onChange={(v) => { setSearch(v); setPage(1); }}
                  placeholder="Search"
                />
                <div className="flex items-center gap-2">
                  <SortFilter value={sortBy} onChange={setSortBy} />
                  <OrderFilter value={order} onChange={setOrder} />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(true)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium bg-[#005F02] text-white hover:bg-[#004A01] transition-colors whitespace-nowrap"
                >
                  Add New Resident
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin w-8 h-8 border-4 border-[#005F02] border-t-transparent rounded-full" />
              </div>
            ) : (
              <ResidentTable
                residents={tableResidents}
                onEditResident={(r) => { setSelectedResident(r); setEditModalOpen(true); }}
                onArchiveResident={(r) => { setSelectedResident(r); setArchiveModalOpen(true); }}
                onDeleteResident={(r) => { setSelectedResident(r); setDeleteModalOpen(true); }}
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

      <ResidentAddEdit
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddResident}
        mode="add"
      />
      <ResidentAddEdit
        isOpen={editModalOpen}
        onClose={() => { setEditModalOpen(false); setSelectedResident(null); }}
        onSubmit={handleUpdateResident}
        initialData={selectedResident}
        mode="edit"
      />
      <ArchiveModal
        isOpen={archiveModalOpen}
        title="Resident"
        message="This record will be archived and removed from the active list."
        onConfirm={handleConfirmArchive}
        onCancel={() => { setArchiveModalOpen(false); setSelectedResident(null); }}
      />
      <DeleteModal
        isOpen={deleteModalOpen}
        title="Resident"
        message="This action is permanent and cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => { setDeleteModalOpen(false); setSelectedResident(null); }}
      />
    </div>
  );
}