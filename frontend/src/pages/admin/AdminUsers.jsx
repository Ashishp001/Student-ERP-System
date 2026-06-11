import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { UserX, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';
import PageTransition from '../../components/blocks/PageTransition';
import { usersApi } from '../../api';
import { getInitials, formatDate } from '../../lib/utils';
import { API_BASE } from '../../lib/constants';

function exportCsv(users) {
  const headers = ['Name', 'Email', 'Username', 'Role', 'Phone', 'Status', 'Joined'];
  const rows = users.map(u => [u.fullName, u.email, u.username, u.role, u.phone || '', u.isActive ? 'Active' : 'Inactive', formatDate(u.createdAt)]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'users.csv'; a.click();
  URL.revokeObjectURL(url);
}

export default function AdminUsers() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.getAll() });
  const allUsers = data?.data || [];

  const deactivateMut = useMutation({
    mutationFn: (id) => usersApi.deactivate(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User deactivated'); },
    onError: e => toast.error(e.response?.data?.message || 'Failed'),
  });

  const users = allUsers
    .filter(u => !roleFilter || u.role === roleFilter)
    .filter(u => !search || u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const roleBadge = (role) => {
    const map = { ADMIN: { bg: '#8b5cf622', color: '#8b5cf6' }, FACULTY: { bg: '#3b82f622', color: '#3b82f6' }, STUDENT: { bg: '#10b98122', color: '#10b981' } };
    const s = map[role] || map.STUDENT;
    return { padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color };
  };

  return (
    <PageTransition>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Users ({users.length})</h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name / email…"
            style={{ padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--background)', color: 'var(--foreground)', fontSize: 13, width: 200 }} />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            style={{ padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--background)', color: 'var(--foreground)', fontSize: 13 }}>
            <option value="">All Roles</option>
            <option value="STUDENT">Student</option>
            <option value="FACULTY">Faculty</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button onClick={() => exportCsv(users)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted-fg)' }}>Loading...</div>
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', background: 'var(--muted)' }}>
                {['', 'Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: 'var(--muted-fg)', fontSize: '11px', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', opacity: u.isActive ? 1 : 0.5 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '8px 14px' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fff', overflow: 'hidden' }}>
                      {u.avatarUrl ? <img src={`${API_BASE}${u.avatarUrl}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(u.fullName)}
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', fontWeight: 500 }}>{u.fullName}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--muted-fg)' }}>{u.email}</td>
                  <td style={{ padding: '10px 14px' }}><span style={roleBadge(u.role)}>{u.role}</span></td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: u.isActive ? '#10b981' : '#ef4444' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: u.isActive ? '#10b981' : '#ef4444' }} />
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--muted-fg)', whiteSpace: 'nowrap' }}>{formatDate(u.createdAt)}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button
                        onClick={() => navigate(`/admin/users/${u.id}`)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                      >
                        <Eye size={12} /> View
                      </button>
                      {u.isActive && u.role !== 'ADMIN' && (
                        <button
                          onClick={() => { if (window.confirm(`Deactivate ${u.fullName}?`)) deactivateMut.mutate(u.id); }}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 'var(--radius)', border: '1px solid #ef444433', background: '#ef444411', color: '#ef4444', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                        >
                          <UserX size={12} /> Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--muted-fg)' }}>No users match the filter</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </PageTransition>
  );
}
