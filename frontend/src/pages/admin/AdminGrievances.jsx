import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquareWarning, User, CheckCircle, XCircle, UserCheck, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import PageTransition from '../../components/blocks/PageTransition';
import EmptyState from '../../components/blocks/EmptyState';
import { grievancesApi, usersApi } from '../../api';
import { formatDate } from '../../lib/utils';

const STATUS_TABS = ['', 'OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED'];
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

export default function AdminGrievances() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(null); // { type: 'assign'|'resolve'|'reject', grievance }
  const [noteText, setNoteText] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  const { data: countData } = useQuery({ queryKey: ['grievance-counts'], queryFn: () => grievancesApi.getCounts() });
  const counts = countData?.data || {};

  const { data, isLoading } = useQuery({
    queryKey: ['all-grievances', statusFilter, page],
    queryFn: () => grievancesApi.getAll(statusFilter, page, 20),
  });
  const pageData = data?.data || {};
  const grievances = pageData.content || [];
  const totalPages = pageData.totalPages || 1;

  const { data: usersData } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.getAll() });
  const adminUsers = (usersData?.data || []).filter(u => u.role === 'ADMIN');

  const assignMut = useMutation({
    mutationFn: ({ id }) => grievancesApi.assign(id, assigneeId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['all-grievances'] }); qc.invalidateQueries({ queryKey: ['grievance-counts'] }); toast.success('Assigned'); setModal(null); },
  });

  const resolveMut = useMutation({
    mutationFn: ({ id }) => grievancesApi.resolve(id, noteText),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['all-grievances'] }); qc.invalidateQueries({ queryKey: ['grievance-counts'] }); toast.success('Resolved'); setModal(null); setNoteText(''); },
  });

  const rejectMut = useMutation({
    mutationFn: ({ id }) => grievancesApi.reject(id, noteText),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['all-grievances'] }); qc.invalidateQueries({ queryKey: ['grievance-counts'] }); toast.success('Rejected'); setModal(null); setNoteText(''); },
  });

  return (
    <PageTransition>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <MessageSquareWarning size={22} style={{ color: 'var(--primary)' }} />
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Grievance Management</h1>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Open',      val: counts.open,      color: '#3b82f6' },
          { label: 'In Review', val: counts.in_review,  color: '#f59e0b' },
          { label: 'Resolved',  val: counts.resolved,  color: '#10b981' },
          { label: 'Rejected',  val: counts.rejected,  color: '#ef4444' },
          { label: 'Total',     val: counts.total,     color: 'var(--primary)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px 16px', borderLeft: `4px solid ${s.color}` }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted-fg)', letterSpacing: '0.05em' }}>{s.label}</p>
            <p style={{ fontSize: 26, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.val ?? '—'}</p>
          </div>
        ))}
      </div>

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
        {STATUS_TABS.map(s => (
          <button key={s || 'all'} onClick={() => { setStatusFilter(s); setPage(0); }} style={{
            padding: '6px 14px', borderRadius: 9999, border: '1px solid var(--border)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: statusFilter === s ? 'var(--primary)' : 'var(--muted)',
            color: statusFilter === s ? '#fff' : 'var(--foreground)',
          }}>{s || 'All'}</button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div style={{ color: 'var(--muted-fg)', fontSize: 13 }}>Loading…</div>
      ) : grievances.length === 0 ? (
        <EmptyState title="No grievances" description="No grievances match the current filter" />
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                {['Student', 'Category', 'Subject', 'Priority', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--muted-fg)', fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grievances.map(g => (
                <tr key={g.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 500 }}>{g.studentName}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--muted-fg)', textTransform: 'capitalize' }}>{g.category}</td>
                  <td style={{ padding: '10px 14px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.subject}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 9999, textTransform: 'capitalize', background: PRIORITY_COLORS[g.priority]?.bg, color: PRIORITY_COLORS[g.priority]?.color }}>{g.priority}</span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 9999, background: STATUS_COLORS[g.status]?.bg, color: STATUS_COLORS[g.status]?.color }}>{g.status.replace('_', ' ')}</span>
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--muted-fg)', whiteSpace: 'nowrap' }}>{formatDate(g.createdAt)}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {g.status === 'OPEN' && (
                        <button onClick={() => { setModal({ type: 'assign', grievance: g }); setAssigneeId(''); }} style={actionBtn('#3b82f6')}>
                          <UserCheck size={12} /> Assign
                        </button>
                      )}
                      {['OPEN', 'IN_REVIEW'].includes(g.status) && (
                        <>
                          <button onClick={() => { setModal({ type: 'resolve', grievance: g }); setNoteText(''); }} style={actionBtn('#10b981')}>
                            <CheckCircle size={12} /> Resolve
                          </button>
                          <button onClick={() => { setModal({ type: 'reject', grievance: g }); setNoteText(''); }} style={actionBtn('#ef4444')}>
                            <XCircle size={12} /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'flex-end', gap: 6, borderTop: '1px solid var(--border)' }}>
              <button onClick={() => setPage(p => Math.max(0, p -1))} disabled={page === 0} style={paginBtn}>←</button>
              <span style={{ fontSize: 12, color: 'var(--muted-fg)', padding: '4px 8px' }}>Page {page + 1} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={paginBtn}>→</button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }} onClick={() => setModal(null)}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, width: '90%', maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
              {modal.type === 'assign' ? 'Assign Grievance' : modal.type === 'resolve' ? 'Resolve Grievance' : 'Reject Grievance'}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--muted-fg)', marginBottom: 16 }}>{modal.grievance.subject}</p>

            {modal.type === 'assign' ? (
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted-fg)', display: 'block', marginBottom: 4 }}>Assign to Admin</label>
                <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--background)', color: 'var(--foreground)', fontSize: 13 }}>
                  <option value="">Select staff member</option>
                  {adminUsers.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                </select>
              </div>
            ) : (
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted-fg)', display: 'block', marginBottom: 4 }}>
                  {modal.type === 'resolve' ? 'Resolution Note' : 'Rejection Reason'}
                </label>
                <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={4} placeholder={modal.type === 'resolve' ? 'Describe how this was resolved…' : 'Explain why this is being rejected…'}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--background)', color: 'var(--foreground)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button onClick={() => setModal(null)} style={{ padding: '7px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={() => {
                  if (modal.type === 'assign') assignMut.mutate({ id: modal.grievance.id });
                  else if (modal.type === 'resolve') resolveMut.mutate({ id: modal.grievance.id });
                  else rejectMut.mutate({ id: modal.grievance.id });
                }}
                disabled={modal.type === 'assign' ? !assigneeId : !noteText}
                style={{ padding: '7px 16px', borderRadius: 'var(--radius)', border: 'none', background: modal.type === 'resolve' ? '#10b981' : modal.type === 'reject' ? '#ef4444' : 'var(--primary)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                {modal.type === 'assign' ? 'Assign' : modal.type === 'resolve' ? 'Resolve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}

const actionBtn = (color) => ({
  display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px',
  borderRadius: 'var(--radius)', border: `1px solid ${color}33`, background: `${color}11`,
  color, fontSize: 11, fontWeight: 600, cursor: 'pointer',
});
const paginBtn = { padding: '4px 10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontSize: 12, cursor: 'pointer' };
