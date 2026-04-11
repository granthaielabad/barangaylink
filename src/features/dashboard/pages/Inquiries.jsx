import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import { SortFilter, OrderFilter, StatusFilter, Pagination, SearchBox, ArchiveModal } from '../../../shared';
import { useInquiryMessages, useMutateInquiry } from '../../../hooks/queries/contact/useContact';
import { useInquiryFilters } from '../../../store/filterStore';
import { useAuth } from '../../../hooks/auth/useAuth';
import { useAuthStore } from '../../../store/authStore';
import { signOut } from '../../../services/supabase/authService';
import { INQUIRY_STATUS_FILTER_OPTIONS, SORT_FIELDS } from '../../../core/constants';
import { FiMail, FiEye, FiArchive, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Inquiries() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);

  const navigate = useNavigate();
  const { profile } = useAuth();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const search = useInquiryFilters((s) => s.search);
  const sortBy = useInquiryFilters((s) => s.sortBy);
  const order = useInquiryFilters((s) => s.order);
  const status = useInquiryFilters((s) => s.status);
  const page = useInquiryFilters((s) => s.page);
  const pageSize = useInquiryFilters((s) => s.pageSize);
  const setSearch = useInquiryFilters((s) => s.setSearch);
  const setSortBy = useInquiryFilters((s) => s.setSortBy);
  const setOrder = useInquiryFilters((s) => s.setOrder);
  const setStatus = useInquiryFilters((s) => s.setStatus);
  const setPage = useInquiryFilters((s) => s.setPage);

  const { data, isLoading } = useInquiryMessages();
  const { updateStatus } = useMutateInquiry();

  const inquiries = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalEntries = data?.total ?? 0;

  const handleLogout = async () => {
    try { await signOut(); clearAuth(); navigate('/login', { replace: true }); }
    catch (err) { toast.error(err.message ?? 'Logout failed.'); }
  };

  const handleView = (inquiry) => {
    setSelectedInquiry(inquiry);
    setViewModalOpen(true);
    if (inquiry.status === 'unread') {
      updateStatus.mutate({ id: inquiry.id, status: 'read' });
    }
  };

  const handleArchive = (inquiry) => {
    setSelectedInquiry(inquiry);
    setArchiveModalOpen(true);
  };

  const confirmArchive = () => {
    if (selectedInquiry) {
      updateStatus.mutate({ id: selectedInquiry.id, status: 'archived' }, {
        onSuccess: () => {
          toast.success('Inquiry archived');
          setArchiveModalOpen(false);
          setSelectedInquiry(null);
        }
      });
    }
  };

  const handleMarkAsRead = (id) => {
    updateStatus.mutate({ id, status: 'read' }, {
      onSuccess: () => toast.success('Marked as read')
    });
  };

  return (
    <div className="min-h-screen flex bg-[#F3F7F3]">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-auto relative">
        <DashboardHeader
          title="Inquiries"
          userName={profile?.full_name ?? ''}
          userRole={profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : ''}
          onLogout={handleLogout}
          onMenuToggle={() => setSidebarOpen((o) => !o)}
        />

        <section className="px-5 py-7">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h1 className="mb-10 font-semibold text-[25px]">Contact Form Submissions</h1>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <SearchBox
                  value={search}
                  onChange={(v) => { setSearch(v); setPage(1); }}
                  placeholder="Search by name, email, subject..."
                />
                <div className="flex items-center gap-2">
                  <SortFilter value={sortBy} onChange={setSortBy} options={SORT_FIELDS.INQUIRIES} />
                  <StatusFilter value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={INQUIRY_STATUS_FILTER_OPTIONS} />
                  <OrderFilter value={order} onChange={setOrder} />
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin w-8 h-8 border-4 border-[#005F02] border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 text-sm uppercase tracking-wider">
                      <th className="py-4 px-4 font-semibold">Date</th>
                      <th className="py-4 px-4 font-semibold">Sender</th>
                      <th className="py-4 px-4 font-semibold">Subject & Concern</th>
                      <th className="py-4 px-4 font-semibold text-center">Status</th>
                      <th className="py-4 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {inquiries.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-10 text-center text-gray-400">No inquiries found.</td>
                      </tr>
                    ) : (
                      inquiries.map((inquiry) => (
                        <tr 
                          key={inquiry.id} 
                          className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${inquiry.status === 'unread' ? 'font-bold bg-green-50/30' : ''}`}
                        >
                          <td className="py-4 px-4 whitespace-nowrap text-sm">
                            {new Date(inquiry.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col">
                              <span className="text-gray-900">{inquiry.full_name}</span>
                              <span className="text-xs text-gray-500">{inquiry.email}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col">
                              <span className="text-gray-900 line-clamp-1">{inquiry.subject}</span>
                              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full w-fit text-gray-600 mt-1 capitalize">
                                {inquiry.concern}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                              inquiry.status === 'unread' ? 'bg-blue-100 text-blue-700' :
                              inquiry.status === 'read' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {inquiry.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleView(inquiry)}
                                className="p-2 text-gray-400 hover:text-[#005F02] hover:bg-green-50 rounded-lg transition-all"
                                title="View Message"
                              >
                                <FiEye className="w-5 h-5" />
                              </button>
                              {inquiry.status === 'unread' && (
                                <button 
                                  onClick={() => handleMarkAsRead(inquiry.id)}
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                  title="Mark as Read"
                                >
                                  <FiCheckCircle className="w-5 h-5" />
                                </button>
                              )}
                              {inquiry.status !== 'archived' && (
                                <button 
                                  onClick={() => handleArchive(inquiry)}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  title="Archive"
                                >
                                  <FiArchive className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
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
        </section>
      </main>

      {/* View Message Modal */}
      {viewModalOpen && selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiMail className="w-6 h-6 text-[#005F02]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Inquiry Details</h2>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    Submitted on {new Date(selectedInquiry.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <button onClick={() => setViewModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2">&times;</button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">From</label>
                  <p className="text-gray-900 font-semibold">{selectedInquiry.full_name}</p>
                  <p className="text-sm text-gray-600">{selectedInquiry.email}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Contact Number</label>
                  <p className="text-gray-900">{selectedInquiry.contact_number || 'N/A'}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Concern Type</label>
                <div className="mt-1">
                  <span className="px-3 py-1 bg-[#005F02]/10 text-[#005F02] text-sm font-bold rounded-full capitalize">
                    {selectedInquiry.concern}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Subject</label>
                <p className="text-lg font-bold text-gray-900">{selectedInquiry.subject}</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <label className="text-xs font-bold text-gray-400 uppercase block mb-3">Message</label>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed italic">
                  "{selectedInquiry.message}"
                </p>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setViewModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-all"
              >
                Close
              </button>
              {selectedInquiry.status !== 'archived' && (
                <button 
                  onClick={() => { setViewModalOpen(false); handleArchive(selectedInquiry); }}
                  className="px-6 py-2.5 rounded-xl font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-all flex items-center gap-2"
                >
                  <FiArchive /> Archive
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <ArchiveModal
        isOpen={archiveModalOpen}
        title="Inquiry"
        message="This message will be moved to the archived list."
        onConfirm={confirmArchive}
        onCancel={() => { setArchiveModalOpen(false); setSelectedInquiry(null); }}
      />
    </div>
  );
}
