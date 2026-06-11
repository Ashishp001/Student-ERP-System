/* AttendanceForm — Mark attendance for a class session */
import { useState } from 'react';

export default function AttendanceForm({ students = [], subjectId, onSubmit, loading }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState(students.map(s => ({ studentId: s.id, studentName: s.fullName, enrollmentNumber: s.enrollmentNumber, status: 'present' })));

  const toggleStatus = (studentId, status) => {
    setRecords(records.map(r => r.studentId === studentId ? { ...r, status } : r));
  };
  const markAll = (status) => setRecords(records.map(r => ({ ...r, status })));

  const handleSubmit = (e) => { e.preventDefault(); onSubmit?.({ subjectId, date, records }); };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={labelStyle}>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} required />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
        <button type="button" onClick={() => markAll('present')} style={{ ...quickBtn, background: 'var(--success, hsl(160,84%,39%))' }}>Mark All Present</button>
        <button type="button" onClick={() => markAll('absent')} style={{ ...quickBtn, background: 'var(--destructive)' }}>Mark All Absent</button>
      </div>
      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead><tr style={{ background: 'var(--muted)' }}><th style={thStyle}>Student</th><th style={thStyle}>Enrollment</th><th style={thStyle}>Present</th><th style={thStyle}>Absent</th><th style={thStyle}>Leave</th></tr></thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.studentId} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={tdStyle}>{r.studentName}</td>
                <td style={tdStyle}>{r.enrollmentNumber}</td>
                <td style={tdStyle}><input type="radio" name={r.studentId} checked={r.status === 'present'} onChange={() => toggleStatus(r.studentId, 'present')} /></td>
                <td style={tdStyle}><input type="radio" name={r.studentId} checked={r.status === 'absent'} onChange={() => toggleStatus(r.studentId, 'absent')} /></td>
                <td style={tdStyle}><input type="radio" name={r.studentId} checked={r.status === 'leave'} onChange={() => toggleStatus(r.studentId, 'leave')} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="submit" disabled={loading} style={{ padding: '10px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
        {loading ? 'Saving...' : 'Save Attendance'}
      </button>
    </form>
  );
}

const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '14px', outline: 'none' };
const labelStyle = { fontSize: '13px', fontWeight: 500, color: 'var(--foreground)', display: 'block', marginBottom: 6 };
const thStyle = { padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--muted-fg)' };
const tdStyle = { padding: '8px 12px', textAlign: 'left' };
const quickBtn = { padding: '6px 12px', borderRadius: 'var(--radius)', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' };
