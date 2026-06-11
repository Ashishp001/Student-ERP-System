import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Users, BookOpen } from 'lucide-react';
import PageTransition from '../../components/blocks/PageTransition';
import StatsCard from '../../components/blocks/StatsCard';
import useAuthStore from '../../store/authStore';
import { assignmentsApi, subjectsApi } from '../../api';

export default function FacultyDashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: aData } = useQuery({ queryKey: ['my-assignments'], queryFn: () => assignmentsApi.getMy() });
  const { data: sData } = useQuery({ queryKey: ['my-subjects'], queryFn: () => subjectsApi.getMy() });

  const assignments = aData?.data || [];
  const subjects = sData?.data || [];
  const pendingSubs = assignments.reduce((acc, a) => acc + (a.pendingSubmissions || 0), 0);

  return (
    <PageTransition>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Welcome back, Prof. {user?.fullName?.split(' ')[0]} 👋</h1>
        <p style={{ fontSize: '14px', color: 'var(--muted-fg)', marginTop: 4 }}>Here's your teaching overview</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatsCard title="My Assignments" value={assignments.length} icon={ClipboardList} index={0} />
        <StatsCard title="Pending Submissions" value={pendingSubs} icon={Users} index={1} />
        <StatsCard title="Subjects Teaching" value={subjects.length} icon={BookOpen} index={2} />
      </div>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: 16 }}>Recent Assignments</h3>
        {assignments.length === 0 ? (
          <p style={{ color: 'var(--muted-fg)', fontSize: '13px' }}>No assignments created yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Title', 'Subject', 'Status', 'Submissions', 'Deadline'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: 'var(--muted-fg)', fontSize: '11px', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assignments.slice(0, 6).map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 500 }}>{a.title}</td>
                  <td style={{ padding: '10px 12px' }}>{a.subjectCode}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
                      background: a.status === 'published' ? '#3b82f622' : a.status === 'draft' ? '#6b728022' : '#ef444422',
                      color: a.status === 'published' ? '#3b82f6' : a.status === 'draft' ? '#6b7280' : '#ef4444',
                    }}>{a.status}</span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>{a.totalSubmissions || 0}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--muted-fg)' }}>{new Date(a.deadline).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PageTransition>
  );
}
