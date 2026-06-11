import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, BarChart3, Calendar } from 'lucide-react';
import PageTransition from '../../components/blocks/PageTransition';
import EmptyState from '../../components/blocks/EmptyState';
import { attendanceApi } from '../../api';
import { formatDate } from '../../lib/utils';

export default function StudentAttendance() {
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);

  // Summary: all subjects attendance %
  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['my-attendance'],
    queryFn: () => attendanceApi.getMy(),
  });
  const { data: sessionsData, isLoading: sessionsLoading, error: sessionsError } = useQuery({
    queryKey: ['my-attendance-sessions'],
    queryFn: () => attendanceApi.getMySessions(),
  });

  const summary = summaryData?.data || {};
  const subjects = summary.subjects || [];
  const sessions = sessionsData?.data || [];

  // Detail: sessions for selected subject
  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ['my-attendance-subject', selectedSubjectId],
    queryFn: () => attendanceApi.getMyForSubject(selectedSubjectId),
    enabled: !!selectedSubjectId,
  });
  const detail = detailData?.data;

  if (isLoading) return (
    <PageTransition>
      <h1 style={pageTitle}>My Attendance</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            height: 72, borderRadius: 'var(--radius-lg)', background: 'var(--muted)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        ))}
      </div>
    </PageTransition>
  );

  return (
    <PageTransition>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <BarChart3 size={22} style={{ color: 'var(--primary)' }} />
        <h1 style={pageTitle}>My Attendance — Semester {summary.semester}</h1>
      </div>

      <div style={{ ...subjectCard, marginBottom: 20 }}>
        <div style={{ width: '100%' }}>
          <p style={{ ...sectionLabel, marginBottom: 10 }}>Attendance Table</p>
          {sessionsLoading ? (
            <p style={{ fontSize: 13, color: 'var(--muted-fg)' }}>Loading attendance sessions…</p>
          ) : sessionsError ? (
            <p style={{ fontSize: 13, color: 'var(--destructive)' }}>Failed to load attendance sessions.</p>
          ) : sessions.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--muted-fg)' }}>No attendance sessions marked yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: 'var(--muted-fg)', fontSize: '11px', textTransform: 'uppercase' }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: 'var(--muted-fg)', fontSize: '11px', textTransform: 'uppercase' }}>Subject Name</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: 'var(--muted-fg)', fontSize: '11px', textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s, idx) => (
                    <tr key={`${s.date}-${s.subjectCode}-${idx}`} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 12px' }}>{formatDate(s.date)}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 500 }}>
                        {s.subjectName} <span style={{ color: 'var(--muted-fg)' }}>({s.subjectCode})</span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999,
                          background: s.status === 'PRESENT' ? '#10b98122' : '#ef444422',
                          color: s.status === 'PRESENT' ? '#10b981' : '#ef4444',
                        }}>
                          {s.status === 'PRESENT' ? 'Present' : 'Absent'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {subjects.length === 0 ? (
        <EmptyState
          title="No attendance data yet"
          description="Attendance will appear here once your faculty starts marking sessions"
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedSubjectId ? 'minmax(0,1fr) minmax(0,1.2fr)' : '1fr', gap: 24, alignItems: 'start' }}>

          {/* ── Subject list / summary cards ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {subjects.map(sub => (
              <button
                key={sub.subjectId}
                onClick={() => setSelectedSubjectId(
                  selectedSubjectId === sub.subjectId ? null : sub.subjectId
                )}
                style={{
                  ...subjectCard,
                  borderLeft: `4px solid ${sub.belowThreshold ? '#ef4444' : sub.percentage >= 90 ? '#10b981' : '#f59e0b'}`,
                  outline: selectedSubjectId === sub.subjectId ? '2px solid var(--primary)' : 'none',
                  cursor: 'pointer',
                }}
              >
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{sub.subjectName}</span>
                    <code style={codeBadge}>{sub.subjectCode}</code>
                    {sub.belowThreshold && (
                      <span style={warningBadge}><AlertTriangle size={10} /> Below 75%</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Progress bar */}
                    <div style={{
                      flex: 1, height: 6, background: 'var(--border)',
                      borderRadius: 9999, overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%', width: `${Math.min(sub.percentage, 100)}%`,
                        background: sub.belowThreshold ? '#ef4444' : sub.percentage >= 90 ? '#10b981' : '#f59e0b',
                        borderRadius: 9999, transition: 'width 600ms ease',
                      }} />
                    </div>
                    <span style={{
                      fontSize: 13, fontWeight: 700, minWidth: 40,
                      color: sub.belowThreshold ? '#ef4444' : sub.percentage >= 90 ? '#10b981' : '#f59e0b',
                    }}>
                      {sub.percentage}%
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--muted-fg)', marginTop: 4 }}>
                    {sub.presentSessions} present / {sub.totalSessions} classes
                  </p>
                </div>
              </button>
            ))}

            {/* Overall summary */}
            {subjects.length > 0 && (
              <div style={{
                ...subjectCard, borderLeft: '4px solid var(--primary)',
                background: 'color-mix(in srgb, var(--primary) 8%, var(--card))',
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                    Overall
                  </p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>
                    {(() => {
                      const total = subjects.reduce((a, s) => a + s.totalSessions, 0);
                      const present = subjects.reduce((a, s) => a + Number(s.presentSessions), 0);
                      return total > 0 ? ((present / total) * 100).toFixed(1) : '—';
                    })()}%
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--muted-fg)' }}>
                    {subjects.filter(s => s.belowThreshold).length > 0
                      ? `⚠️ ${subjects.filter(s => s.belowThreshold).length} subject(s) below 75%`
                      : '✅ All subjects above 75%'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Session detail panel ── */}
          {selectedSubjectId && (
            <div style={{ ...subjectCard, borderLeft: '4px solid var(--primary)', padding: '20px 24px' }}>
              {detailLoading ? (
                <p style={{ color: 'var(--muted-fg)', fontSize: 13 }}>Loading sessions…</p>
              ) : detail ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Calendar size={16} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{detail.subjectName}</span>
                    <code style={codeBadge}>{detail.subjectCode}</code>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                    {[
                      { label: 'Classes', value: detail.totalSessions },
                      { label: 'Present', value: detail.presentSessions, color: '#10b981' },
                      { label: 'Absent', value: Number(detail.totalSessions) - Number(detail.presentSessions), color: '#ef4444' },
                      { label: 'Attendance', value: `${detail.percentage}%`, color: detail.belowThreshold ? '#ef4444' : '#10b981' },
                    ].map(stat => (
                      <div key={stat.label} style={{
                        flex: 1, minWidth: 60, padding: '10px 12px',
                        background: 'var(--muted)', borderRadius: 'var(--radius)', textAlign: 'center',
                      }}>
                        <p style={{ fontSize: 18, fontWeight: 800, color: stat.color || 'var(--foreground)' }}>{stat.value}</p>
                        <p style={{ fontSize: 11, color: 'var(--muted-fg)' }}>{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Session list */}
                  <p style={sectionLabel}>Session History</p>
                  {detail.sessions?.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'var(--muted-fg)' }}>No sessions recorded yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 320, overflowY: 'auto' }}>
                      {detail.sessions?.map((s, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 12px', borderRadius: 'var(--radius)',
                          background: 'var(--muted)',
                          borderLeft: `3px solid ${s.status === 'PRESENT' ? '#10b981' : s.status === 'LEAVE' ? '#f59e0b' : '#ef4444'}`,
                        }}>
                          <span style={{ fontSize: 13 }}>{formatDate(s.date)}</span>
                          <span style={{
                            fontSize: 11, fontWeight: 600, padding: '2px 8px',
                            borderRadius: 9999,
                            background: s.status === 'PRESENT' ? '#10b98122' : s.status === 'LEAVE' ? '#f59e0b22' : '#ef444422',
                            color: s.status === 'PRESENT' ? '#10b981' : s.status === 'LEAVE' ? '#f59e0b' : '#ef4444',
                            display: 'flex', alignItems: 'center', gap: 4,
                          }}>
                            {s.status === 'PRESENT'
                              ? <><CheckCircle2 size={10} /> Present</>
                              : s.status === 'LEAVE' ? 'Leave' : 'Absent'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p style={{ color: 'var(--muted-fg)', fontSize: 13 }}>Could not load session data.</p>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @media (max-width: 768px) { .att-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </PageTransition>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const pageTitle = { fontSize: 22, fontWeight: 700, margin: 0 };
const subjectCard = {
  background: 'var(--card)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)', padding: '14px 18px',
  display: 'flex', gap: 12, transition: 'box-shadow 150ms',
  textDecoration: 'none', color: 'inherit',
};
const codeBadge = {
  background: 'var(--secondary)', padding: '1px 6px',
  borderRadius: 4, fontSize: 11, fontWeight: 600,
};
const warningBadge = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  fontSize: 10, fontWeight: 700, color: '#ef4444',
  background: '#ef444422', padding: '2px 6px', borderRadius: 9999,
};
const sectionLabel = {
  fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.07em', color: 'var(--muted-fg)', marginBottom: 8,
};
