import { useQuery } from '@tanstack/react-query';
import { ClipboardList, CalendarCheck, Bell } from 'lucide-react';
import PageTransition from '../../components/blocks/PageTransition';
import StatsCard from '../../components/blocks/StatsCard';
import useAuthStore from '../../store/authStore';
import { assignmentsApi, attendanceApi, noticesApi } from '../../api';

export default function StudentDashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: aData } = useQuery({ queryKey: ['student-assignments'], queryFn: () => assignmentsApi.getForStudent() });
  const { data: attData } = useQuery({ queryKey: ['my-attendance'], queryFn: () => attendanceApi.getMy() });
  const { data: nData } = useQuery({ queryKey: ['notice-feed'], queryFn: () => noticesApi.getFeed() });

  const assignments = aData?.data || [];
  const pending = assignments.filter(a => !a.submitted).length;
  const attendance = attData?.data;
  const subjects = attendance?.subjects || [];
  const overallPct = subjects.length > 0 ? (subjects.reduce((s, sub) => s + sub.percentage, 0) / subjects.length).toFixed(1) : '—';
  const notices = nData?.data || [];

  return (
    <PageTransition>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Welcome, {user?.fullName?.split(' ')[0]} 👋</h1>
        <p style={{ fontSize: '14px', color: 'var(--muted-fg)', marginTop: 4 }}>Here's your academic overview</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatsCard title="Pending Assignments" value={pending} icon={ClipboardList} index={0} />
        <StatsCard title="Attendance %" value={`${overallPct}%`} icon={CalendarCheck} index={1} />
        <StatsCard title="Notices" value={notices.length} icon={Bell} index={2} />
      </div>

      {/* Upcoming Assignments */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: 16 }}>Upcoming Assignments</h3>
        {assignments.length === 0 ? (
          <p style={{ color: 'var(--muted-fg)', fontSize: '13px' }}>No assignments available.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {assignments.slice(0, 5).map(a => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 'var(--radius)', background: 'var(--secondary)' }}>
                <div>
                  <span style={{ fontWeight: 500, fontSize: '13px' }}>{a.title}</span>
                  <span style={{ fontSize: '12px', color: 'var(--muted-fg)', marginLeft: 8 }}>{a.subjectCode}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {a.submitted ? (
                    <span style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600, background: '#10b98122', color: '#10b981' }}>Submitted</span>
                  ) : (
                    <span style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600, background: '#f59e0b22', color: '#f59e0b' }}>Pending</span>
                  )}
                  <span style={{ fontSize: '11px', color: 'var(--muted-fg)' }}>{new Date(a.deadline).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attendance */}
      {subjects.length > 0 && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: 16 }}>Attendance Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {subjects.map(s => (
              <div key={s.subjectId} style={{ padding: '12px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: 4 }}>{s.subjectName}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '22px', fontWeight: 700, color: s.percentage >= 75 ? 'var(--success)' : 'var(--destructive)' }}>{s.percentage}%</span>
                  <span style={{ fontSize: '11px', color: 'var(--muted-fg)' }}>{s.presentSessions}/{s.totalSessions} classes</span>
                </div>
                <div style={{ height: 4, borderRadius: 9999, background: 'var(--secondary)', marginTop: 6 }}>
                  <div style={{ height: '100%', borderRadius: 9999, background: s.percentage >= 75 ? 'var(--success)' : 'var(--destructive)', width: `${Math.min(s.percentage, 100)}%`, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageTransition>
  );
}
