import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pin, Archive, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import PageTransition from '../../components/blocks/PageTransition';
import EmptyState from '../../components/blocks/EmptyState';
import ConfirmDialog from '../../components/blocks/ConfirmDialog';
import FileUpload from '../../components/blocks/FileUpload';
import { noticesApi } from '../../api';
import { formatDateTime } from '../../lib/utils';
import { API_BASE } from '../../lib/constants';

export default function FacultyNotices() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['my-notices'], queryFn: () => noticesApi.getMy() });
  const notices = data?.data || [];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'general', targetAudience: 'all', isPinned: false });
  const [file, setFile] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const refreshNoticeQueries = () => {
    qc.invalidateQueries({ queryKey: ['my-notices'] });
    qc.invalidateQueries({ queryKey: ['notice-feed'] });
  };
  const createMut = useMutation({ mutationFn: ({ d, f }) => noticesApi.create(d, f), onSuccess: () => { refreshNoticeQueries(); toast.success('Notice created!'); resetForm(); } });
  const pinMut = useMutation({ mutationFn: (id) => noticesApi.pin(id), onSuccess: () => { refreshNoticeQueries(); toast.success('Pin toggled'); } });
  const archiveMut = useMutation({ mutationFn: (id) => noticesApi.archive(id), onSuccess: () => { refreshNoticeQueries(); toast.success('Archived'); } });
  const deleteMut = useMutation({ mutationFn: (id) => noticesApi.delete(id), onSuccess: () => { refreshNoticeQueries(); toast.success('Deleted'); } });

  const resetForm = () => { setShowForm(false); setForm({ title: '', content: '', category: 'general', targetAudience: 'all', isPinned: false }); setFile(null); };
  const handleSubmit = (e) => { e.preventDefault(); createMut.mutate({ d: form, f: file }); };

  const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '13px', outline: 'none' };
  const labelStyle = { fontSize: '12px', fontWeight: 500, color: 'var(--muted-fg)', display: 'block', marginBottom: 4 };
  const btnPrimary = { padding: '9px 18px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 };

  const categoryColors = { urgent: '#ef4444', academic: '#3b82f6', event: '#8b5cf6', general: '#6b7280' };

  return (
    <PageTransition>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Notices</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} style={btnPrimary}><Plus size={16} /> New Notice</button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: 14 }}>Create Notice</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Title *</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} required /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Content *</label><textarea rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} required /></div>
            <div><label style={labelStyle}>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                {['general', 'academic', 'event', 'urgent'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Target Audience</label>
              <select value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })} style={inputStyle}>
                {['all', 'students', 'faculty'].map(a => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
              </select>
            </div>
            <div><FileUpload onFileSelect={setFile} value={file} label="Attachment (optional)" /></div>
            <div style={{ display: 'flex', alignItems: 'end', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px' }}>
                <input type="checkbox" checked={form.isPinned} onChange={(e) => setForm({ ...form, isPinned: e.target.checked })} /> Pin this notice
              </label>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
              <button type="submit" disabled={createMut.isPending} style={btnPrimary}>{createMut.isPending ? 'Posting...' : 'Post Notice'}</button>
              <button type="button" onClick={resetForm} style={{ ...btnPrimary, background: 'var(--secondary)', color: 'var(--foreground)' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: 10 }}>Notice History</h2>
      {notices.length === 0 ? (
        <EmptyState title="No notices" description="Post your first notice" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notices.map(n => (
            <div key={n.id} style={{
              background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px',
              borderLeft: n.isPinned ? '3px solid var(--primary)' : undefined, opacity: n.isArchived ? 0.5 : 1,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    {n.isPinned && <Pin size={13} style={{ color: 'var(--primary)' }} />}
                    <h3 style={{ fontSize: '15px', fontWeight: 600 }}>{n.title}</h3>
                    <span style={{ padding: '1px 8px', borderRadius: 9999, fontSize: 10, fontWeight: 600, background: `${categoryColors[n.category] || '#6b7280'}18`, color: categoryColors[n.category] || '#6b7280', textTransform: 'capitalize' }}>{n.category}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--muted-fg)', lineHeight: 1.5, marginBottom: 8 }}>{n.content.slice(0, 200)}{n.content.length > 200 ? '...' : ''}</p>
                  <span style={{ fontSize: '11px', color: 'var(--muted-fg)' }}>{formatDateTime(n.createdAt)} · Audience: {n.targetAudience}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button
                    onClick={() => {
                      if (!n.fileUrl) {
                        toast.error('No attachment available for this notice');
                        return;
                      }
                      window.open(`${API_BASE}${n.fileUrl}`, '_blank', 'noopener,noreferrer');
                    }}
                    style={{
                      background: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      padding: '4px 8px',
                      cursor: 'pointer',
                      color: 'var(--foreground)',
                      fontSize: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Eye size={13} /> View
                  </button>
                  <button onClick={() => pinMut.mutate(n.id)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '4px 6px', cursor: 'pointer', color: n.isPinned ? 'var(--primary)' : 'var(--muted-fg)' }}><Pin size={13} /></button>
                  <button onClick={() => archiveMut.mutate(n.id)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '4px 6px', cursor: 'pointer', color: 'var(--muted-fg)' }}><Archive size={13} /></button>
                  <button onClick={() => setDeleteId(n.id)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '4px 6px', cursor: 'pointer', color: 'var(--destructive)' }}><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteMut.mutate(deleteId)} title="Delete Notice?" variant="destructive" />
    </PageTransition>
  );
}
