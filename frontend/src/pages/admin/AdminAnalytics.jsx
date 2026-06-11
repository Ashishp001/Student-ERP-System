import { useQuery } from '@tanstack/react-query';
import { BarChart2, Users, GraduationCap, BookOpen, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageTransition from '../../components/blocks/PageTransition';
import StatsCard from '../../components/blocks/StatsCard';
import { analyticsApi } from '../../api';

export default function AdminAnalytics() {
  const { data: dashData } = useQuery({ queryKey: ['admin-analytics'], queryFn: () => analyticsApi.adminDashboard() });
  const { data: enrollData } = useQuery({ queryKey: ['enrollment'], queryFn: () => analyticsApi.enrollmentData() });

  const stats = dashData?.data || {};
  const enrollment = enrollData?.data || [];

  return (
    <PageTransition>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <BarChart2 size={22} style={{ color: 'var(--primary)' }} />
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Analytics Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
        <StatsCard title="Total Students" value={stats.totalStudents ?? '—'} icon={Users} index={0} />
        <StatsCard title="Total Faculty" value={stats.totalFaculty ?? '—'} icon={Users} index={1} />
        <StatsCard title="Active Students" value={stats.activeStudents ?? '—'} icon={TrendingUp} index={2} />
        <StatsCard title="Courses" value={stats.totalCourses ?? '—'} icon={GraduationCap} index={3} />
        <StatsCard title="Subjects" value={stats.totalSubjects ?? '—'} icon={BookOpen} index={4} />
        <StatsCard title="Total Assignments" value={stats.totalAssignments ?? '—'} icon={BookOpen} index={5} />
      </div>

      {/* Enrollment bar chart */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px' }}>
        <p style={sectionLabel}>Students Enrolled per Course</p>
        {enrollment.length === 0 ? (
          <p style={{ color: 'var(--muted-fg)', fontSize: 13 }}>No enrollment data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={enrollment} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="course" tick={{ fontSize: 12, fill: 'var(--muted-fg)' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--muted-fg)' }} />
              <Tooltip
                contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }}
                formatter={(v, n, p) => [v, p.payload.fullName]}
              />
              <Bar dataKey="students" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </PageTransition>
  );
}

const sectionLabel = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-fg)', marginBottom: 16 };
