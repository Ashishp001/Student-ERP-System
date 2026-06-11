import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GraduationCap, TrendingUp, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import PageTransition from '../../components/blocks/PageTransition';
import EmptyState from '../../components/blocks/EmptyState';
import { resultsApi } from '../../api';

const GRADE_COLORS = { O: '#10b981', 'A+': '#3b82f6', A: '#6366f1', 'B+': '#f59e0b', B: '#f97316', C: '#84cc16', F: '#ef4444' };

export default function StudentExamResults() {
  const [activeSemester, setActiveSemester] = useState(null);

  const { data: resultsData, isLoading } = useQuery({ queryKey: ['my-results'], queryFn: () => resultsApi.getMy() });
  const { data: gpaData } = useQuery({ queryKey: ['my-gpa'], queryFn: () => resultsApi.getGpa() });

  const resultsBySem = resultsData?.data || {};
  const gpa = gpaData?.data || { cgpa: 0, semesters: [] };
  const semesters = Object.keys(resultsBySem).map(Number).sort();

  if (!activeSemester && semesters.length > 0) setActiveSemester(semesters[semesters.length - 1]);

  const chartData = gpa.semesters.map(s => ({ name: `Sem ${s.semester}`, sgpa: s.sgpa }));

  if (isLoading) return <PageTransition><div style={{ color: 'var(--muted-fg)' }}>Loading results…</div></PageTransition>;

  return (
    <PageTransition>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <GraduationCap size={22} style={{ color: 'var(--primary)' }} />
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Exam Results</h1>
      </div>

      {semesters.length === 0 ? (
        <EmptyState title="No results published yet" description="Your results will appear here once published by the admin" />
      ) : (
        <>
          {/* GPA Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
            <div style={{ ...statCard, borderLeft: '4px solid var(--primary)' }}>
              <p style={statLabel}>CGPA</p>
              <p style={{ ...statValue, color: 'var(--primary)' }}>{gpa.cgpa.toFixed(2)}</p>
            </div>
            {gpa.semesters.map(s => (
              <div key={s.semester} style={{ ...statCard, cursor: 'pointer', borderLeft: `4px solid ${s.sgpa >= 8 ? '#10b981' : s.sgpa >= 6 ? '#f59e0b' : '#ef4444'}` }}
                onClick={() => setActiveSemester(s.semester)}>
                <p style={statLabel}>Sem {s.semester} SGPA</p>
                <p style={{ ...statValue, color: s.sgpa >= 8 ? '#10b981' : s.sgpa >= 6 ? '#f59e0b' : '#ef4444' }}>{s.sgpa.toFixed(2)}</p>
              </div>
            ))}
          </div>

          {/* SGPA Chart */}
          {chartData.length > 1 && (
            <div style={{ ...card, marginBottom: 24 }}>
              <p style={sectionLabel}>SGPA Progress</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--muted-fg)' }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: 'var(--muted-fg)' }} />
                  <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  <Bar dataKey="sgpa" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Semester Tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {semesters.map(sem => (
              <button key={sem} onClick={() => setActiveSemester(sem)} style={{
                padding: '6px 16px', borderRadius: 9999, border: '1px solid var(--border)',
                background: activeSemester === sem ? 'var(--primary)' : 'var(--muted)',
                color: activeSemester === sem ? '#fff' : 'var(--foreground)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>Semester {sem}</button>
            ))}
          </div>

          {/* Results Table */}
          {activeSemester && resultsBySem[activeSemester] && (
            <div style={card}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                    {['Subject', 'Code', 'Credits', 'Exam', 'Marks', 'Grade', 'Points'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--muted-fg)', fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resultsBySem[activeSemester].map((r, i) => (
                    <tr key={r.id || i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 500 }}>{r.subjectName}</td>
                      <td style={{ padding: '10px 14px' }}><code style={codeBadge}>{r.subjectCode}</code></td>
                      <td style={{ padding: '10px 14px', color: 'var(--muted-fg)' }}>{r.credits}</td>
                      <td style={{ padding: '10px 14px', color: 'var(--muted-fg)' }}>{r.examType.replace('_', '-')}</td>
                      <td style={{ padding: '10px 14px' }}>{r.obtainedMarks}/{r.maxMarks}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontWeight: 800, fontSize: 15, color: GRADE_COLORS[r.grade] || 'var(--foreground)' }}>{r.grade}</span>
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 600 }}>{r.gradePoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </PageTransition>
  );
}

const card = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' };
const statCard = { ...card, padding: '16px 20px' };
const statLabel = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted-fg)', letterSpacing: '0.05em' };
const statValue = { fontSize: 28, fontWeight: 800, marginTop: 4 };
const sectionLabel = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-fg)', marginBottom: 12 };
const codeBadge = { background: 'var(--secondary)', padding: '1px 6px', borderRadius: 4, fontSize: 11, fontWeight: 600 };
