/* MarkEntryForm — Bulk mark entry for a subject+component */
import { useState } from 'react';

export default function MarkEntryForm({ students = [], subjectId, onSubmit, loading }) {
  const [component, setComponent] = useState('');
  const [maxMarks, setMaxMarks] = useState('');
  const [marks, setMarks] = useState(students.map(s => ({ studentId: s.id, studentName: s.fullName, enrollmentNumber: s.enrollmentNumber, obtainedMarks: '' })));

  const updateMark = (studentId, value) => setMarks(marks.map(m => m.studentId === studentId ? { ...m, obtainedMarks: value } : m));

  const handleSubmit = (e) => { e.preventDefault(); onSubmit?.({ subjectId, component, maxMarks: parseFloat(maxMarks), entries: marks.filter(m => m.obtainedMarks !== '').map(m => ({ studentId: m.studentId, obtainedMarks: parseFloat(m.obtainedMarks) })) }); };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}><label style={labelStyle}>Component *</label><input value={component} onChange={(e) => setComponent(e.target.value)} style={inputStyle} required placeholder='e.g. "Mid-Sem", "Assignment 1"' /></div>
        <div style={{ flex: 1 }}><label style={labelStyle}>Max Marks *</label><input type="number" min="1" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} style={inputStyle} required /></div>
      </div>
      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead><tr style={{ background: 'var(--muted)' }}><th style={thStyle}>Student</th><th style={thStyle}>Enrollment</th><th style={thStyle}>Marks</th></tr></thead>
          <tbody>
            {marks.map((m) => (
              <tr key={m.studentId} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={tdStyle}>{m.studentName}</td>
                <td style={tdStyle}>{m.enrollmentNumber}</td>
                <td style={tdStyle}><input type="number" min="0" max={maxMarks || 100} value={m.obtainedMarks} onChange={(e) => updateMark(m.studentId, e.target.value)} style={{ ...inputStyle, width: 80, textAlign: 'center' }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="submit" disabled={loading} style={{ padding: '10px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
        {loading ? 'Saving...' : 'Save Marks'}
      </button>
    </form>
  );
}

const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '14px', outline: 'none' };
const labelStyle = { fontSize: '13px', fontWeight: 500, color: 'var(--foreground)', display: 'block', marginBottom: 6 };
const thStyle = { padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--muted-fg)' };
const tdStyle = { padding: '8px 12px' };
