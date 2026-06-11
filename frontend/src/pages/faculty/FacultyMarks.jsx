import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BarChart3, Plus, Lock, CheckCircle, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import PageTransition from '../../components/blocks/PageTransition';
import EmptyState from '../../components/blocks/EmptyState';
import { marksApi, subjectsApi, usersApi } from '../../api';

export default function FacultyMarks() {
  const qc = useQueryClient();
  const [subjectId, setSubjectId] = useState('');
  const [component, setComponent] = useState('');
  const [maxMarks, setMaxMarks] = useState(20);
  const [studentMarks, setStudentMarks] = useState({});
  const [newComponent, setNewComponent] = useState('');

  const { data: subData } = useQuery({ queryKey: ['my-subjects'], queryFn: () => subjectsApi.getMy() });
  const subjects = subData?.data || [];

  const { data: marksData, refetch } = useQuery({
    queryKey: ['subject-marks', subjectId],
    queryFn: () => marksApi.getBySubject(subjectId),
    enabled: !!subjectId,
  });

  const { data: usersData } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.getAll() });
  const students = (usersData?.data || []).filter(u => u.role === 'STUDENT');

  const subjectMarks = marksData?.data;
  const components = subjectMarks?.components ? [...subjectMarks.components] : [];
  const existingMarks = subjectMarks?.marks || [];

  // Build lookup: studentId -> { component -> mark }
  const markLookup = {};
  existingMarks.forEach(m => {
    if (!markLookup[m.studentId]) markLookup[m.studentId] = {};
    markLookup[m.studentId][m.component] = m;
  });

  const bulkMut = useMutation({
    mutationFn: () => marksApi.enterBulk({
      subjectId,
      component,
      maxMarks: Number(maxMarks),
      marks: students.map(s => ({ studentId: s.id, obtainedMarks: studentMarks[s.id] !== '' ? Number(studentMarks[s.id]) : null })),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subject-marks', subjectId] }); toast.success('Marks saved!'); },
    onError: e => toast.error(e.response?.data?.message || 'Failed to save'),
  });

  const lockMut = useMutation({
    mutationFn: () => marksApi.lockComponent(subjectId, component),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subject-marks', subjectId] }); toast.success(`"${component}" locked`); },
  });

  const isLocked = component && existingMarks.some(m => m.component === component && m.isLocked);

  return (
    <PageTransition>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <BarChart3 size={22} style={{ color: 'var(--primary)' }} />
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Internal Marks</h1>
      </div>

      {/* Controls */}
      <div style={{ ...card, marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end' }}>
        <div>
          <label style={lbl}>Subject</label>
          <select value={subjectId} onChange={e => { setSubjectId(e.target.value); setComponent(''); }} style={selectStyle}>
            <option value="">Select subject</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        {subjectId && (
          <>
            <div>
              <label style={lbl}>Component</label>
              <select value={component} onChange={e => { setComponent(e.target.value); setStudentMarks({}); }} style={selectStyle}>
                <option value="">Select / New</option>
                {components.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="__new__">+ New Component</option>
              </select>
            </div>
            {component === '__new__' && (
              <div>
                <label style={lbl}>Component Name</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input value={newComponent} onChange={e => setNewComponent(e.target.value)} placeholder="e.g. Mid-Sem" style={{ ...selectStyle, width: 140 }} />
                  <button onClick={() => { setComponent(newComponent); setNewComponent(''); }} style={primaryBtn}>Add</button>
                </div>
              </div>
            )}
            {component && component !== '__new__' && (
              <div>
                <label style={lbl}>Max Marks</label>
                <input type="number" value={maxMarks} onChange={e => setMaxMarks(e.target.value)} min={1} max={100} style={{ ...selectStyle, width: 90 }} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Marks Entry Table */}
      {subjectId && component && component !== '__new__' ? (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{component}</span>
              <span style={{ fontSize: 12, color: 'var(--muted-fg)', marginLeft: 8 }}>Max: {maxMarks}</span>
              {isLocked && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, color: '#ef4444', background: '#ef444422', padding: '2px 8px', borderRadius: 9999 }}>🔒 LOCKED</span>}
            </div>
            {!isLocked && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => bulkMut.mutate()} disabled={bulkMut.isPending} style={primaryBtn}>
                  <CheckCircle size={13} /> {bulkMut.isPending ? 'Saving…' : 'Save All'}
                </button>
                <button onClick={() => lockMut.mutate()} disabled={lockMut.isPending} style={{ ...primaryBtn, background: '#ef4444' }}>
                  <Lock size={13} /> Lock
                </button>
              </div>
            )}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                  {['#', 'Student', 'Marks (/' + maxMarks + ')', 'Status'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--muted-fg)', fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: 30, textAlign: 'center', color: 'var(--muted-fg)' }}>No students found</td></tr>
                ) : students.map((s, i) => {
                  const existing = markLookup[s.id]?.[component];
                  const locked = existing?.isLocked;
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 14px', color: 'var(--muted-fg)' }}>{i + 1}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 500 }}>
                        {s.fullName}
                        {s.enrollmentNumber && <span style={{ fontSize: 11, color: 'var(--muted-fg)', marginLeft: 6 }}>{s.enrollmentNumber}</span>}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <input
                          type="number"
                          min={0}
                          max={maxMarks}
                          disabled={locked}
                          value={studentMarks[s.id] !== undefined ? studentMarks[s.id] : (existing?.obtainedMarks ?? '')}
                          onChange={e => setStudentMarks(m => ({ ...m, [s.id]: e.target.value }))}
                          style={{ width: 80, padding: '5px 8px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: locked ? 'var(--muted)' : 'var(--background)', color: 'var(--foreground)', fontSize: 13 }}
                        />
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999,
                          background: locked ? '#ef444422' : existing ? '#3b82f622' : '#6b728022',
                          color: locked ? '#ef4444' : existing ? '#3b82f6' : '#6b7280' }}>
                          {locked ? '🔒 Locked' : existing ? 'Saved' : 'Not entered'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : subjectId ? (
        <EmptyState title="Select a component" description="Choose an existing component or create a new one above" />
      ) : (
        <EmptyState title="Select a subject" description="Choose a subject from the dropdown to enter marks" />
      )}
    </PageTransition>
  );
}

const card = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' };
const lbl = { fontSize: 12, fontWeight: 600, color: 'var(--muted-fg)', display: 'block', marginBottom: 4 };
const selectStyle = { padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--background)', color: 'var(--foreground)', fontSize: 13 };
const primaryBtn = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' };
