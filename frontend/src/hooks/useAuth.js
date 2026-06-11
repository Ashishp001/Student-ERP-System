import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import useAuthStore from '../store/authStore';
import { authApi } from '../api';

export default function useAuth() {
  const { user, accessToken, isAuthenticated, setAuth, logout: clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const login = useCallback(async (credentials) => {
    const res = await authApi.login(credentials);
    setAuth(res.data, res.tokens);
    const role = res.data?.role;
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'FACULTY') navigate('/faculty');
    else navigate('/student');
    return res;
  }, [setAuth, navigate]);

  const logout = useCallback(async () => {
    try {
      const { refreshToken } = useAuthStore.getState();
      if (refreshToken) await authApi.logout?.({ refresh_token: refreshToken }).catch(() => {});
    } catch (_) {}
    clearAuth();
    navigate('/login');
    toast.info('Logged out successfully');
  }, [clearAuth, navigate]);

  const hasRole = useCallback((role) => {
    if (!user) return false;
    if (Array.isArray(role)) return role.includes(user.role);
    return user.role === role;
  }, [user]);

  return {
    user,
    accessToken,
    isAuthenticated,
    isAdmin: user?.role === 'ADMIN',
    isFaculty: user?.role === 'FACULTY',
    isStudent: user?.role === 'STUDENT',
    login,
    logout,
    hasRole,
  };
}
