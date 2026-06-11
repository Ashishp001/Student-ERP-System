import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, Settings, ChevronDown } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { getInitials } from '../../lib/utils';

/** Avatar dropdown menu: Profile, Settings, Logout */
export default function UserMenu() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const profilePath = {
    ADMIN: '/admin',
    FACULTY: '/faculty/profile',
    STUDENT: '/student/profile',
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
          borderRadius: 'var(--radius)', border: '1px solid var(--border)',
          background: 'var(--secondary)', cursor: 'pointer', color: 'var(--foreground)',
        }}
      >
        <div style={{
          width: 30, height: 30, borderRadius: '50%', background: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: 700, color: '#fff', overflow: 'hidden',
        }}>
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : getInitials(user?.fullName)}
        </div>
        <span style={{ fontSize: '13px', fontWeight: 500, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.fullName}
        </span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'absolute', top: '100%', right: 0, marginTop: 6,
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)',
            minWidth: 200, zIndex: 100, overflow: 'hidden',
            animation: 'scaleIn 0.15s ease-out',
          }}
        >
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>{user?.fullName}</p>
            <p style={{ fontSize: '11px', color: 'var(--muted-fg)' }}>{user?.email}</p>
          </div>
          <MenuItem icon={<UserIcon size={14} />} label="Profile" onClick={() => navigate(profilePath[user?.role] || '/')} />
          <div style={{ height: 1, background: 'var(--border)' }} />
          <MenuItem icon={<LogOut size={14} />} label="Logout" onClick={handleLogout} destructive />
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, label, onClick, destructive }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px',
        border: 'none', background: 'none', fontSize: '13px', cursor: 'pointer', textAlign: 'left',
        color: destructive ? 'var(--destructive)' : 'var(--foreground)',
        transition: 'background var(--transition)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--muted)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
    >
      {icon} {label}
    </button>
  );
}
