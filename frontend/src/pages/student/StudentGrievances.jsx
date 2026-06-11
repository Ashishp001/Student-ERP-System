import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquareWarning, Plus, X, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import PageTransition from '../../components/blocks/PageTransition';
import EmptyState from '../../components/blocks/EmptyState';
import { grievancesApi } from '../../api';
import { formatDate } from '../../lib/utils';

const CATEGORIES = ['academic', 'facility', 'faculty', 'administrative', 'other'];
const PRIORITIES = ['low', 'medium', 'high'];

const STATUS_COLORS = {
  OPEN:      { bg: '#3b82f622', color: '#3b82f6' },
  IN_REVIEW: { bg: '#f59e0b22', color: '#f59e0b' },
  RESOLVED:  { bg: '#10b98122', color: '#10b981' },
  REJECTED:  { bg: '#ef444422', color: '#ef4444' },
};
const PRIORITY_COLORS = {
  low:    { bg: '#6b728022', color: '#6b7280' },
  medium: { bg: '#f59e0b22', color: '#f59e0b' },
  high:   { bg: '#ef444422', color: '#ef4444' },
};

export default function StudentGrievances() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ category: 'academic', subject: '', description: '', isAnonymous: false, priority: 'medium' });

  const { data, isLoading } = useQuery({
    queryKey: ['my-grievances'],
    queryFn: () => grievancesApi.getMy(),
  });
  const grievances = data?.data || [];

  const fileMut = useMutation({
    mutationFn: () => grievancesApi.file(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-grievances'] });
      toast.success('Grievance filed successfully!');
      setShowForm(false);
      setForm({ category: 'academic', subject: '', description: '', isAnonymous: false, priority: 'medium' });
    },
    onError: e => toast.error(e.response?.data?.message || 'Failed to file grievance'),
  });

  const lbl = { fontSize: 12, fontWeight: 600, color: 'var(--muted-fg)', display: 'block', marginBottom: 4 };
  const inp = { width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--background)', color: 'var(--foreground)', fontSize: 13, boxSizing: 'border-box' };

  return (
    <PageTransition>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MessageSquareWarning size={22} style={{ color: 'var(--primary)' }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>My Grievances</h1>
        </div>
        <button onClick={() => setShowForm(s => !s)} style={primaryBtn}>
          <Plus size={14} /> {showForm ? 'Cancel' : 'New Complaint'}
        </button>
      </div>

      {/* New complaint form */}
      {showForm && (
        <div style={{ ...card, marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>File a New Complaint</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={lbl}>Category *</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inp}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} style={inp}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Subject *</label>
              <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Brief subject of your complaint" style={inp} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Description *</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} placeholder="Describe your complaint in detail…" style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="anon" checked={form.isAnonymous} onChange={e => setForm(f => ({ ...f, isAnonymous: e.target.checked }))} />
              <label htmlFor="anon" style={{ fontSize: 13, color: 'var(--muted-fg)', cursor: 'pointer' }}>Submit anonymously</label>
            </div>
          </div>
          <button
            onClick={() => fileMut.mutate()}
            disabled={!form.subject || !form.description || fileMut.isPending}
            style={{ ...primaryBtn, marginTop: 16 }}
          >
            {fileMut.isPending ? 'Submitting…' : 'Submit Complaint'}
          </button>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div style={{ color: 'var(--muted-fg)', fontSize: 13 }}>Loading…</div>
      ) : grievances.length === 0 ? (
        <EmptyState title="No complaints filed" description="You haven't filed any grievances yet" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {grievances.map(g => (
            <div key={g.id} style={{ ...card, cursor: 'pointer' }} onClick={() => setSelected(selected?.id === g.id ? null : g)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{g.subject}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 9999, background: STATUS_COLORS[g.status]?.bg, color: STATUS_COLORS[g.status]?.color }}>{g.status.replace('_', ' ')}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 6px', borderRadius: 9999, background: PRIORITY_COLORS[g.priority]?.bg, color: PRIORITY_COLORS[g.priority]?.color }}>{g.priority}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 4 }}>{g.category.toUpperCase()} · {formatDate(g.createdAt)}{g.isAnonymous && ' · Anonymous'}</p>
                </div>
                <ChevronDown size={14} style={{ color: 'var(--muted-fg)', transform: selected?.id === g.id ? 'rotate(180deg)' : 'none', transition: '150ms' }} />
              </div>

              {selected?.id === g.id && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 13, color: 'var(--foreground)', lineHeight: 1.6, marginBottom: 10 }}>{g.description}</p>
                  {g.assignedTo && <p style={{ fontSize: 12, color: 'var(--muted-fg)' }}>Assigned to: <strong>{g.assignedTo}</strong></p>}
                  {g.resolutionNote && (
                    <div style={{ background: g.status === 'RESOLVED' ? '#10b98111' : '#ef444411', border: `1px solid ${g.status === 'RESOLVED' ? '#10b98133' : '#ef444433'}`, borderRadius: 'var(--radius)', padding: '10px 14px', marginTop: 10 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: g.status === 'RESOLVED' ? '#10b981' : '#ef4444', marginBottom: 4 }}>{g.status === 'RESOLVED' ? '✓ Resolution' : '✕ Rejection Reason'}</p>
                      <p style={{ fontSize: 13, lineHeight: 1.5 }}>{g.resolutionNote}</p>
                      {g.resolvedAt && <p style={{ fontSize: 11, color: 'var(--muted-fg)', marginTop: 6 }}>Closed: {formatDate(g.resolvedAt)}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </PageTransition>
  );
}

const card = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' };
const primaryBtn = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' };
