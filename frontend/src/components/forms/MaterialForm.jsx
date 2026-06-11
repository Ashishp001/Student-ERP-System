/* MaterialForm — Upload study material form */
import { useState } from 'react';
import FileUpload from '../blocks/FileUpload';

export default function MaterialForm({ onSubmit, loading, subjects = [] }) {
  const [form, setForm] = useState({ subjectId: '', title: '', description: '', topic: '' });
  const [file, setFile] = useState(null);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = (e) => { e.preventDefault(); if (!file) return; onSubmit?.(form, file); };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div><label style={labelStyle}>Subject *</label><select value={form.subjectId} onChange={set('subjectId')} style={inputStyle} required><option value="">Select Subject</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}</select></div>
      <div><label style={labelStyle}>Title *</label><input value={form.title} onChange={set('title')} style={inputStyle} required placeholder="Material title" /></div>
      <div><label style={labelStyle}>Description</label><textarea value={form.description} onChange={set('description')} style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="Brief description..." /></div>
      <div><label style={labelStyle}>Topic / Unit</label><input value={form.topic} onChange={set('topic')} style={inputStyle} placeholder="e.g. Unit 3 — Sorting Algorithms" /></div>
      <div><label style={labelStyle}>File *</label><FileUpload accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" maxSize={20 * 1024 * 1024} onUpload={(f) => setFile(f)} /></div>
      <button type="submit" disabled={loading || !file} style={{ padding: '10px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: (loading || !file) ? 'not-allowed' : 'pointer', opacity: (loading || !file) ? 0.6 : 1 }}>
        {loading ? 'Uploading...' : 'Upload Material'}
      </button>
    </form>
  );
}

const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '14px', outline: 'none' };
const labelStyle = { fontSize: '13px', fontWeight: 500, color: 'var(--foreground)', display: 'block', marginBottom: 6 };
