import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

/**
 * ProtectedRoute — guards routes based on authentication and role.
 * Usage:
 *   <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
 *     <Route path="/admin" element={<AdminDashboard />} />
 *   </Route>
 */
export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role?.toUpperCase();
    if (!allowedRoles.map((r) => r.toUpperCase()).includes(userRole)) {
      // Redirect to the user's own dashboard if they try to access a route they shouldn't
      const roleRedirects = { ADMIN: '/admin', FACULTY: '/faculty', STUDENT: '/student' };
      return <Navigate to={roleRedirects[userRole] || '/login'} replace />;
    }
  }

  return <Outlet />;
}
