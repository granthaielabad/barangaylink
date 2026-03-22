import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import EidApplicationOverview from '../components/eID/EidApplicationOverview';
import { Pagination } from '../../../shared';
import { FiUser, FiEye, FiCheckCircle, FiXCircle, FiClock, FiX } from 'react-icons/fi';
import {
  useEidApplications,
  useMutateEidApplication,
} from '../../../hooks/queries/eid/useEids';
import { useAuth } from '../../../hooks/auth/useAuth';
import { useAuthStore } from '../../../store/authStore';
import { signOut } from '../../../services/supabase/authService';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_CFG = {
  pending:      { label: 'Pending',      cls: 'bg-amber-100 text-amber-700 border-amber-200'  },
  under_review: { label: 'Under Review', cls: 'bg-blue-100  text-blue-700  border-blue-200'   },
  approved:     { label: 'Approved',     cls: 'bg-green-100 text-green-700 border-green-200'  },
  rejected:     { label: 'Rejected',     cls: 'bg-red-100   text-red-600   border-red-200'    },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ── Filter tabs ───────────────────────────────────────────────────────────────
const FILTER_TABS = [
  { key: 'all',          label: 'All' },
  { key: 'pending',      label: 'Pending' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'approved',     label: 'Approved' },
  { key: 'rejected',     label: 'Rejected' },
];

// ── Review Modal ──────────────────────────────────────────────────────────────
function ReviewModal({ app, onClose, onUnderReview, onApprove, onReject, isPending }) {
  const [remarks, setRemarks] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const fullName = [app.first_name, app.middle_name, app.last_name, app.suffix]
    .filter(Boolean).join(' ') || '—';

  const fmt = (d) => d
    ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  const fmtDob = (d) => {
    if (!d) return '—';
    const [y, m, dd] = d.split('-');
    return dd ? `${m}/${dd}/${y}` : d;
  };

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative bg-white w-full max-w-xl rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-6 py-3 bg-[#F1F7F2] border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FiEye className="w-5 h-5 text-[#005F02]" />
            <h2 className="text-lg font-semibold text-gray-900">Review eID Application</h2>
          </div>
          <button type="button" onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          <div className="flex items-center gap-3">
            <StatusBadge status={app.status} />
            <span className="text-xs text-gray-500 capitalize">{app.type} application</span>
            <span className="text-xs text-gray-400 ml-auto">Submitted: {fmt(app.submitted_at)}</span>
          </div>

          <div className="flex gap-5">
            <div className="w-24 h-28 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
              {app.photo_url
                ? <img src={app.photo_url} alt="Applicant" className="w-full h-full object-cover" />
                : <FiUser className="w-8 h-8 text-gray-300" />}
            </div>
            <div className="flex-1 space-y-2 text-sm">
              <p className="font-bold text-gray-900 text-base">{fullName}</p>
              <p className="text-gray-500 font-mono text-xs">{app.residents?.resident_no ?? '—'}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                {[
                  ['ID Number',     app.id_number],
                  ['Date of Birth', fmtDob(app.date_of_birth)],
                  ['Sex',           app.sex === 'M' ? 'Male' : app.sex === 'F' ? 'Female' : app.sex ?? '—'],
                  ['Contact',       app.contact_number],
                  ['Email',         app.email],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className="text-gray-800 font-medium text-xs">{value || '—'}</p>
                  </div>
                ))}
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Address</p>
                  <p className="text-gray-800 font-medium text-xs">{app.address_line || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {app.remarks && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 mb-1">Remarks</p>
              <p className="text-sm text-gray-700">{app.remarks}</p>
            </div>
          )}

          {showRejectInput && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Reason for rejection <span className="text-red-500">*</span>
              </label>
              <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                placeholder="Provide a reason for the resident…" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 bg-[#F1F7F2] border-t border-gray-200">
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
            Close
          </button>
          <div className="flex gap-2">
            {!showRejectInput && app.status !== 'approved' && app.status !== 'rejected' && (
              <button type="button" onClick={() => setShowRejectInput(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm font-medium hover:bg-red-100 transition-colors">
                <FiXCircle className="w-4 h-4" /> Reject
              </button>
            )}
            {showRejectInput && (
              <>
                <button type="button" onClick={() => setShowRejectInput(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button type="button" disabled={!remarks.trim() || isPending}
                  onClick={() => onReject(app.id, remarks)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-40 transition-colors">
                  Confirm Reject
                </button>
              </>
            )}
            {app.status === 'pending' && !showRejectInput && (
              <button type="button" disabled={isPending} onClick={() => onUnderReview(app.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors">
                <FiClock className="w-4 h-4" /> Mark Under Review
              </button>
            )}
            {app.status === 'under_review' && !showRejectInput && (
              <button type="button" disabled={isPending}
                onClick={() => onApprove(app.id, app.residents?.id, app.photo_url)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#005F02] text-white text-sm font-semibold hover:bg-[#004A01] disabled:opacity-40 transition-colors">
                <FiCheckCircle className="w-4 h-4" /> Approve & Issue eID
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function EidApplications() {
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page,         setPage]         = useState(1);
  const [selectedApp,  setSelectedApp]  = useState(null);

  const navigate  = useNavigate();
  const { profile } = useAuth();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const { data, isLoading }     = useEidApplications({ page, pageSize: PAGE_SIZE, status: statusFilter });
  const { data: allData }       = useEidApplications({ page: 1, pageSize: 1000, status: 'all' });
  const { setUnderReview, approve, reject } = useMutateEidApplication();

  const applications = data?.data       ?? [];
  const totalPages   = data?.totalPages ?? 1;
  const totalEntries = data?.total      ?? 0;
  const isPending    = setUnderReview.isPending || approve.isPending || reject.isPending;

  // Derive counts from the full unfiltered dataset
  const allApplications = allData?.data ?? [];
  const rawStats = {
    all:          allApplications.length,
    pending:      allApplications.filter((a) => a.status === 'pending').length,
    under_review: allApplications.filter((a) => a.status === 'under_review').length,
    approved:     allApplications.filter((a) => a.status === 'approved').length,
    rejected:     allApplications.filter((a) => a.status === 'rejected').length,
  };

  const overviewStats = {
    new_apps:       rawStats.pending,
    pending_review: rawStats.under_review,
    ready_printing: rawStats.approved,
    rejected:       rawStats.rejected,
  };

  const handleLogout = async () => {
    try { await signOut(); clearAuth(); navigate('/login', { replace: true }); }
    catch (err) { toast.error(err.message ?? 'Logout failed.'); }
  };

  const handleUnderReview = (id) =>
    setUnderReview.mutate(id, { onSuccess: () => setSelectedApp(null) });

  const handleApprove = (applicationId, residentId, photoUrl) =>
    approve.mutate({ applicationId, residentId, photoUrl }, { onSuccess: () => setSelectedApp(null) });

  const handleReject = (id, remarks) =>
    reject.mutate({ id, remarks }, { onSuccess: () => setSelectedApp(null) });

  const fmt = (d) => d
    ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  return (
    <div className="flex h-screen bg-[#F3F7F3]">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-auto">
        <DashboardHeader
          title="eID Applications"
          userName={profile?.full_name ?? ''}
          userRole={profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : ''}
          onLogout={handleLogout}
          onMenuToggle={() => setSidebarOpen((o) => !o)}
        />

        <section className="px-5 py-7">
          <EidApplicationOverview stats={overviewStats} />

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">

            {/* Filter tabs */}
            <div className="flex gap-1 border-b border-gray-200 overflow-x-auto mb-5">
              {FILTER_TABS.map((tab) => (
                <button key={tab.key} type="button"
                  onClick={() => { setStatusFilter(tab.key); setPage(1); }}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    statusFilter === tab.key
                      ? 'border-[#005F02] text-[#005F02]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                  {tab.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    statusFilter === tab.key ? 'bg-[#005F02]/10 text-[#005F02]' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {rawStats?.[tab.key === 'all' ? 'all' : tab.key] ?? 0}
                  </span>
                </button>
              ))}
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin w-8 h-8 border-4 border-[#005F02] border-t-transparent rounded-full" />
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">
                No {statusFilter !== 'all' ? statusFilter.replace('_', ' ') : ''} applications found.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Applicant', 'Type', 'Submitted', 'Status', 'Action'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {applications.map((app) => {
                      const fullName = [app.first_name, app.last_name].filter(Boolean).join(' ') || '—';
                      return (
                        <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                                {app.photo_url
                                  ? <img src={app.photo_url} alt="" className="w-full h-full object-cover" />
                                  : <FiUser className="w-4 h-4 text-gray-400" />}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">{fullName}</p>
                                <p className="text-xs text-gray-400 font-mono">{app.residents?.resident_no ?? '—'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 capitalize text-gray-600">{app.type}</td>
                          <td className="px-4 py-3 text-gray-500">{fmt(app.submitted_at)}</td>
                          <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                          <td className="px-4 py-3">
                            <button type="button" onClick={() => setSelectedApp(app)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-100 transition-colors">
                              <FiEye className="w-3.5 h-3.5" /> Review
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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

      {selectedApp && (
        <ReviewModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onUnderReview={handleUnderReview}
          onApprove={handleApprove}
          onReject={handleReject}
          isPending={isPending}
        />
      )}
    </div>
  );
}