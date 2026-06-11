import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, ClipboardList, CalendarCheck, Bell,
  Users, GraduationCap, ChevronLeft, ChevronRight,
  BookMarked, User, Award, BarChart2, Building2,
} from 'lucide-react';

import { ROLES } from '../../lib/constants';
import useAuthStore from '../../store/authStore';

const navItems = {
  [ROLES.STUDENT]: [
    { path: '/student',              label: 'Dashboard',   icon: LayoutDashboard },
    { path: '/student/assignments',  label: 'Assignments', icon: ClipboardList },
    { path: '/student/attendance',   label: 'Attendance',  icon: CalendarCheck },
    { path: '/student/results',      label: 'Results',     icon: Award },
    { path: '/student/materials',    label: 'Materials',   icon: BookMarked },
    { path: '/student/notices',      label: 'Notices',     icon: Bell },
    { path: '/student/hostel',       label: 'Hostel',      icon: Building2 },
    { path: '/student/profile',      label: 'Profile',     icon: User },
  ],
  [ROLES.FACULTY]: [
    { path: '/faculty',              label: 'Dashboard',   icon: LayoutDashboard },
    { path: '/faculty/assignments',  label: 'Assignments', icon: ClipboardList },
    { path: '/faculty/attendance',   label: 'Attendance',  icon: CalendarCheck },
    { path: '/faculty/materials',    label: 'Materials',   icon: BookMarked },
    { path: '/faculty/notices',      label: 'Notices',     icon: Bell },
    { path: '/faculty/students',     label: 'Students',    icon: GraduationCap },
    { path: '/faculty/profile',      label: 'Profile',     icon: User },
  ],
  [ROLES.ADMIN]: [
    { path: '/admin',                label: 'Dashboard',   icon: LayoutDashboard },
    { path: '/admin/users',          label: 'Users',       icon: Users },
    { path: '/admin/courses',        label: 'Courses',     icon: GraduationCap },
    { path: '/admin/subjects',       label: 'Subjects',    icon: BookOpen },
    { path: '/admin/results',        label: 'Results',     icon: Award },
    { path: '/admin/analytics',      label: 'Analytics',   icon: BarChart2 },
    { path: '/admin/hostel',         label: 'Hostel',      icon: Building2 },
    { path: '/admin/hostel-data',    label: 'Hostel Data', icon: Building2 },
  ],
};

export default function Sidebar({ collapsed, onToggle }) {
  const user = useAuthStore((s) => s.user);
  const role = user?.role || ROLES.STUDENT;
  const items = navItems[role] || [];
  const location = useLocation();

  return (
    <aside style={{
      width: collapsed ? 68 : 240, minHeight: '100vh', background: 'var(--sidebar)',
      color: 'var(--sidebar-fg)', display: 'flex', flexDirection: 'column',
      transition: 'width 200ms ease', overflow: 'hidden', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50,
      borderRight: '1px solid rgba(255,255,255,0.08)',
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '16px 12px' : '16px 20px', display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid rgba(255,255,255,0.08)', minHeight: 60,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 'var(--radius)', background: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#fff',
          flexShrink: 0,
        }}>EP</div>
        {!collapsed && <span style={{ fontWeight: 700, fontSize: '16px', whiteSpace: 'nowrap' }}>EduPortal</span>}
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {items.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' + role.toLowerCase() && location.pathname.startsWith(item.path + '/'));
          const Icon = item.icon;
          return (
            <NavLink key={item.path} to={item.path} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
              borderRadius: 'var(--radius)', fontSize: '13px', fontWeight: isActive ? 600 : 400,
              color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
              background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              transition: 'all var(--transition)', textDecoration: 'none',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}>
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Ctrl+K hint (only when expanded) */}
      {!collapsed && (
        <div style={{ margin: '0 8px 8px', padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Search</span>
          <div style={{ display: 'flex', gap: 3 }}>
            <kbd style={{ fontSize: 10, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 3, padding: '1px 5px', color: 'rgba(255,255,255,0.5)' }}>Ctrl</kbd>
            <kbd style={{ fontSize: 10, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 3, padding: '1px 5px', color: 'rgba(255,255,255,0.5)' }}>K</kbd>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <button onClick={onToggle} style={{
        margin: '0 8px 8px', padding: '8px', borderRadius: 'var(--radius)', border: 'none',
        background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      }}>
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
