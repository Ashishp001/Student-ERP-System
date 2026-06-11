import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { GraduationCap, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import PageTransition from '../../components/blocks/PageTransition';
import EmptyState from '../../components/blocks/EmptyState';
import { resultsApi, subjectsApi, usersApi } from '../../api';

const EXAM_TYPES = ['mid_sem', 'end_sem', 'supplementary'];
const CURRENT_YEAR = '2025-2026';

export default function AdminExamResults() {
  const [subjectId, setSubjectId] = useState('');
  const [examType, setExamType] = useState('end_sem');
  const [academicYear, setAcademicYear] = useState(CURRENT_YEAR);
  const [marks, setMarks] = useState({});
  const [maxMarks, setMaxMarks] = useState(60);

  const { data: subData } = useQuery({ queryKey: ['all-subjects'], queryFn: () => subjectsApi.getAll() });
  const subjects = subData?.data || [];

  const { data: usersData } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.getAll() });
  const students = (usersData?.data || []).filter(u => u.role === 'STUDENT');

  const { data: existingData, refetch } = useQuery({
    queryKey: ['results-subject', subjectId],
    queryFn: () => resultsApi.getBySubject(subjectId),
    enabled: !!subjectId,
  });
  const existingResults = existingData?.data || [];

  // Build lookup for existing results
  const existingLookup = {};
  existingResults.filter(r => r.examType === examType && r.academicYear === academicYear)
    .forEach(r => { existingLookup[r.studentId] = r; });

  const bulkMut = useMutation({
    mutationFn: () => {
      const selectedSubject = subjects.find(s => s.id === subjectId);
      const reqs = students.map(s => ({
        studentId: s.id,
        subjectId,
        examType,
        maxMarks: Number(maxMarks),
        obtainedMarks: Number(marks[s.id] ?? existingLookup[s.id]?.obtainedMarks ?? 0),
        semester: selectedSubject?.semester ?? 1,
        academicYear,
      })).filter(r => r.obtainedMarks > 0);
      return resultsApi.enterBulk(reqs);
    },
    onSuccess: () => { refetch(); toast.success('Results saved!'); },
    onError: e => toast.error(e.response?.data?.message || 'Failed'),
  });

  const publishMut = useMutation({
    mutationFn: () => resultsApi.publish(subjectId, examType, academicYear),
    onSuccess: (d) => { refetch(); toast.success(`${d.data} results published!`); },
  });

  return (
    <PageTransition>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <GraduationCap size={22} style={{ color: 'var(--primary)' }} />
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Exam Result Entry</h1>
      </div>

      {/* Config bar */}
      <div style={{ ...card, marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end' }}>
        <div><label style={lbl}>Subject</label>
          <select value={subjectId} onChange={e => setSubjectId(e.target.value)} style={sel}>
            <option value="">Select subject</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
          </select>
        </div>
        <div><label style={lbl}>Exam Type</label>
          <select value={examType} onChange={e => setExamType(e.target.value)} style={sel}>
            {EXAM_TYPES.map(t => <option key={t} value={t}>{t.replace('_', '-').toUpperCase()}</option>)}
          </select>
        </div>
        <div><label style={lbl}>Academic Year</label>
          <input value={academicYear} onChange={e => setAcademicYear(e.target.value)} style={{ ...sel, width: 110 }} />
        </div>
        <div><label style={lbl}>Max Marks</label>
          <input type="number" value={maxMarks} onChange={e => setMaxMarks(e.target.value)} min={1} style={{ ...sel, width: 90 }} />
        </div>
      </div>

      {/* Results Table */}
      {subjectId ? (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{exam_label(examType)} — {academicYear}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => bulkMut.mutate()} disabled={bulkMut.isPending} style={primaryBtn}>
                <CheckCircle size={13} /> {bulkMut.isPending ? 'Saving…' : 'Save Results'}
              </button>
              <button onClick={() => publishMut.mutate()} disabled={publishMut.isPending} style={{ ...primaryBtn, background: '#10b981' }}>
                {publishMut.isPending ? 'Publishing…' : '📢 Publish to Students'}
              </button>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                {['#', 'Student', `Marks (/${maxMarks})`, 'Grade', 'Published'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--muted-fg)', fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => {
                const ex = existingLookup[s.id];
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 14px', color: 'var(--muted-fg)' }}>{i + 1}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 500 }}>{s.fullName}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <input type="number" min={0} max={maxMarks}
                        value={marks[s.id] !== undefined ? marks[s.id] : (ex?.obtainedMarks ?? '')}
                        onChange={e => setMarks(m => ({ ...m, [s.id]: e.target.value }))}
                        style={{ width: 80, padding: '5px 8px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--background)', color: 'var(--foreground)', fontSize: 13 }}
                      />
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {ex?.grade ? <span style={{ fontWeight: 700, color: ex.grade === 'F' ? '#ef4444' : '#10b981', fontSize: 16 }}>{ex.grade}</span> : '—'}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999,
                        background: ex?.isPublished ? '#10b98122' : '#f59e0b22',
                        color: ex?.isPublished ? '#10b981' : '#f59e0b' }}>
                        {ex?.isPublished ? '✓ Published' : 'Draft'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="Select a subject" description="Choose a subject to enter or view exam results" />
      )}
    </PageTransition>
  );
}

function exam_label(t) { return t.replace('_', '-').replace(/\b\w/g, l => l.toUpperCase()); }
const card = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' };
const lbl = { fontSize: 12, fontWeight: 600, color: 'var(--muted-fg)', display: 'block', marginBottom: 4 };
const sel = { padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--background)', color: 'var(--foreground)', fontSize: 13 };
const primaryBtn = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' };
