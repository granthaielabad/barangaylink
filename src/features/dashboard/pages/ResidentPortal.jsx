import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import DashboardHeader from '../components/DashboardHeader';
import { useAuth } from '../../../hooks/auth/useAuth';
import { useAuthStore } from '../../../store/authStore';
import { signOut } from '../../../services/supabase/authService';
import toast from 'react-hot-toast';
import { FiUser, FiCreditCard } from 'react-icons/fi';
import LogoDashboard from '../../../assets/images/logo-dashboard.svg';

const NAV_SECTIONS = [
  {
    title: 'General',
    items: [
      { to: '/resident-portal/profile', label: 'Resident Profile', icon: FiUser },
      { to: '/resident-portal/eid',     label: 'eID',              icon: FiCreditCard },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// SIDEBAR CONTENT (shared between mobile & desktop)
// ─────────────────────────────────────────────────────────────
function SidebarContent({ onClose }) {
  return (
    <aside className="w-68 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6">
        <img src={LogoDashboard} alt="BarangayLink" className="w-full" />
      </div>

      <hr className="border-gray-400 opacity-20 mb-5" />

      {/* Nav */}
      <nav className="px-4 pt-5 pb-6 flex-1">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-6">
            <p className="px-3 text-[14px] font-semibold text-gray-500 uppercase tracking-wider">
              {section.title}
            </p>
            <div className="mt-2 space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      [
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-lg transition-colors',
                        isActive
                          ? 'bg-[#005F02]/15 text-[#005F02] font-semibold'
                          : 'text-gray-700 hover:bg-gray-100',
                      ].join(' ')
                    }
                  >
                    <Icon className="w-6 h-6" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────
// PORTAL SIDEBAR (mobile overlay + desktop static)
// ─────────────────────────────────────────────────────────────
function PortalSidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Desktop — always visible */}
      <div className="hidden lg:block shrink-0 sticky top-0 h-screen">
        <SidebarContent onClose={onClose} />
      </div>

      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Mobile slide-in */}
      <div
        className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent onClose={onClose} />
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN LAYOUT — default export
// Exported as ResidentPortalLayout via dashboard/index.js barrel
// ─────────────────────────────────────────────────────────────
export default function ResidentPortal() {
  const [sidebarOpen,       setSidebarOpen]       = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const navigate    = useNavigate();
  const location    = useLocation();
  const { profile } = useAuth();
  const clearAuth   = useAuthStore((s) => s.clearAuth);

  const pageTitle = location.pathname.includes('/eid') ? 'eID' : 'Resident Profile';

  const handleLogout = async () => {
    try {
      await signOut();
      clearAuth();
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err?.message ?? 'Logout failed.');
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <PortalSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          title={pageTitle}
          userName={profile?.full_name ?? 'Barangay Resident'}
          userRole="Resident"
          onLogout={() => setLogoutConfirmOpen(true)}
          onMenuToggle={() => setSidebarOpen((o) => !o)}
        />

        {/* Child routes rendered here */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* ── Logout Confirmation Modal ─────────────────────── */}
      {logoutConfirmOpen && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setLogoutConfirmOpen(false); }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Confirm Logout</h3>
              <p className="text-sm text-gray-500 mt-1">Are you sure you want to log out?</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setLogoutConfirmOpen(false)}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-5 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}