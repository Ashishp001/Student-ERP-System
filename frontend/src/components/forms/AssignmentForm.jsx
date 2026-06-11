/* AssignmentForm — Create/edit assignment form */
import { useState } from 'react';
import FileUpload from '../blocks/FileUpload';

export default function AssignmentForm({ onSubmit, loading, subjects = [], initial = {} }) {
  const [form, setForm] = useState({ subjectId: initial.subjectId || '', title: initial.title || '', instructions: initial.instructions || '', totalMarks: initial.totalMarks || '', deadline: initial.deadline || '', allowLate: initial.allowLate || false, status: initial.status || 'draft' });
  const [file, setFile] = useState(null);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = (e) => { e.preventDefault(); onSubmit?.(form, file); };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={labelStyle}>Subject *</label>
        <select value={form.subjectId} onChange={set('subjectId')} style={inputStyle} required>
          <option value="">Select Subject</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
        </select>
      </div>
      <div>
        <label style={labelStyle}>Title *</label>
        <input value={form.title} onChange={set('title')} style={inputStyle} required placeholder="Assignment title" />
      </div>
      <div>
        <label style={labelStyle}>Instructions</label>
        <textarea value={form.instructions} onChange={set('instructions')} style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} placeholder="Detailed instructions..." />
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Total Marks *</label>
          <input type="number" min="1" value={form.totalMarks} onChange={set('totalMarks')} style={inputStyle} required />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Deadline *</label>
          <input type="datetime-local" value={form.deadline} onChange={set('deadline')} style={inputStyle} required />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="checkbox" checked={form.allowLate} onChange={(e) => setForm({ ...form, allowLate: e.target.checked })} id="allowLate" />
        <label htmlFor="allowLate" style={{ fontSize: '13px', color: 'var(--foreground)' }}>Allow late submissions</label>
      </div>
      <div>
        <label style={labelStyle}>Reference File (optional)</label>
        <FileUpload accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png" maxSize={10 * 1024 * 1024} onUpload={(f) => setFile(f)} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="submit" onClick={() => setForm({ ...form, status: 'draft' })} disabled={loading} style={{ ...btnStyle, background: 'var(--secondary)', color: 'var(--secondary-fg)' }}>Save as Draft</button>
        <button type="submit" onClick={() => setForm({ ...form, status: 'published' })} disabled={loading} style={btnStyle}>Publish Now</button>
      </div>
    </form>
  );
}

const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '14px', outline: 'none' };
const labelStyle = { fontSize: '13px', fontWeight: 500, color: 'var(--foreground)', display: 'block', marginBottom: 6 };
const btnStyle = { flex: 1, padding: '10px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' };
