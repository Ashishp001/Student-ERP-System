import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import NotificationBell from '../blocks/NotificationBell';
import useAuthStore from '../../store/authStore';
import { getInitials } from '../../lib/utils';
import { useState } from 'react';

export default function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', borderBottom: '1px solid var(--border)', background: 'var(--card)',
    }}>
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--foreground)', textTransform: 'capitalize' }}>
          {user?.role?.toLowerCase()} Portal
        </h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ThemeToggle />
        <NotificationBell />
        {/* User Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
              borderRadius: 'var(--radius)', border: '1px solid var(--border)',
              background: 'var(--secondary)', cursor: 'pointer', color: 'var(--foreground)',
            }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: '50%', background: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700, color: '#fff',
            }}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : getInitials(user?.fullName)}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 500, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.fullName}
            </span>
            <ChevronDown size={14} />
          </button>
          {menuOpen && (
            <div
              onClick={() => setMenuOpen(false)}
              style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 6,
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)',
                minWidth: 180, zIndex: 100, overflow: 'hidden',
              }}
            >
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>{user?.fullName}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted-fg)' }}>{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px',
                  border: 'none', background: 'none', color: 'var(--destructive)',
                  fontSize: '13px', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
