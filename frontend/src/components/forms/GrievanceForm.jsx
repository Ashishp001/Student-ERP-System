/* GrievanceForm — File a grievance/complaint form */
import { useState } from 'react';

export default function GrievanceForm({ onSubmit, loading }) {
  const [form, setForm] = useState({ category: 'academic', subject: '', description: '', isAnonymous: false });
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = (e) => { e.preventDefault(); onSubmit?.(form); };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div><label style={labelStyle}>Category *</label>
        <select value={form.category} onChange={set('category')} style={inputStyle} required>
          <option value="academic">Academic</option><option value="facility">Facility</option><option value="faculty">Faculty</option><option value="administrative">Administrative</option><option value="other">Other</option>
        </select>
      </div>
      <div><label style={labelStyle}>Subject *</label><input value={form.subject} onChange={set('subject')} style={inputStyle} required placeholder="Brief subject line" /></div>
      <div><label style={labelStyle}>Description *</label><textarea value={form.description} onChange={set('description')} style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }} required placeholder="Describe your complaint in detail..." /></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="checkbox" checked={form.isAnonymous} onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })} id="anonymous" />
        <label htmlFor="anonymous" style={{ fontSize: '13px', color: 'var(--foreground)' }}>Submit anonymously</label>
      </div>
      <button type="submit" disabled={loading} style={{ padding: '10px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
        {loading ? 'Submitting...' : 'File Complaint'}
      </button>
    </form>
  );
}

const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '14px', outline: 'none' };
const labelStyle = { fontSize: '13px', fontWeight: 500, color: 'var(--foreground)', display: 'block', marginBottom: 6 };
