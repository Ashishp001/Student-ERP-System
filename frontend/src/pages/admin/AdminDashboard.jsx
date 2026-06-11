import { useQuery } from '@tanstack/react-query';
import { Users, GraduationCap, MessageSquareWarning, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../../components/blocks/PageTransition';
import StatsCard from '../../components/blocks/StatsCard';
import useAuthStore from '../../store/authStore';
import { usersApi, coursesApi, grievancesApi } from '../../api';

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const { data: users }     = useQuery({ queryKey: ['users'],            queryFn: () => usersApi.getAll() });
  const { data: courses }   = useQuery({ queryKey: ['courses'],          queryFn: () => coursesApi.getAll() });
  const { data: gcounts }   = useQuery({ queryKey: ['grievance-counts'], queryFn: () => grievancesApi.getCounts() });

  const allUsers    = users?.data || [];
  const students    = allUsers.filter((u) => u.role === 'STUDENT');
  const faculty     = allUsers.filter((u) => u.role === 'FACULTY');
  const allCourses  = courses?.data || [];
  const grCounts    = gcounts?.data || {};

  return (
    <PageTransition>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--foreground)' }}>
          Welcome, {user?.fullName} 👋
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--muted-fg)', marginTop: 4 }}>Here's an overview of your institution</p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatsCard title="Total Students"  value={students.length}                         icon={Users}                   index={0} />
        <StatsCard title="Total Faculty"   value={faculty.length}                          icon={Users}                   index={1} />
        <StatsCard title="Active Courses"  value={allCourses.filter(c => c.isActive).length} icon={GraduationCap}          index={2} />
        <StatsCard title="Open Grievances" value={grCounts.open ?? '—'}                    icon={MessageSquareWarning}    index={3} />
      </div>

      {/* Grievance Summary Strip */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Grievance Overview</h3>
          </div>
          <button onClick={() => navigate('/admin/grievances')}
            style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            View All →
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { label: 'Open',      val: grCounts.open,      color: '#3b82f6' },
            { label: 'In Review', val: grCounts.in_review,  color: '#f59e0b' },
            { label: 'Resolved',  val: grCounts.resolved,  color: '#10b981' },
            { label: 'Rejected',  val: grCounts.rejected,  color: '#ef4444' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '10px 8px', background: 'var(--muted)', borderRadius: 'var(--radius)', borderTop: `3px solid ${s.color}` }}>
              <p style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.val ?? 0}</p>
              <p style={{ fontSize: 11, color: 'var(--muted-fg)', fontWeight: 600, marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent users */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Recent Users</h3>
          <button onClick={() => navigate('/admin/users')} style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View All →</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Name', 'Email', 'Role', 'Status'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: 'var(--muted-fg)', fontSize: '12px', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allUsers.slice(0, 8).map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 12px', fontWeight: 500 }}>{u.fullName}</td>
                <td style={{ padding: '10px 12px', color: 'var(--muted-fg)' }}>{u.email}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600, background: u.role === 'ADMIN' ? '#8b5cf622' : u.role === 'FACULTY' ? '#3b82f622' : '#10b98122', color: u.role === 'ADMIN' ? '#8b5cf6' : u.role === 'FACULTY' ? '#3b82f6' : '#10b981' }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: u.isActive ? '#10b981' : '#ef4444' }}>{u.isActive ? 'Active' : 'Inactive'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageTransition>
  );
}
