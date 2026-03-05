// ═══════════════════════════════════════════════════════════════
// Blocks access based on user role.
// Usage: <RoleGuard roles={['superadmin', 'staff']} />
// ═══════════════════════════════════════════════════════════════
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/auth/useAuth';

export default function RoleGuard({ roles = [] }) {
  const { role } = useAuth();

  if (!roles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}