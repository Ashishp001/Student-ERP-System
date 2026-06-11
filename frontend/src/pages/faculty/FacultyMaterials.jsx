import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Upload, Trash2, Download, Filter } from 'lucide-react';
import { toast } from 'sonner';
import PageTransition from '../../components/blocks/PageTransition';
import EmptyState from '../../components/blocks/EmptyState';
import { materialsApi, subjectsApi } from '../../api';
import { formatDate, formatBytes } from '../../lib/utils';
import { API_BASE } from '../../lib/constants';

export default function FacultyMaterials() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ subjectId: '', title: '', description: '', topic: '' });
  const [file, setFile] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { data: subData } = useQuery({ queryKey: ['my-subjects'], queryFn: () => subjectsApi.getMy() });
  const subjects = subData?.data || [];

  const { data: matData } = useQuery({ queryKey: ['my-materials'], queryFn: () => materialsApi.getMy() });
  const materials = matData?.data || [];

  const uploadMut = useMutation({
    mutationFn: () => materialsApi.upload({ subjectId: form.subjectId, title: form.title, description: form.description, topic: form.topic }, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-materials'] });
      toast.success('Material uploaded!');
      setForm({ subjectId: '', title: '', description: '', topic: '' });
      setFile(null);
      setShowForm(false);
    },
    onError: e => toast.error(e.response?.data?.message || 'Upload failed'),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => materialsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-materials'] }); toast.success('Deleted'); },
  });

  return (
    <PageTransition>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BookOpen size={22} style={{ color: 'var(--primary)' }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Study Materials</h1>
        </div>
        <button onClick={() => setShowForm(s => !s)} style={primaryBtn}>
          <Upload size={14} /> {showForm ? 'Cancel' : 'Upload Material'}
        </button>
      </div>

      {/* Upload Form */}
      {showForm && (
        <div style={{ ...card, marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Upload New Material</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Subject *</label>
              <select value={form.subjectId} onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))} style={inputStyle}>
                <option value="">Select subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Unit 3 Notes" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Topic</label>
              <input value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} placeholder="e.g. Data Structures" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" style={inputStyle} />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <label style={labelStyle}>File * (PDF, PPT, DOC — max 20 MB)</label>
            <input type="file" accept=".pdf,.ppt,.pptx,.doc,.docx,.zip" onChange={e => setFile(e.target.files[0])} style={{ display: 'block', marginTop: 6, fontSize: 13 }} />
            {file && <p style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 4 }}>{file.name} · {formatBytes(file.size)}</p>}
          </div>
          <button onClick={() => uploadMut.mutate()} disabled={!form.subjectId || !form.title || !file || uploadMut.isPending} style={{ ...primaryBtn, marginTop: 16 }}>
            <Upload size={14} /> {uploadMut.isPending ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      )}

      {/* Materials List */}
      {materials.length === 0 ? (
        <EmptyState title="No materials uploaded" description="Upload your first study material to get started" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {materials.map(m => (
            <div key={m.id} style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BookOpen size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{m.title}</span>
                  <code style={badge}>{m.subjectCode}</code>
                  {m.topic && <span style={{ fontSize: 11, color: 'var(--muted-fg)', background: 'var(--secondary)', padding: '1px 6px', borderRadius: 4 }}>{m.topic}</span>}
                </div>
                {m.description && <p style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 4 }}>{m.description}</p>}
                <p style={{ fontSize: 11, color: 'var(--muted-fg)', marginTop: 4 }}>
                  {m.fileName} · {formatBytes(m.fileSize)} · {formatDate(m.createdAt)} · {m.downloadCount} downloads
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={`${API_BASE}${m.fileUrl}`} target="_blank" rel="noreferrer" style={outlineBtn}>
                  <Download size={13} /> Download
                </a>
                <button onClick={() => deleteMut.mutate(m.id)} style={dangerBtn}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageTransition>
  );
}

const card = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' };
const badge = { background: 'var(--secondary)', padding: '1px 6px', borderRadius: 4, fontSize: 11, fontWeight: 600 };
const labelStyle = { fontSize: 12, fontWeight: 600, color: 'var(--muted-fg)', display: 'block', marginBottom: 4 };
const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--background)', color: 'var(--foreground)', fontSize: 13, boxSizing: 'border-box' };
const primaryBtn = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' };
const outlineBtn = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontSize: 12, fontWeight: 500, cursor: 'pointer', textDecoration: 'none' };
const dangerBtn = { display: 'inline-flex', alignItems: 'center', padding: '6px 8px', borderRadius: 'var(--radius)', border: '1px solid #ef444433', background: '#ef444411', color: '#ef4444', cursor: 'pointer' };
