import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import { EidOverview, EidCard, EidAddEditModal, EidApplicationsTab, ReviewApplicationModal } from '../components/EId';
import { SearchBox, SortFilter, OrderFilter, StatusFilter, Pagination, DeactiveModal, DeleteModal } from '../../../shared';
import { useEids, useEidStats, useMutateEid, useEidApplicationStats } from '../../../hooks/queries/eid/useEids';
import { useEidFilters } from '../../../store/filterStore';
import { useAuth } from '../../../hooks/auth/useAuth';
import { useAuthStore } from '../../../store/authStore';
import { signOut } from '../../../services/supabase/authService';
import { uploadResidentPhoto } from '../../../services/supabase/residentService';
import toast from 'react-hot-toast';

export default function Eid() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab,   setActiveTab]   = useState('issued');
  const [selectedEid, setSelectedEid] = useState(null);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eidFormModalOpen, setEidFormModalOpen] = useState(false);
  const [eidFormMode, setEidFormMode] = useState('create');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const navigate = useNavigate();
  const { profile } = useAuth();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const search    = useEidFilters((s) => s.search);
  const sortBy    = useEidFilters((s) => s.sortBy);
  const order     = useEidFilters((s) => s.order);
  const page      = useEidFilters((s) => s.page);
  const pageSize  = useEidFilters((s) => s.pageSize);
  const setSearch = useEidFilters((s) => s.setSearch);
  const setSortBy = useEidFilters((s) => s.setSortBy);
  const setOrder  = useEidFilters((s) => s.setOrder);
  const setPage   = useEidFilters((s) => s.setPage);

  const { data, isLoading } = useEids();
  const { data: stats } = useEidStats();
  const { data: appStats } = useEidApplicationStats();
  const { issue, suspend, remove } = useMutateEid();

  const pendingCount = appStats?.pending ?? 0;
  const eids = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalEntries = data?.total ?? 0;

  const cardEids = eids.map((e) => {
    const r = e.residents;
    const fullName = r
      ? `${r.first_name}${r.middle_name ? ' ' + r.middle_name : ''} ${r.last_name}${r.suffix ? ' ' + r.suffix : ''}`.trim()
      : '—';
    const address = r ? r.address_line ?? r.puroks?.name ?? '—' : '—';
    return {
      id:          e.id,
      idNumber:    e.eid_number,
      name:        fullName,
      address,
      status:      e.status ? e.status.charAt(0).toUpperCase() + e.status.slice(1) : '—',
      issuedAt:    e.issued_at    ?? null,
      expiresAt:   e.expires_at   ?? null,
      qrToken:     e.qr_token     ?? null,
      photoUrl:    r?.photo_url   ?? null,
      sex:         r?.sex         ? r.sex.charAt(0).toUpperCase() : '—',
      dateOfBirth: r?.date_of_birth ?? null,
      bloodType:   r?.blood_type  ?? null,
      civilStatus: r?.civil_status ?? null,
      _raw: e,
    };
  });

  const overviewStats = {
    total:       stats?.total ?? 0,
    active:      stats?.active ?? 0,
    pending:     pendingCount,
    deactivated: (stats?.suspended ?? 0) + (stats?.revoked ?? 0),
  };

  const handleLogout = async () => {
    try { await signOut(); clearAuth(); navigate('/login', { replace: true }); }
    catch (err) { toast.error(err.message ?? 'Logout failed.'); }
  };

  const handleConfirmDeactivate = () => {
    if (selectedEid) suspend.mutate(selectedEid._raw?.id ?? selectedEid.id);
    setDeactivateModalOpen(false);
    setSelectedEid(null);
  };

  const handleConfirmDelete = () => {
    if (selectedEid) remove.mutate(selectedEid._raw?.id ?? selectedEid.id);
    setDeleteModalOpen(false);
    setSelectedEid(null);
  };

  return (
    <div className="min-h-screen flex bg-[#F3F7F3]">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-auto">
        <DashboardHeader
          title="eID"
          userName={profile?.full_name ?? ''}
          userRole={profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : ''}
          onLogout={handleLogout}
          onMenuToggle={() => setSidebarOpen((o) => !o)}
        />

        <section className="px-5 py-7">
          <EidOverview stats={overviewStats} />

          {/* ── Tab switcher ── */}
          <div className="flex gap-1 mb-5 border-b border-gray-200">
            <button type="button"
              onClick={() => setActiveTab('issued')}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'issued'
                  ? 'border-[#005F02] text-[#005F02]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              Issued eIDs
            </button>
            <button type="button"
              onClick={() => setActiveTab('applications')}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'applications'
                  ? 'border-[#005F02] text-[#005F02]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              Applications
              {pendingCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>

          {/* ── Applications tab ── */}
          {activeTab === 'applications' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h1 className="mb-6 font-semibold text-[25px]">eID Applications</h1>
              <EidApplicationsTab />
            </div>
          )}

          {/* ── Issued eIDs tab ── */}
          {activeTab === 'issued' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                  <div className="flex items-center gap-2">
                    <OrderFilter value={order} onChange={setOrder} />
                    <SortFilter value={sortBy} onChange={setSortBy} />
                  </div>
                  <SearchBox
                    value={search}
                    onChange={(v) => { setSearch(v); setPage(1); }}
                    placeholder="Search eID"
                  />
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(true)}
                  className="inline-flex justify-center whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-medium border border-[#E6C36A] bg-[#FFFFFF] text-[#C58F00] hover:bg-orange-100 hover:text-[#E6C36A] transition-colors"
                >
                  Review Application: {pendingCount}
                </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedEid(null); setEidFormMode('create'); setEidFormModalOpen(true); }}
                    className="inline-flex justify-center whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-medium bg-[#005F02] text-white hover:bg-[#004A01] transition-colors"
                  >
                    Create New eID
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin w-8 h-8 border-4 border-[#005F02] border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 justify-items-center">
                  {cardEids.map((eid) => (
                    <EidCard
                      key={eid.id}
                      eid={eid}
                      onEdit={(e) => { setSelectedEid(e); setEidFormMode('edit'); setEidFormModalOpen(true); }}
                      onDeactivate={(e) => { setSelectedEid(e); setDeactivateModalOpen(true); }}
                      onDelete={(e) => { setSelectedEid(e); setDeleteModalOpen(true); }}
                    />
                  ))}
                  {cardEids.length === 0 && (
                    <p className="col-span-2 text-center text-gray-400 py-12 text-sm">No eIDs found.</p>
                  )}
                </div>
              )}

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalEntries={totalEntries}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </div>
          )}
        </section>
      </main>

      {/* EID form modal */}
      <EidAddEditModal
        isOpen={eidFormModalOpen}
        onClose={() => { setEidFormModalOpen(false); setSelectedEid(null); }}
        onSubmit={async ({ residentId, hasEid, eidStatus, photoUrl }) => {
          if (hasEid && eidStatus === 'active') {
            toast.error('This resident already has an active eID.');
            return;
          }
          try {
            await issue.mutateAsync(residentId);
            if (photoUrl) {
              try {
                await uploadResidentPhoto(residentId, photoUrl);
              } catch (photoErr) {
                toast.error('eID issued but photo upload failed. You can re-upload later.');
                console.error('Photo upload error:', photoErr);
              }
            }
            setEidFormModalOpen(false);
            setSelectedEid(null);
          } catch { /* already toasted by mutation */ }
        }}
        initialData={selectedEid}
        mode={eidFormMode}
      />

      <DeactiveModal
        isOpen={deactivateModalOpen}
        title="eID"
        message="This action will suspend the eID. It can be reactivated later."
        onConfirm={handleConfirmDeactivate}
        onCancel={() => { setDeactivateModalOpen(false); setSelectedEid(null); }}
      />
      <DeleteModal
        isOpen={deleteModalOpen}
        title="eID"
        message="This action is permanent and cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => { setDeleteModalOpen(false); setSelectedEid(null); }}
      />

      <ReviewApplicationModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
      />
    </div>
  );
}