import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Download, Check, Clock, AlertCircle } from 'lucide-react';
import PageTransition from '../../components/blocks/PageTransition';
import EmptyState from '../../components/blocks/EmptyState';
import { assignmentsApi, submissionsApi } from '../../api';
import { formatDateTime } from '../../lib/utils';
import { API_BASE } from '../../lib/constants';

export default function FacultyAssignmentDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { data: aData } = useQuery({ queryKey: ['assignment', id], queryFn: () => assignmentsApi.getById(id) });
  const { data: sData } = useQuery({ queryKey: ['submissions', id], queryFn: () => submissionsApi.getByAssignment(id) });
  const assignment = aData?.data;
  const submissions = sData?.data || [];
  const [gradeForm, setGradeForm] = useState({});

  const gradeMut = useMutation({
    mutationFn: ({ subId, data }) => submissionsApi.grade(subId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['submissions', id] }); toast.success('Graded!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Grading failed'),
  });

  const handleGrade = (subId) => {
    const marks = gradeForm[subId]?.marks;
    const feedback = gradeForm[subId]?.feedback || '';
    if (marks === undefined || marks === '') { toast.error('Enter marks'); return; }
    gradeMut.mutate({ subId, data: { obtainedMarks: parseFloat(marks), feedback } });
  };

  if (!assignment) return <PageTransition><div style={{ padding: 40, textAlign: 'center', color: 'var(--muted-fg)' }}>Loading...</div></PageTransition>;

  return (
    <PageTransition>
      {/* Assignment Info */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 20 }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: 8 }}>{assignment.title}</h1>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: '13px', color: 'var(--muted-fg)' }}>
          <span>Subject: <strong style={{ color: 'var(--foreground)' }}>{assignment.subjectName} ({assignment.subjectCode})</strong></span>
          <span>Total Marks: <strong style={{ color: 'var(--foreground)' }}>{assignment.totalMarks}</strong></span>
          <span>Deadline: <strong style={{ color: 'var(--foreground)' }}>{formatDateTime(assignment.deadline)}</strong></span>
          <span>Status: <strong style={{ textTransform: 'capitalize', color: assignment.status === 'published' ? 'var(--primary)' : 'var(--muted-fg)' }}>{assignment.status}</strong></span>
        </div>
        {assignment.instructions && <p style={{ marginTop: 12, fontSize: '13px', color: 'var(--muted-fg)', lineHeight: 1.6 }}>{assignment.instructions}</p>}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total', value: assignment.totalSubmissions || 0, icon: '📄' },
          { label: 'Graded', value: assignment.gradedSubmissions || 0, icon: '✅' },
          { label: 'Pending', value: assignment.pendingSubmissions || 0, icon: '⏳' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: '20px', fontWeight: 700 }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--muted-fg)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Submissions Table */}
      {submissions.length === 0 ? (
        <EmptyState title="No submissions yet" description="Students haven't submitted for this assignment yet" />
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 900 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {['#', 'Student', 'Enrollment', 'Submitted', 'Late?', 'File', 'Marks', 'Feedback', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: 'var(--muted-fg)', fontSize: '11px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {submissions.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border)', borderLeft: s.isLate ? '3px solid var(--destructive)' : 'none', background: s.status === 'graded' ? 'rgba(16,185,129,0.04)' : 'transparent' }}>
                  <td style={{ padding: '10px 12px' }}>{i + 1}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 500 }}>{s.studentName}</td>
                  <td style={{ padding: '10px 12px' }}>{s.enrollmentNumber}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--muted-fg)' }}>{formatDateTime(s.submittedAt)}</td>
                  <td style={{ padding: '10px 12px' }}>
                    {s.isLate ? <AlertCircle size={14} color="var(--destructive)" /> : <Check size={14} color="var(--success)" />}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <a href={`${API_BASE}${s.fileUrl}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '12px' }}>
                      <Download size={13} /> {s.fileName?.slice(0, 20)}
                    </a>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {s.status === 'graded' ? (
                      <span style={{ fontWeight: 600, color: 'var(--success)' }}>{s.obtainedMarks}/{s.totalMarks}</span>
                    ) : (
                      <input type="number" min={0} max={assignment.totalMarks} placeholder="Marks"
                        value={gradeForm[s.id]?.marks || ''} onChange={(e) => setGradeForm({ ...gradeForm, [s.id]: { ...gradeForm[s.id], marks: e.target.value } })}
                        style={{ width: 70, padding: '5px 8px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '12px' }} />
                    )}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {s.status === 'graded' ? (
                      <span style={{ fontSize: '12px', color: 'var(--muted-fg)' }}>{s.feedback || '—'}</span>
                    ) : (
                      <input type="text" placeholder="Feedback"
                        value={gradeForm[s.id]?.feedback || ''} onChange={(e) => setGradeForm({ ...gradeForm, [s.id]: { ...gradeForm[s.id], feedback: e.target.value } })}
                        style={{ width: 130, padding: '5px 8px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '12px' }} />
                    )}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {s.status !== 'graded' && (
                      <button onClick={() => handleGrade(s.id)} disabled={gradeMut.isPending}
                        style={{ padding: '5px 12px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                        Grade
                      </button>
                    )}
                    {s.status === 'graded' && <Check size={16} color="var(--success)" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageTransition>
  );
}
