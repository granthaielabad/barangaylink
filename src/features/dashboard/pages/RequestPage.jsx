import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiExternalLink } from 'react-icons/fi';
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
} from '../../../hooks/queries/documentRequests/useDocumentRequests';
import { REQUEST_STATUS_FILTER_OPTIONS, SORT_FIELDS } from '../../../core/constants';

const PAGE_SIZE = 8;

// Map DB status → frontend display shape used by RequestTable / ViewRequestModal
function toTableRow(req) {
  const r = req.residents;
  const fullName = r
    ? [r.first_name, r.middle_name, r.last_name, r.suffix].filter(Boolean).join(' ')
    : '—';

  const statusLabel =
    req.status === 'released'   ? 'Approved'   :
    req.status === 'processing' ? 'Processing' :
    req.status === 'pending'    ? 'Pending'    :
    req.status === 'ready'      ? 'Ready'      :
    req.status === 'rejected'   ? 'Rejected'   : req.status;

  return {
    id:          req.control_number ?? req.id,
    _rawId:      req.id,
    name:        fullName,
    type:        req.document_type,
    date:        req.requested_at
                   ? new Date(req.requested_at).toLocaleDateString('en-US')
                   : '—',
    status:      statusLabel,
    purpose:     req.purpose,
    address:     r?.address_line ?? '—',
    civilStatus: r?.civil_status ?? '—',
    birthDate:   r?.date_of_birth
                   ? new Date(r.date_of_birth).toLocaleDateString('en-US')
                   : '—',
    residentId:  r?.id_number ?? r?.resident_no ?? '—',
    admin_notes: req.admin_notes ?? '',
    estimatedDate: '3-5 business days',
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

  const { data, isLoading } = useDocumentRequests({
    page, pageSize: PAGE_SIZE, search,
    status: status === 'approved' ? 'released' : status,
    sortBy, order,
  });
  const { data: stats = { total: 0, pending: 0, processing: 0, approved: 0 } } =
    useDocumentRequestStats();

  const requests   = (data?.data ?? []).map(toTableRow);
  const totalPages  = data?.totalPages ?? 1;
  const totalEntries = data?.total ?? 0;

  const handleLogout = async () => {
    try { await signOut(); clearAuth(); navigate('/login', { replace: true }); }
    catch (err) { toast.error(err.message ?? 'Logout failed.'); }
  };

  const handleView = (req) => {
    setSelectedRequest(req);
    setIsViewModalOpen(true);
  };

  return (
    <div className="min-h-screen flex bg-[#FFFBFC]">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-auto">
        <DashboardHeader
          title="Certificate Requests (Read-Only)"
          userName={profile?.full_name ?? ''}
          userRole={profile?.role
            ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
            : ''}
          onLogout={handleLogout}
          onMenuToggle={() => setSidebarOpen((o) => !o)}
        />

        <section className="px-5 py-7">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
             <div>
                <h1 className="text-[25px] font-bold text-gray-900">Document Requests</h1>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  Monitoring requests from the external Document System. 
                </p>
             </div>

             <a 
              href="https://barangayease.web.app/admin" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-[#8C0B1A] text-white font-bold rounded-xl shadow-lg hover:bg-[#7A0915] transition-all"
            >
              <FiFileText className="w-5 h-5" />
              Manage in External System
              <FiExternalLink className="w-4 h-4 opacity-70" />
            </a>
          </div>

          <RequestStats stats={stats} />

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-6">
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
                <div className="animate-spin w-8 h-8 border-4 border-[#8C0B1A] border-t-transparent rounded-full" />
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
          isReadOnly={true}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedRequest(null);
          }}
        />
      )}
    </div>
  );
}
