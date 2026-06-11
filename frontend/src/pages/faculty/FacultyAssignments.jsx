import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Send, Trash2, Upload, FileText, Check, ArrowLeft, Download } from 'lucide-react';
import { toast } from 'sonner';
import PageTransition from '../../components/blocks/PageTransition';
import ConfirmDialog from '../../components/blocks/ConfirmDialog';
import { assignmentsApi, subjectsApi } from '../../api';
import { formatDateTime } from '../../lib/utils';
import { API_BASE } from '../../lib/constants';
import useAuthStore from '../../store/authStore';

const emptyRow = () => ({
  key: Date.now() + Math.random(),
  subjectId: '',
  title: '',
  instructions: '',
  totalMarks: 10,
  deadline: '',
  deadlineTime: '',
  allowLate: false,
  status: 'published',
  file: null,
  submittedOk: false,
});

export default function FacultyAssignments() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data } = useQuery({
    queryKey: ['my-assignments'],
    queryFn: () => assignmentsApi.getMy(),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
  const { data: subsData } = useQuery({ queryKey: ['my-subjects'], queryFn: () => subjectsApi.getMy() });
  const assignments = data?.data || [];
  const subjects = subsData?.data || [];

  const [rows, setRows] = useState([emptyRow()]);
  const [deleteId, setDeleteId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const fileRefs = useRef({});
  const submittedListRef = useRef(null);

  const createMut = useMutation({
    mutationFn: ({ data, file }) => assignmentsApi.create(data, file),
    onSuccess: async (createdResponse) => {
      const created = createdResponse?.data;

      if (created) {
        qc.setQueryData(['my-assignments'], (old) => {
          const prev = old?.data || [];
          const deduped = prev.filter((item) => item.id !== created.id);
          return { ...(old || {}), data: [created, ...deduped] };
        });
      }

      await Promise.all([
        qc.invalidateQueries({ queryKey: ['my-assignments'] }),
        qc.invalidateQueries({ queryKey: ['student-assignments'] }),
      ]);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to create assignment'),
  });
  const publishMut = useMutation({
    mutationFn: (id) => assignmentsApi.publish(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-assignments'] });
      qc.invalidateQueries({ queryKey: ['student-assignments'] });
      toast.success('Published!');
    },
  });
  const closeMut = useMutation({
    mutationFn: (id) => assignmentsApi.close(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-assignments'] });
      qc.invalidateQueries({ queryKey: ['student-assignments'] });
      toast.success('Closed!');
    },
  });
  const deleteMut = useMutation({
    mutationFn: (id) => assignmentsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-assignments'] });
      qc.invalidateQueries({ queryKey: ['student-assignments'] });
      toast.success('Deleted');
    },
  });

  const updateRow = (idx, field, value) => {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const addRow = () => setRows(prev => [...prev, emptyRow()]);

  const removeRow = (idx) => {
    if (rows.length <= 1) {
      setRows([emptyRow()]);
    } else {
      setRows(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const handleFileSelect = (idx, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload PDF file only');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large (max 10MB)');
      return;
    }
    updateRow(idx, 'file', file);
  };

  const handleSubmitRow = async (idx) => {
    const row = rows[idx];
    if (!row.subjectId) { toast.error('Please select a subject'); return; }
    if (!row.title) { toast.error('Please enter a title'); return; }
    if (!row.deadline) { toast.error('Please set a deadline date'); return; }
    if (!row.file) { toast.error('Please add assignment PDF before submit'); return; }

    const deadlineStr = row.deadlineTime
      ? `${row.deadline}T${row.deadlineTime}`
      : `${row.deadline}T23:55`;

    const totalMarks = parseFloat(row.totalMarks);
    if (isNaN(totalMarks) || totalMarks < 0) {
      toast.error('Total marks must be 0 or more');
      return;
    }

    const payload = {
      subjectId: row.subjectId,
      title: row.title,
      instructions: row.instructions,
      totalMarks,
      deadline: new Date(deadlineStr).toISOString(),
      allowLate: row.allowLate,
      status: 'published',
    };

    try {
      await createMut.mutateAsync({ data: payload, file: row.file });
      toast.success(`✅ "${row.title}" published! Students can now see this assignment.`, { duration: 4000 });
      // Reset this row to blank so faculty can add another; keep form open
      setRows(prev => prev.map((r, i) => i === idx ? emptyRow() : r));
      // Scroll to the submitted list so faculty sees the new assignment
      setTimeout(() => {
        submittedListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
    } catch { /* error handled by mutation */ }
  };

  const getSubjectSemester = (subjectId) => {
    const sub = subjects.find(s => s.id === subjectId);
    return sub ? `Semester ${sub.semester}` : '';
  };

  /* ─── Styles ─── */
  const thStyle = {
    padding: '10px 8px', fontWeight: 600, fontSize: '12px',
    textAlign: 'center', color: '#fff', background: '#1a365d',
    borderRight: '1px solid #2d4a7a', whiteSpace: 'nowrap',
  };
  const tdStyle = {
    padding: '6px 6px', fontSize: '12px', borderRight: '1px solid var(--border)',
    borderBottom: '1px solid var(--border)', verticalAlign: 'middle', textAlign: 'center',
  };
  const cellInput = {
    width: '100%', padding: '6px 8px', borderRadius: '4px',
    border: '1px solid var(--border)', background: 'var(--background)',
    color: 'var(--foreground)', fontSize: '12px', outline: 'none',
  };
  const cellSelect = { ...cellInput, cursor: 'pointer' };
  const btnSubmit = {
    padding: '5px 14px', borderRadius: '4px', border: 'none',
    background: '#16a34a', color: '#fff', fontSize: '12px', fontWeight: 600,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
    marginBottom: 4,
  };
  const btnDelete = {
    padding: '5px 14px', borderRadius: '4px', border: 'none',
    background: '#dc2626', color: '#fff', fontSize: '12px', fontWeight: 600,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
  };
  const btnAddRow = {
    padding: '8px 18px', borderRadius: '4px', border: 'none',
    background: '#1e293b', color: '#fff', fontSize: '13px', fontWeight: 600,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
    float: 'right', marginTop: 10,
  };
  const btnPrimary = {
    padding: '9px 18px', borderRadius: 'var(--radius)', border: 'none',
    background: 'var(--primary)', color: '#fff', fontSize: '13px', fontWeight: 600,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
  };
  const btnSmall = (col) => ({
    background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    padding: '5px 10px', cursor: 'pointer', color: col || 'var(--foreground)',
    fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: 4,
  });
  const statusBadge = (status) => ({
    padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
    background: status === 'published' ? '#3b82f622' : status === 'draft' ? '#6b728022' : '#ef444422',
    color: status === 'published' ? '#3b82f6' : status === 'draft' ? '#6b7280' : '#ef4444',
  });

  return (
    <PageTransition>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Upload Assignment (Internal Test)</h1>
        <button onClick={() => setShowCreate(!showCreate)} style={btnPrimary}>
          <Plus size={16} /> {showCreate ? 'Hide Form' : 'Create Assignment'}
        </button>
      </div>

      {/* Info Bar */}
      {showCreate && (
        <div style={{
          background: 'linear-gradient(90deg, #dbeafe 0%, #e0f2fe 100%)',
          border: '1px solid #93c5fd', borderRadius: '6px', padding: '10px 16px',
          marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
          fontSize: '14px', color: '#1e40af',
        }}>
          <span style={{ fontSize: '16px' }}>ℹ</span>
          <span>Viewing assignments for: <strong>{user?.fullName || 'Faculty'}</strong></span>
        </div>
      )}

      {/* Table-based Create Form */}
      {showCreate && (
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: '8px', overflow: 'hidden', marginBottom: 24,
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1100 }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: 50 }}>Sr.No.</th>
                  <th style={thStyle}>Semester/Year</th>
                  <th style={thStyle}>Subject</th>
                  <th style={thStyle}>Instructor</th>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Instructions</th>
                  <th style={{ ...thStyle, width: 70 }}>Total Marks</th>
                  <th style={thStyle}>Actions</th>
                  <th style={thStyle}>Check Assignment</th>
                  <th style={thStyle}>Submission Validity</th>
                  <th style={{ ...thStyle, borderRight: 'none' }}>Process</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.key} style={{ background: idx % 2 === 0 ? 'var(--card)' : 'var(--secondary)' }}>
                    {/* Sr.No */}
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 600 }}>{idx + 1}</span>
                    </td>

                    {/* Semester/Year */}
                    <td style={tdStyle}>
                      <input
                        type="text"
                        readOnly
                        value={getSubjectSemester(row.subjectId)}
                        placeholder="Auto"
                        style={{ ...cellInput, background: 'var(--secondary)', cursor: 'default', textAlign: 'center' }}
                      />
                    </td>

                    {/* Subject */}
                    <td style={tdStyle}>
                      <select
                        value={row.subjectId}
                        onChange={(e) => updateRow(idx, 'subjectId', e.target.value)}
                        style={cellSelect}
                      >
                        <option value="">Select</option>
                        {subjects.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                        ))}
                      </select>
                    </td>

                    {/* Instructor */}
                    <td style={tdStyle}>
                      <input
                        type="text"
                        readOnly
                        value={user?.fullName || 'Faculty'}
                        style={{ ...cellInput, background: 'var(--secondary)', cursor: 'default', textAlign: 'center' }}
                      />
                    </td>

                    {/* Title */}
                    <td style={tdStyle}>
                      <input
                        type="text"
                        value={row.title}
                        onChange={(e) => updateRow(idx, 'title', e.target.value)}
                        placeholder="Title"
                        style={cellInput}
                      />
                    </td>

                    {/* Instructions */}
                    <td style={tdStyle}>
                      <input
                        type="text"
                        value={row.instructions}
                        onChange={(e) => updateRow(idx, 'instructions', e.target.value)}
                        placeholder="Instructions"
                        style={cellInput}
                      />
                    </td>

                    {/* Total Marks */}
                    <td style={tdStyle}>
                      <input
                        type="number"
                        min={0}
                        value={row.totalMarks}
                        onChange={(e) => updateRow(idx, 'totalMarks', e.target.value)}
                        style={{ ...cellInput, textAlign: 'center', width: 65 }}
                      />
                    </td>

                    {/* Actions — File Upload */}
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <button
                          type="button"
                          onClick={() => fileRefs.current[idx]?.click()}
                          style={{
                            padding: '4px 12px', borderRadius: '4px', border: 'none',
                            background: '#2563eb', color: '#fff', fontSize: '11px',
                            fontWeight: 600, cursor: 'pointer', display: 'inline-flex',
                            alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
                          }}
                        >
                          <Upload size={12} /> Add Assignment
                        </button>
                        <input
                          type="file"
                          accept=".pdf"
                          ref={el => fileRefs.current[idx] = el}
                          onChange={(e) => handleFileSelect(idx, e)}
                          style={{ display: 'none' }}
                        />
                        {row.file ? (
                          <span style={{ fontSize: '10px', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <FileText size={10} /> {row.file.name.length > 15 ? row.file.name.slice(0, 15) + '…' : row.file.name}
                          </span>
                        ) : (
                          <span style={{ fontSize: '10px', color: 'var(--muted-fg)', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <FileText size={10} /> No File
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Check Assignment */}
                    <td style={tdStyle}>
                      <button
                        type="button"
                        disabled={!row.subjectId || !row.title}
                        onClick={() => {
                          if (!row.subjectId || !row.title) {
                            toast.error('Fill subject and title first');
                          } else {
                            toast.success('All fields look good!');
                          }
                        }}
                        style={{
                          padding: '4px 14px', borderRadius: '4px',
                          border: '1px solid var(--border)', background: 'var(--card)',
                          color: 'var(--foreground)', fontSize: '11px', fontWeight: 600,
                          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
                          opacity: (!row.subjectId || !row.title) ? 0.5 : 1,
                        }}
                      >
                        <Check size={12} /> Check
                      </button>
                    </td>

                    {/* Submission Validity */}
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <div style={{ fontSize: '10px', color: 'var(--muted-fg)' }}>⊙ Deadline Date</div>
                        <input
                          type="date"
                          value={row.deadline}
                          onChange={(e) => updateRow(idx, 'deadline', e.target.value)}
                          style={{ ...cellInput, fontSize: '11px', padding: '4px 6px' }}
                        />
                        <div style={{ fontSize: '10px', color: 'var(--muted-fg)' }}>Time</div>
                        <input
                          type="time"
                          value={row.deadlineTime}
                          onChange={(e) => updateRow(idx, 'deadlineTime', e.target.value)}
                          style={{ ...cellInput, fontSize: '11px', padding: '4px 6px' }}
                        />
                      </div>
                    </td>

                    {/* Process */}
                    <td style={{ ...tdStyle, borderRight: 'none' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <button
                          onClick={() => handleSubmitRow(idx)}
                          disabled={createMut.isPending}
                          style={btnSubmit}
                        >
                          <Check size={12} /> Submit
                        </button>
                        <button onClick={() => removeRow(idx)} style={btnDelete}>
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Row */}
          <div style={{ padding: '10px 16px', overflow: 'hidden' }}>
            <button onClick={addRow} style={btnAddRow}>
              <Plus size={14} /> Add Row
            </button>
            <div style={{ clear: 'both' }} />
          </div>
        </div>
      )}

      {/* Existing Assignments List */}
      <h2 ref={submittedListRef} style={{ fontSize: '17px', fontWeight: 600, marginBottom: 12, marginTop: 8 }}>
        Assignment History ({assignments.length})
      </h2>

      {assignments.length === 0 ? (
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '40px 20px', textAlign: 'center',
          color: 'var(--muted-fg)', fontSize: '14px',
        }}>
          No assignment history yet. Click "Create Assignment" and submit to store records here.
        </div>
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr>
                {['Sr.No', 'Title', 'Subject', 'File', 'Status', 'Uploaded On', 'Deadline', 'Submissions', 'Actions'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '10px 12px', fontWeight: 600,
                    color: '#fff', fontSize: '11px', textTransform: 'uppercase',
                    background: '#1a365d', borderRight: h !== 'Actions' ? '1px solid #2d4a7a' : 'none',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assignments.map((a, idx) => (
                <tr key={a.id}
                    style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? 'var(--card)' : 'var(--secondary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(215, 30%, 20%)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'var(--card)' : 'var(--secondary)'}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 500 }}>{a.title}</td>
                  <td style={{ padding: '10px 12px' }}>{a.subjectName || a.subjectCode}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--muted-fg)' }}>
                    {a.fileUrl ? (
                      <a
                        href={`${API_BASE}${a.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ ...btnSmall('var(--primary)'), textDecoration: 'none', padding: '4px 8px', fontSize: '11px' }}
                      >
                        <Download size={12} /> {a.fileName || 'View PDF'}
                      </a>
                    ) : (
                      'No file'
                    )}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={statusBadge(a.status)}>{a.status}</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--muted-fg)' }}>{formatDateTime(a.createdAt)}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--muted-fg)' }}>{formatDateTime(a.deadline)}</td>
                  <td style={{ padding: '10px 12px' }}>{a.totalSubmissions || 0} ({a.gradedSubmissions || 0} graded)</td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      <button onClick={() => navigate(`/faculty/assignments/${a.id}`)} style={btnSmall()}><Eye size={13} /> Check</button>
                      {a.status === 'draft' && <button onClick={() => publishMut.mutate(a.id)} style={btnSmall('var(--success)')}><Send size={13} /> Publish</button>}
                      {a.status === 'published' && <button onClick={() => closeMut.mutate(a.id)} style={btnSmall('var(--warning)')}>Close</button>}
                      <button onClick={() => setDeleteId(a.id)} style={btnSmall('var(--destructive)')}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Back link */}
      <div style={{
        marginTop: 20, padding: '12px 16px', background: 'var(--card)',
        border: '1px solid var(--border)', borderRadius: '8px',
      }}>
        <button
          onClick={() => navigate('/faculty')}
          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteMut.mutate(deleteId)} title="Delete Assignment?" description="All submissions will also be deleted." variant="destructive" />
    </PageTransition>
  );
}
