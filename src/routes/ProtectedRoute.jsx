// ═══════════════════════════════════════════════════════════════
// Redirects unauthenticated users to /login.
// Shows a loading spinner while session is being determined.
// ═══════════════════════════════════════════════════════════════
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/auth/useAuth';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-[#005F02] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}