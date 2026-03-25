import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import NotificationListContent from '../components/Notifications/NotificationListContent';
import { useAuth } from '../../../hooks/auth/useAuth';
import { useAuthStore } from '../../../store/authStore';
import { signOut } from '../../../services/supabase/authService';
import toast from 'react-hot-toast';

const NotificationPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile } = useAuth();

  const navigate  = useNavigate();
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

  return (
    <div className="min-h-screen flex bg-[#F3F7F3]">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-auto">
        <DashboardHeader
          title="Notification"
          userName={profile?.full_name ?? 'Loading...'}
          userRole={profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : ''}
          onLogout={handleLogout}
          onMenuToggle={() => setSidebarOpen((o) => !o)}
        />

        <section className="px-5 py-7 lg:px-10">
          <NotificationListContent />
        </section>
      </main>
    </div>
  );
};

export default NotificationPage;