import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Upload, Clock, Check, Eye, ArrowLeft, FileText } from 'lucide-react';
import { toast } from 'sonner';
import PageTransition from '../../components/blocks/PageTransition';
import { assignmentsApi, submissionsApi } from '../../api';
import { API_BASE } from '../../lib/constants';

export default function StudentAssignments() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ['student-assignments'],
    queryFn: () => assignmentsApi.getForStudent(),
    staleTime: 5 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 1000,
    refetchIntervalInBackground: true,
  });
  const assignments = data?.data || [];
  const [uploadingFor, setUploadingFor] = useState(null);

  const submitMut = useMutation({
    mutationFn: ({ assignmentId, file }) => submissionsApi.submit(assignmentId, file),
    onSuccess: (_, { assignmentId }) => { 
      qc.invalidateQueries({ queryKey: ['student-assignments'] }); 
      qc.invalidateQueries({ queryKey: ['submissions', assignmentId] }); 
      toast.success('Submitted successfully!'); 
      setUploadingFor(null); 
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Submission failed'),
  });

  const handleFileSubmit = (assignmentId) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.zip,.pptx,.txt';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) { toast.error('File too large (max 10MB)'); return; }
      setUploadingFor(assignmentId);
      submitMut.mutate({ assignmentId, file });
    };
    input.click();
  };

  const handleViewAssignment = (assignment) => {
    if (assignment.fileUrl) {
      window.open(`${API_BASE}${assignment.fileUrl}`, '_blank', 'noopener,noreferrer');
      return;
    }
    navigate(`/student/assignments/${assignment.id}`);
  };

  const isOverdue = (deadline) => new Date(deadline) < new Date();

  const formatDeadline = (deadline) => {
    if (!deadline) return '—';
    const d = new Date(deadline);
    const date = d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${date} ${time}`;
  };

  /* ─── Styles ─── */
  const thStyle = {
    padding: '10px 10px', fontWeight: 600, fontSize: '12px',
    textAlign: 'center', color: '#fff', background: '#1a365d',
    borderRight: '1px solid #2d4a7a', whiteSpace: 'nowrap',
  };
  const tdStyle = {
    padding: '10px 10px', fontSize: '12px', borderRight: '1px solid var(--border)',
    borderBottom: '1px solid var(--border)', verticalAlign: 'middle', textAlign: 'center',
  };
  const btnSubmit = {
    padding: '5px 14px', borderRadius: '4px', border: 'none',
    background: '#2563eb', color: '#fff', fontSize: '11px', fontWeight: 600,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
    whiteSpace: 'nowrap',
  };
  const btnView = {
    padding: '5px 12px', borderRadius: '4px',
    border: '1px solid var(--border)', background: 'var(--card)',
    color: 'var(--foreground)', fontSize: '11px', fontWeight: 600,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
    whiteSpace: 'nowrap',
  };
  const statusBadge = (submitted, graded) => ({
    padding: '3px 10px', borderRadius: 9999, fontSize: 10, fontWeight: 600,
    display: 'inline-flex', alignItems: 'center', gap: 3,
    background: graded ? '#10b98122' : submitted ? '#3b82f622' : '#6b728022',
    color: graded ? '#10b981' : submitted ? '#3b82f6' : '#6b7280',
  });

  return (
    <PageTransition>
      {/* Title */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>
          Assignment (<span style={{ color: 'var(--primary)' }}>Internal Test</span>)
        </h1>
      </div>

      {/* Assignments Table */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: '8px', overflow: 'hidden', marginBottom: 20,
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1000 }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 55 }}>Sr.No.</th>
                <th style={thStyle}>Semester/Year</th>
                <th style={thStyle}>Subject</th>
                <th style={thStyle}>Instructor</th>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Instructions</th>
                <th style={{ ...thStyle, width: 75 }}>Total Marks</th>
                <th style={{ ...thStyle, width: 90 }}>Obtained Marks</th>
                <th style={thStyle}>Actions</th>
                <th style={thStyle}>Submit</th>
                <th style={{ ...thStyle, borderRight: 'none' }}>Submission Validity</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ ...tdStyle, padding: '40px 20px', borderRight: 'none' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '32px', marginBottom: 8 }}>📋</div>
                      <div style={{ fontWeight: 600, color: 'var(--foreground)', marginBottom: 4 }}>No assignments yet</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted-fg)' }}>
                        Your faculty hasn't published any assignments for your course yet.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                assignments.map((a, idx) => {
                  const overdue = isOverdue(a.deadline);
                  const graded = a.submissionStatus === 'graded';
                  return (
                    <tr
                      key={a.id}
                      style={{ background: idx % 2 === 0 ? 'var(--card)' : 'var(--secondary)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(215, 30%, 20%)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'var(--card)' : 'var(--secondary)'}
                    >
                      {/* Sr.No */}
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 600 }}>{idx + 1}</span>
                      </td>

                      {/* Semester/Year */}
                      <td style={tdStyle}>
                        <span style={{ fontSize: '12px' }}>
                          {a.subjectSemester ? `Semester ${a.subjectSemester}` : '—'}
                        </span>
                      </td>

                      {/* Subject */}
                      <td style={tdStyle}>
                        <div>
                          <div style={{ fontWeight: 500 }}>{a.subjectName || '—'}</div>
                          <div style={{ fontSize: '10px', color: 'var(--muted-fg)' }}>{a.subjectCode}</div>
                        </div>
                      </td>

                      {/* Instructor */}
                      <td style={tdStyle}>
                        <span style={{ fontSize: '12px' }}>{a.facultyName || '—'}</span>
                      </td>

                      {/* Title */}
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 500 }}>{a.title}</span>
                      </td>

                      {/* Instructions */}
                      <td style={tdStyle}>
                        <span style={{ fontSize: '11px', color: 'var(--muted-fg)' }}>
                          {a.instructions ? (a.instructions.length > 60 ? a.instructions.slice(0, 60) + '…' : a.instructions) : '—'}
                        </span>
                      </td>

                      {/* Total Marks */}
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 600 }}>{a.totalMarks}</span>
                      </td>

                      {/* Obtained Marks */}
                      <td style={tdStyle}>
                        {a.obtainedMarks != null ? (
                          <span style={{
                            fontWeight: 700, fontSize: '14px',
                            color: a.obtainedMarks >= a.totalMarks * 0.4 ? '#10b981' : '#ef4444',
                          }}>
                            {a.obtainedMarks}/{a.totalMarks}
                          </span>
                        ) : a.submitted ? (
                          <span style={{ fontSize: '11px', color: 'var(--muted-fg)' }}>Pending</span>
                        ) : (
                          <span style={{ color: 'var(--muted-fg)' }}>—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <button onClick={() => handleViewAssignment(a)} style={btnView}>
                            <Eye size={12} /> View
                          </button>
                        </div>
                      </td>

                      {/* Submit */}
                      <td style={tdStyle}>
                        {a.submitted ? (
                          <span style={statusBadge(true, graded)}>
                            <Check size={11} /> {graded ? 'Graded' : 'Submitted'}
                          </span>
                        ) : overdue && !a.allowLate ? (
                          <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>Closed</span>
                        ) : (
                          <button
                            onClick={() => handleFileSubmit(a.id)}
                            disabled={uploadingFor === a.id}
                            style={{
                              ...btnSubmit,
                              opacity: uploadingFor === a.id ? 0.6 : 1,
                              cursor: uploadingFor === a.id ? 'not-allowed' : 'pointer',
                            }}
                          >
                            <Upload size={12} /> {uploadingFor === a.id ? 'Uploading…' : 'Submit'}
                          </button>
                        )}
                      </td>

                      {/* Submission Validity */}
                      <td style={{ ...tdStyle, borderRight: 'none' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: '11px' }}>
                          <div style={{
                            color: overdue ? '#ef4444' : '#10b981',
                            fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center',
                          }}>
                            <Clock size={11} /> {overdue ? 'Expired' : 'Active'}
                          </div>
                          <div style={{ color: 'var(--muted-fg)', fontSize: '10px' }}>
                            {formatDeadline(a.deadline)}
                          </div>
                          {a.allowLate && !overdue && (
                            <div style={{ fontSize: '9px', color: '#f59e0b' }}>Late allowed</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Back to Dashboard */}
      <div style={{
        padding: '12px 16px', background: 'var(--card)',
        border: '1px solid var(--border)', borderRadius: '8px',
      }}>
        <button
          onClick={() => navigate('/student')}
          style={{
            background: 'none', border: 'none', color: 'var(--foreground)',
            cursor: 'pointer', fontSize: '14px', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>
    </PageTransition>
  );
}
