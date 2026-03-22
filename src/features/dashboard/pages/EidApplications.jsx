import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import { EidApplicationOverview, EidCard } from '../components/EId';
import { SearchBox, SortFilter, StatusFilter, OrderFilter, Pagination } from '../../../shared';
import { useAuth } from '../../../hooks/auth/useAuth';
import { useAuthStore } from '../../../store/authStore';
import { signOut } from '../../../services/supabase/authService';
import toast from 'react-hot-toast';

const MOCK_APPLICATIONS = [
  {
    id: 'app-1',
    eid_number: 'EID-2024-0001',
    status: 'pending_review',
    issued_at: '2024-03-21',
    residents: {
      first_name: 'Juan',
      last_name: 'Dela Cruz',
      address_line: '123 Barangay St., Manila',
      photo_url: null
    }
  },
  {
    id: 'app-2',
    eid_number: 'EID-2024-0002',
    status: 'new_apps',
    issued_at: '2024-03-20',
    residents: {
      first_name: 'Maria',
      last_name: 'Santos',
      address_line: '456 Rizal Ave., Manila',
      photo_url: null
    }
  },
  {
    id: 'app-3',
    eid_number: 'EID-2024-0003',
    status: 'ready_printing',
    issued_at: '2024-03-19',
    residents: {
      first_name: 'Ricardo',
      last_name: 'Dalisay',
      address_line: '789 Quezon Blvd., Manila',
      photo_url: null
    }
  }
];

const APP_STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'new_apps', label: 'New Application' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'ready_printing', label: 'Ready For Printing' },
  { value: 'rejected', label: 'Rejected' },
];

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Date Applied' },
  { value: 'name', label: 'Resident Name' },
];

export default function EidApplications() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);

  const navigate = useNavigate();
  const { profile } = useAuth();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const handleLogout = async () => {
    try {
      await signOut();
      clearAuth();
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.message ?? 'Logout failed.');
    }
  };

  const handleApprove = (eid) => {
    toast.success(`Approved application for ${eid.name}`);
  };

  const handleReject = (eid) => {
    toast.error(`Rejected application for ${eid.name}`);
  };

  const handleView = (eid) => {
    toast(`Viewing application for ${eid.name}`);
  };

  const handlePrint = () => {
    toast.success('Preparing print view...');
    window.print();
  };

  // Mock mapping for local view
  const cardEids = MOCK_APPLICATIONS.map(app => ({
    id: app.id,
    idNumber: app.eid_number,
    name: `${app.residents.first_name} ${app.residents.last_name}`,
    address: app.residents.address_line,
    status: app.status === 'new_apps' ? 'New' : 
            app.status === 'pending_review' ? 'In Review' : 
            app.status === 'ready_printing' ? 'Ready' : 'Rejected',
    issuedAt: app.issued_at,
    photoUrl: app.residents.photo_url,
    _raw: app
  }));

  const stats = {
    new_apps: 5,
    pending_review: 12,
    ready_printing: 8,
    rejected: 3
  };

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
          <EidApplicationOverview stats={stats} />

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <SearchBox
                  value={search}
                  onChange={setSearch}
                  placeholder="Search application"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Filter By:</span>
                    <StatusFilter
                      value={status}
                      onChange={setStatus}
                      options={APP_STATUS_OPTIONS}
                    />
                    <SortFilter
                      value={sortBy}
                      onChange={setSortBy}
                      options={SORT_OPTIONS}
                    />
                    <OrderFilter value={order} onChange={setOrder} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {cardEids.map((eid) => (
                <EidCard
                  key={eid.id}
                  eid={eid}
                  onPrint={handlePrint}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onView={handleView}
                  status={eid.status}
                />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={1}
                onPageChange={setPage}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
