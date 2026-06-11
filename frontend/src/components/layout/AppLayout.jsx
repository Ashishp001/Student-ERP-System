import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import useAuthStore from '../../store/authStore';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';

export default function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [collapsed, setCollapsed] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div style={{
        flex: 1, marginLeft: collapsed ? 68 : 240,
        transition: 'margin-left 200ms ease', display: 'flex', flexDirection: 'column',
      }}>
        <Header />
        <main style={{ flex: 1, padding: '24px', overflow: 'auto', background: 'var(--background)' }}>
          <AnimatePresence mode="wait">
            <Outlet />
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
