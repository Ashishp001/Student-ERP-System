/* SubjectForm — Create/edit subject form with faculty assignment */
import { useState } from 'react';

export default function SubjectForm({ onSubmit, loading, courses = [], facultyList = [], initial = {} }) {
  const [form, setForm] = useState({ courseId: initial.courseId || '', facultyId: initial.facultyId || '', name: initial.name || '', code: initial.code || '', semester: initial.semester || '', credits: initial.credits || '', type: initial.type || 'core', maxInternalMarks: initial.maxInternalMarks || '40', maxExternalMarks: initial.maxExternalMarks || '60' });
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = (e) => { e.preventDefault(); onSubmit?.(form); };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div><label style={labelStyle}>Course *</label><select value={form.courseId} onChange={set('courseId')} style={inputStyle} required><option value="">Select Course</option>{courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}</select></div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}><label style={labelStyle}>Subject Name *</label><input value={form.name} onChange={set('name')} style={inputStyle} required placeholder="e.g. Data Structures" /></div>
        <div style={{ flex: 1 }}><label style={labelStyle}>Subject Code *</label><input value={form.code} onChange={set('code')} style={inputStyle} required placeholder="e.g. MCA-201" /></div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}><label style={labelStyle}>Semester *</label><input type="number" min="1" value={form.semester} onChange={set('semester')} style={inputStyle} required /></div>
        <div style={{ flex: 1 }}><label style={labelStyle}>Credits *</label><input type="number" min="1" value={form.credits} onChange={set('credits')} style={inputStyle} required /></div>
        <div style={{ flex: 1 }}><label style={labelStyle}>Type</label><select value={form.type} onChange={set('type')} style={inputStyle}><option value="core">Core</option><option value="elective">Elective</option><option value="lab">Lab</option><option value="project">Project</option></select></div>
      </div>
      <div><label style={labelStyle}>Assign Faculty</label><select value={form.facultyId} onChange={set('facultyId')} style={inputStyle}><option value="">Unassigned</option>{facultyList.map(f => <option key={f.id} value={f.id}>{f.fullName}</option>)}</select></div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}><label style={labelStyle}>Max Internal Marks</label><input type="number" value={form.maxInternalMarks} onChange={set('maxInternalMarks')} style={inputStyle} /></div>
        <div style={{ flex: 1 }}><label style={labelStyle}>Max External Marks</label><input type="number" value={form.maxExternalMarks} onChange={set('maxExternalMarks')} style={inputStyle} /></div>
      </div>
      <button type="submit" disabled={loading} style={{ padding: '10px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
        {loading ? 'Saving...' : initial.id ? 'Update Subject' : 'Create Subject'}
      </button>
    </form>
  );
}

const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '14px', outline: 'none' };
const labelStyle = { fontSize: '13px', fontWeight: 500, color: 'var(--foreground)', display: 'block', marginBottom: 6 };
