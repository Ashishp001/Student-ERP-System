import { useQuery } from '@tanstack/react-query';
import { BarChart3, Award, TrendingUp } from 'lucide-react';
import PageTransition from '../../components/blocks/PageTransition';
import EmptyState from '../../components/blocks/EmptyState';
import { marksApi } from '../../api';

export default function StudentMarks() {
  const { data, isLoading } = useQuery({ queryKey: ['my-marks'], queryFn: () => marksApi.getMy() });
  const subjectGroups = data?.data || [];

  if (isLoading) return (
    <PageTransition>
      <h1 style={pageTitle}>Internal Marks</h1>
      {[1,2,3].map(i => <div key={i} style={{ height: 80, marginBottom: 12, borderRadius: 'var(--radius-lg)', background: 'var(--muted)', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
    </PageTransition>
  );

  return (
    <PageTransition>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <BarChart3 size={22} style={{ color: 'var(--primary)' }} />
        <h1 style={{ ...pageTitle, margin: 0 }}>Internal Marks</h1>
      </div>

      {subjectGroups.length === 0 ? (
        <EmptyState title="No marks recorded yet" description="Your faculty hasn't entered any internal marks yet" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {subjectGroups.map(group => {
            const pct = group.totalMax > 0 ? ((group.totalObtained / group.totalMax) * 100).toFixed(1) : 0;
            return (
              <div key={group.subjectId} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                {/* Subject header */}
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{group.subjectName}</span>
                    <code style={badge}>{group.subjectCode}</code>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontSize: 13, color: 'var(--muted-fg)' }}>
                      Total: <strong style={{ color: 'var(--foreground)' }}>{group.totalObtained}/{group.totalMax}</strong>
                    </span>
                    <span style={{
                      padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 700,
                      background: pct >= 60 ? '#10b98122' : pct >= 40 ? '#f59e0b22' : '#ef444422',
                      color: pct >= 60 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444',
                    }}>{pct}%</span>
                  </div>
                </div>

                {/* Component rows */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--muted)' }}>
                      {['Component', 'Max Marks', 'Obtained', 'Status'].map(h => (
                        <th key={h} style={{ padding: '8px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {group.components.map((c, i) => (
                      <tr key={c.id || i} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 20px', fontWeight: 500 }}>{c.component}</td>
                        <td style={{ padding: '10px 20px', color: 'var(--muted-fg)' }}>{c.maxMarks}</td>
                        <td style={{ padding: '10px 20px' }}>
                          {c.obtainedMarks !== null && c.obtainedMarks !== undefined ? (
                            <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 15 }}>{c.obtainedMarks}</span>
                          ) : (
                            <span style={{ color: 'var(--muted-fg)', fontSize: 12 }}>Not entered</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 20px' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999,
                            background: c.isLocked ? '#ef444422' : '#3b82f622',
                            color: c.isLocked ? '#ef4444' : '#3b82f6' }}>
                            {c.isLocked ? '🔒 Locked' : '✓ Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </PageTransition>
  );
}

const pageTitle = { fontSize: 22, fontWeight: 700 };
const badge = { background: 'var(--secondary)', padding: '1px 6px', borderRadius: 4, fontSize: 11, fontWeight: 600 };
