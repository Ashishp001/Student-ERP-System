/* NoticeForm — Create/edit notice form */
import { useState } from 'react';
import FileUpload from '../blocks/FileUpload';

export default function NoticeForm({ onSubmit, loading, initial = {} }) {
  const [form, setForm] = useState({ title: initial.title || '', content: initial.content || '', category: initial.category || 'general', targetAudience: initial.targetAudience || 'all' });
  const [file, setFile] = useState(null);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = (e) => { e.preventDefault(); onSubmit?.(form, file); };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div><label style={labelStyle}>Title *</label><input value={form.title} onChange={set('title')} style={inputStyle} required placeholder="Notice title" /></div>
      <div><label style={labelStyle}>Content *</label><textarea value={form.content} onChange={set('content')} style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }} required placeholder="Notice body..." /></div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}><label style={labelStyle}>Category</label><select value={form.category} onChange={set('category')} style={inputStyle}><option value="general">General</option><option value="academic">Academic</option><option value="event">Event</option><option value="urgent">Urgent</option></select></div>
        <div style={{ flex: 1 }}><label style={labelStyle}>Target Audience</label><select value={form.targetAudience} onChange={set('targetAudience')} style={inputStyle}><option value="all">All</option><option value="students">Students</option><option value="faculty">Faculty</option></select></div>
      </div>
      <div><label style={labelStyle}>Attachment (optional)</label><FileUpload accept=".pdf,.jpg,.jpeg,.png" maxSize={5 * 1024 * 1024} onUpload={(f) => setFile(f)} /></div>
      <button type="submit" disabled={loading} style={{ padding: '10px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
        {loading ? 'Posting...' : 'Post Notice'}
      </button>
    </form>
  );
}

const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '14px', outline: 'none' };
const labelStyle = { fontSize: '13px', fontWeight: 500, color: 'var(--foreground)', display: 'block', marginBottom: 6 };
