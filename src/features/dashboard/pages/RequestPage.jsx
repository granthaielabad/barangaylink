import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import RequestStats from '../components/Requests/RequestStats';
import RequestTable from '../components/Requests/RequestTable';
import ViewRequestModal from '../components/Requests/RequestModals/ViewRequestModal';
import { SortFilter, OrderFilter, StatusFilter, Pagination, SearchBox } from '../../../shared';
import { useAuth } from '../../../hooks/auth/useAuth';
import { useAuthStore } from '../../../store/authStore';
import { signOut } from '../../../services/supabase/authService';
import {
  useDocumentRequests,
  useDocumentRequestStats,
  useMutateDocumentRequest,
} from '../../../hooks/queries/documentRequests/useDocumentRequests';
import { REQUEST_STATUS_FILTER_OPTIONS, SORT_FIELDS } from '../../../core/constants';

const PAGE_SIZE = 8;

// Map DB status → frontend display shape used by RequestTable / ViewRequestModal
function toTableRow(req) {
  const r = req.residents;
  const fullName = r
    ? [r.first_name, r.middle_name, r.last_name, r.suffix].filter(Boolean).join(' ')
    : '—';

  // Normalise status label: 'released' shows as 'Approved' to match frontend design
  const statusLabel =
    req.status === 'released'   ? 'Approved'   :
    req.status === 'processing' ? 'Processing' :
    req.status === 'pending'    ? 'Pending'    :
    req.status === 'ready'      ? 'Ready'      :
    req.status === 'rejected'   ? 'Rejected'   : req.status;

  const feeLabel =
    req.payment_status === 'free' ? 'Free' :
    req.payment_status === 'paid' ? `₱${req.fee_amount} - Paid` :
    `₱${req.fee_amount} - Unpaid`;

  return {
    // Fields ViewRequestModal reads
    id:          req.control_number ?? req.id,
    _rawId:      req.id,
    name:        fullName,
    type:        req.document_type,
    date:        req.requested_at
                   ? new Date(req.requested_at).toLocaleDateString('en-US')
                   : '—',
    status:      statusLabel,
    fee:         feeLabel,
    purpose:     req.purpose,
    address:     r?.address_line ?? '—',
    civilStatus: r?.civil_status ?? '—',
    birthDate:   r?.date_of_birth
                   ? new Date(r.date_of_birth).toLocaleDateString('en-US')
                   : '—',
    residentId:  r?.id_number ?? r?.resident_no ?? '—',
    admin_notes: req.admin_notes ?? '',
    estimatedDate: '3-5 business days',
    // Keep raw for mutations
    _raw: req,
  };
}

export default function RequestPage() {
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [search,           setSearch]           = useState('');
  const [status,           setStatus]           = useState('all');
  const [sortBy,           setSortBy]           = useState('requested_at');
  const [order,            setOrder]            = useState('desc');
  const [page,             setPage]             = useState(1);
  const [selectedRequest,  setSelectedRequest]  = useState(null);
  const [isViewModalOpen,  setIsViewModalOpen]  = useState(false);

  const navigate  = useNavigate();
  const { profile } = useAuth();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  // ── Data ────────────────────────────────────────────────────────────────────
  const { data, isLoading } = useDocumentRequests({
    page, pageSize: PAGE_SIZE, search,
    status: status === 'approved' ? 'released' : status, // UI says Approved, DB says released
    sortBy, order,
  });
  const { data: stats = { total: 0, pending: 0, processing: 0, approved: 0 } } =
    useDocumentRequestStats();
  const { process, approve, reject } = useMutateDocumentRequest();

  const requests   = (data?.data ?? []).map(toTableRow);
  const totalPages  = data?.totalPages ?? 1;
  const totalEntries = data?.total ?? 0;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try { await signOut(); clearAuth(); navigate('/login', { replace: true }); }
    catch (err) { toast.error(err.message ?? 'Logout failed.'); }
  };

  const handleView = (req) => {
    setSelectedRequest(req);
    setIsViewModalOpen(true);
  };

  // type: 'process' | 'approve' | 'reject'
  const handleRequestAction = (id, type, adminNotes) => {
    // id here is the display id (control_number); we need the raw UUID
    const raw = requests.find((r) => r.id === id)?._rawId ?? id;
    if (type === 'process') process.mutate({ id: raw, adminNotes });
    if (type === 'approve') approve.mutate({ id: raw, adminNotes });
    if (type === 'reject')  reject.mutate({ id: raw, adminNotes });
  };

  return (
    <div className="min-h-screen flex bg-[#F3F7F3]">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-auto">
        <DashboardHeader
          title="Certificate Request"
          userName={profile?.full_name ?? ''}
          userRole={profile?.role
            ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
            : ''}
          onLogout={handleLogout}
          onMenuToggle={() => setSidebarOpen((o) => !o)}
        />

        <section className="px-5 py-7">
          <RequestStats stats={stats} />

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap items-center gap-3">
                <SearchBox
                  value={search}
                  onChange={(v) => { setSearch(v); setPage(1); }}
                  placeholder="Search by control no. or type"
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                    Filter By:
                  </span>
                  <StatusFilter
                    value={status}
                    onChange={(v) => { setStatus(v); setPage(1); }}
                    options={REQUEST_STATUS_FILTER_OPTIONS}
                  />
                  <SortFilter
                    value={sortBy}
                    onChange={setSortBy}
                    options={SORT_FIELDS.REQUESTS}
                  />
                  <OrderFilter value={order} onChange={setOrder} />
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin w-8 h-8 border-4 border-[#005F02] border-t-transparent rounded-full" />
              </div>
            ) : (
              <RequestTable requests={requests} onViewRequest={handleView} />
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

      {isViewModalOpen && (
        <ViewRequestModal
          key={selectedRequest?._rawId}
          isOpen={isViewModalOpen}
          request={selectedRequest}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedRequest(null);
          }}
          onAction={handleRequestAction}
        />
      )}
    </div>
  );
}