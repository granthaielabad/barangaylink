import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import RequestStats from '../components/Requests/RequestStats';
import RequestTable from '../components/Requests/RequestTable';
import ViewRequestModal from '../components/Requests/RequestModals/ViewRequestModal';
import { 
  SortFilter, 
  OrderFilter, 
  StatusFilter, 
  Pagination, 
  SearchBox,
  ExportButton
} from '../../../shared';
import { useAuth } from '../../../hooks/auth/useAuth';
import { useAuthStore } from '../../../store/authStore';
import { signOut } from '../../../services/supabase/authService';
import { REQUEST_STATUS_FILTER_OPTIONS, SORT_FIELDS } from '../../../core/constants';

// Mock data based on the screenshot
const MOCK_REQUESTS = [
  { id: '1234-123-12', name: 'JM Melca C. Nueva', type: 'Barangay Clearance', date: '01/21/2026', status: 'Pending', fee: '₱50 - Unpaid' },
  { id: '2345-234-23', name: 'Raine Heart Nacion', type: 'Barangay Indigency', date: '02/21/2026', status: 'Approved', fee: 'Free' },
  { id: '3456-345-34', name: 'Ariana Roxanne Malegro', type: 'Barangay Residency', date: '01/01/2026', status: 'Pending', fee: '₱50 - Unpaid' },
  { id: '4567-456-45', name: 'Sophia Nicole Cecillano', type: 'Barangay Residency', date: '01/01/2026', status: 'Pending', fee: '₱50 - Unpaid' },
  { id: '5678-567-56', name: 'Carlo Jeus Cacho', type: 'Barangay Clearance', date: '01/01/2026', status: 'Processing', fee: '₱50 - Paid' },
  { id: '6789-678-67', name: 'Grant Haeil Abad', type: 'Barangay Indigency', date: '01/01/2026', status: 'Approved', fee: 'Free' },
  { id: '7891-789-78', name: 'Murphy De Guzman', type: 'Barangay Clearance', date: '01/01/2026', status: 'Rejected', fee: '₱50 - Unpaid' },
  { id: '8912-891-89', name: 'Jhon Carlo T. Millan', type: 'Barangay Residency', date: '01/01/2026', status: 'Approved', fee: '₱50 - Paid' },
];

const MOCK_STATS = {
  total: 10,
  pending: 2,
  processing: 5,
  approved: 3,
};

export default function RequestPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const pageSize = 8;

  const navigate = useNavigate();
  const { profile } = useAuth();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const handleLogout = async () => {
    try { await signOut(); clearAuth(); navigate('/login', { replace: true }); }
    catch (err) { toast.error(err.message ?? 'Logout failed.'); }
  };

  const handleView = (req) => {
    setSelectedRequest(req);
    setIsViewModalOpen(true);
  };

  const handleRequestAction = (id, type, notes) => {
    toast.success(`Request ${id} marked as ${type}. Notes: ${notes || 'None'}`);
    // In a real app, I'd trigger a mutation here
  };

  return (
    <div className="min-h-screen flex bg-[#F3F7F3]">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-auto">
        <DashboardHeader
          title="Certificate Request"
          userName={profile?.full_name ?? ''}
          userRole={profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : ''}
          onLogout={handleLogout}
          onMenuToggle={() => setSidebarOpen(o => !o)}
        />

        <section className="px-5 py-7">
          <RequestStats stats={MOCK_STATS} />

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap items-center gap-3">
                <SearchBox
                  value={search}
                  onChange={(v) => { setSearch(v); setPage(1); }}
                  placeholder="Search"
                />
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
                <OrderFilter 
                  value={order} 
                  onChange={setOrder} 
                />
              </div>
            </div>

            <RequestTable 
              requests={MOCK_REQUESTS} 
              onViewRequest={handleView} 
            />

            <Pagination
              currentPage={page}
              totalPages={1}
              totalEntries={MOCK_REQUESTS.length}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </div>
        </section>
      </main>

      {isViewModalOpen && (
        <ViewRequestModal
          key={selectedRequest?.id}
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
