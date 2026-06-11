/* CourseForm — Create/edit course form */
import { useState } from 'react';

export default function CourseForm({ onSubmit, loading, initial = {} }) {
  const [form, setForm] = useState({ name: initial.name || '', code: initial.code || '', totalSemesters: initial.totalSemesters || '', totalCredits: initial.totalCredits || '' });
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = (e) => { e.preventDefault(); onSubmit?.(form); };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div><label style={labelStyle}>Course Name *</label><input value={form.name} onChange={set('name')} style={inputStyle} required placeholder="e.g. Master of Computer Applications" /></div>
      <div><label style={labelStyle}>Course Code *</label><input value={form.code} onChange={set('code')} style={inputStyle} required placeholder="e.g. MCA" /></div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}><label style={labelStyle}>Total Semesters *</label><input type="number" min="1" value={form.totalSemesters} onChange={set('totalSemesters')} style={inputStyle} required /></div>
        <div style={{ flex: 1 }}><label style={labelStyle}>Total Credits</label><input type="number" min="0" value={form.totalCredits} onChange={set('totalCredits')} style={inputStyle} /></div>
      </div>
      <button type="submit" disabled={loading} style={{ padding: '10px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
        {loading ? 'Saving...' : initial.id ? 'Update Course' : 'Create Course'}
      </button>
    </form>
  );
}

const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '14px', outline: 'none' };
const labelStyle = { fontSize: '13px', fontWeight: 500, color: 'var(--foreground)', display: 'block', marginBottom: 6 };
