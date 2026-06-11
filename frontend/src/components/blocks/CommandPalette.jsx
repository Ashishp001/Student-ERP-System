import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, ClipboardList, Bell, BarChart2, GraduationCap, BarChart3, BookMarked, X } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const ROLE_PAGES = {
  STUDENT: [
    { label: 'Dashboard',        path: '/student',             icon: '🏠' },
    { label: 'Assignments',      path: '/student/assignments', icon: '📋' },
    { label: 'Attendance',       path: '/student/attendance',  icon: '📅' },
    { label: 'Internal Marks',   path: '/student/marks',       icon: '📊' },
    { label: 'Exam Results',     path: '/student/results',     icon: '🎓' },
    { label: 'Study Materials',  path: '/student/materials',   icon: '📚' },
    { label: 'Notices',          path: '/student/notices',     icon: '🔔' },
    { label: 'Grievances',       path: '/student/grievances',  icon: '⚠️' },
    { label: 'My Profile',       path: '/student/profile',     icon: '👤' },
  ],
  FACULTY: [
    { label: 'Dashboard',        path: '/faculty',             icon: '🏠' },
    { label: 'Assignments',      path: '/faculty/assignments', icon: '📋' },
    { label: 'Attendance',       path: '/faculty/attendance',  icon: '📅' },
    { label: 'Internal Marks',   path: '/faculty/marks',       icon: '📊' },
    { label: 'Study Materials',  path: '/faculty/materials',   icon: '📚' },
    { label: 'Notices',          path: '/faculty/notices',     icon: '🔔' },
    { label: 'My Profile',       path: '/faculty/profile',     icon: '👤' },
  ],
  ADMIN: [
    { label: 'Dashboard',        path: '/admin',               icon: '🏠' },
    { label: 'Users',            path: '/admin/users',         icon: '👥' },
    { label: 'Courses',          path: '/admin/courses',       icon: '🎓' },
    { label: 'Subjects',         path: '/admin/subjects',      icon: '📖' },
    { label: 'Exam Results',     path: '/admin/results',       icon: '📝' },
    { label: 'Grievances',       path: '/admin/grievances',    icon: '⚠️' },
    { label: 'Analytics',        path: '/admin/analytics',     icon: '📈' },
  ],
};

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const pages = ROLE_PAGES[user?.role] || [];

  const results = query.trim()
    ? pages.filter(p => p.label.toLowerCase().includes(query.toLowerCase()))
    : pages;

  const go = useCallback((path) => {
    navigate(path);
    onClose();
    setQuery('');
    setHighlighted(0);
  }, [navigate, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') { onClose(); setQuery(''); }
      if (e.key === 'ArrowDown') setHighlighted(h => Math.min(h + 1, results.length - 1));
      if (e.key === 'ArrowUp')   setHighlighted(h => Math.max(h - 1, 0));
      if (e.key === 'Enter' && results[highlighted]) go(results[highlighted].path);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, results, highlighted, go, onClose]);

  // Reset highlight when results change
  useEffect(() => setHighlighted(0), [query]);

  if (!open) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 500, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '15vh' }}
      onClick={onClose}
    >
      <div
        style={{ width: '90%', maxWidth: 560, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: '0 25px 50px rgba(0,0,0,0.4)', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <Search size={16} style={{ color: 'var(--muted-fg)', flexShrink: 0 }} />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search pages, features…"
            style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--foreground)', fontSize: 15, outline: 'none' }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-fg)' }}>
              <X size={14} />
            </button>
          )}
          <kbd style={{ fontSize: 10, background: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', color: 'var(--muted-fg)' }}>ESC</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
          {results.length === 0 ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--muted-fg)', fontSize: 13 }}>No results for "{query}"</div>
          ) : (
            <>
              <div style={{ padding: '8px 16px 4px', fontSize: 10, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Navigation</div>
              {results.map((item, i) => (
                <div
                  key={item.path}
                  onMouseEnter={() => setHighlighted(i)}
                  onClick={() => go(item.path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', cursor: 'pointer',
                    background: highlighted === i ? 'var(--primary)' : 'transparent',
                    color: highlighted === i ? '#fff' : 'var(--foreground)',
                    transition: 'background 100ms',
                  }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</p>
                    <p style={{ fontSize: 11, opacity: 0.7 }}>{item.path}</p>
                  </div>
                  <kbd style={{ fontSize: 10, background: highlighted === i ? 'rgba(255,255,255,0.2)' : 'var(--muted)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px' }}>↵</kbd>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 16, fontSize: 11, color: 'var(--muted-fg)' }}>
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
}
