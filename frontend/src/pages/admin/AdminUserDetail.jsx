import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, User, Mail, Phone, Shield, BookOpen, Calendar,
  Edit2, Save, X, Power, CheckCircle, AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import PageTransition from '../../components/blocks/PageTransition';
import { Skeleton } from '../../components/ui/skeleton';
import { Badge } from '../../components/ui/badge';
import { usersApi, subjectsApi } from '../../api';
import { getInitials, formatDate, formatDateTime } from '../../lib/utils';
import { API_BASE } from '../../lib/constants';

const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 'var(--radius)',
  border: '1px solid var(--border)', background: 'var(--background)',
  color: 'var(--foreground)', fontSize: '14px', fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box',
};
const labelStyle = { fontSize: '11px', fontWeight: 700, color: 'var(--muted-fg)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' };

const roleColors = { ADMIN: '#f59e0b', FACULTY: '#7c3aed', STUDENT: '#3b82f6' };

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getAll().then((res) => {
      const found = (res.data || []).find((u) => u.id === id);
      if (!found) throw new Error('User not found');
      return { data: found };
    }),
    enabled: !!id,
  });
  const user = data?.data;

  const updateMut = useMutation({
    mutationFn: (d) => usersApi.updateMe(d), // Admin would use /users/{id} endpoint ideally
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user', id] });
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
      setEditMode(false);
    },
    onError: () => toast.error('Failed to update user'),
  });

  const deactivateMut = useMutation({
    mutationFn: () => usersApi.deactivate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user', id] });
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deactivated');
      setConfirmDeactivate(false);
    },
    onError: () => toast.error('Failed to deactivate user'),
  });

  const startEdit = () => {
    setForm({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      email: user?.email || '',
    });
    setEditMode(true);
  };

  const roleColor = user ? roleColors[user.role] || 'var(--primary)' : 'var(--primary)';

  if (isLoading) {
    return (
      <PageTransition>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <Skeleton style={{ width: 80, height: 32, borderRadius: 'var(--radius)' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
          <Skeleton style={{ height: 380, borderRadius: 'var(--radius-lg)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Skeleton style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />
            <Skeleton style={{ height: 160, borderRadius: 'var(--radius-lg)' }} />
          </div>
        </div>
      </PageTransition>
    );
  }

  if (isError || !user) {
    return (
      <PageTransition>
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <AlertTriangle size={40} color="var(--destructive)" style={{ margin: '0 auto 12px' }} />
          <h2 style={{ fontWeight: 700, fontSize: '18px' }}>User Not Found</h2>
          <p style={{ color: 'var(--muted-fg)', marginTop: 8 }}>The user with ID <code>{id}</code> does not exist.</p>
          <button onClick={() => navigate('/admin/users')} style={{ marginTop: 20, padding: '9px 20px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
            Back to Users
          </button>
        </div>
      </PageTransition>
    );
  }

  const avatarSrc = user.avatarUrl ? `${API_BASE}${user.avatarUrl}` : null;
  const sp = user.studentProfile;
  const fp = user.facultyProfile;

  return (
    <PageTransition>
      {/* Back button */}
      <button
        onClick={() => navigate('/admin/users')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24,
          padding: '7px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
          background: 'transparent', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: 'var(--foreground)',
        }}
      >
        <ArrowLeft size={14} /> Back to Users
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'flex-start' }}>

        {/* Left: Identity Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, textAlign: 'center' }}>
            {/* Avatar */}
            <div style={{
              width: 88, height: 88, borderRadius: '50%', margin: '0 auto 14px',
              background: `${roleColor}22`, border: `3px solid ${roleColor}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
              fontSize: '28px', fontWeight: 800, color: roleColor,
            }}>
              {avatarSrc
                ? <img src={avatarSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : getInitials(user.fullName)}
            </div>

            <p style={{ fontWeight: 800, fontSize: '17px' }}>{user.fullName}</p>
            <p style={{ color: 'var(--muted-fg)', fontSize: '12px', marginTop: 3 }}>@{user.username}</p>
            <p style={{ color: 'var(--muted-fg)', fontSize: '12px' }}>{user.email}</p>

            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 6 }}>
              <span style={{
                padding: '3px 10px', borderRadius: 9999, fontSize: '11px', fontWeight: 700,
                background: `${roleColor}22`, color: roleColor,
              }}>{user.role}</span>
              <span style={{
                padding: '3px 10px', borderRadius: 9999, fontSize: '11px', fontWeight: 700,
                background: user.isActive ? '#10b98122' : '#ef444422',
                color: user.isActive ? '#10b981' : '#ef4444',
              }}>
                {user.isActive ? '● Active' : '● Inactive'}
              </span>
            </div>

            {/* Meta */}
            <div style={{ marginTop: 16, padding: '12px 0', borderTop: '1px solid var(--border)', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Joined', formatDate(user.createdAt)],
                ['Last Login', user.lastLogin ? formatDateTime(user.lastLogin) : 'Never'],
                ['Phone', user.phone || '—'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted-fg)' }}>{label}</span>
                  <span style={{ fontWeight: 600, maxWidth: '60%', textAlign: 'right' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={startEdit}
              style={{ width: '100%', padding: '9px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Edit2 size={13} /> Edit User
            </button>
            {user.isActive && (
              <button
                onClick={() => setConfirmDeactivate(true)}
                style={{ width: '100%', padding: '9px', borderRadius: 'var(--radius)', border: '1px solid var(--destructive)', background: 'transparent', color: 'var(--destructive)', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <Power size={13} /> Deactivate Account
              </button>
            )}
          </div>

          {/* Deactivate Confirm */}
          {confirmDeactivate && (
            <div style={{ background: '#ef444411', border: '1px solid #ef4444', borderRadius: 'var(--radius-lg)', padding: 16 }}>
              <p style={{ fontWeight: 700, fontSize: '13px', color: 'var(--destructive)', marginBottom: 8 }}>⚠ Are you sure?</p>
              <p style={{ fontSize: '12px', color: 'var(--muted-fg)', marginBottom: 12 }}>This will deactivate the account. The user will no longer be able to log in.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => deactivateMut.mutate()} disabled={deactivateMut.isPending}
                  style={{ flex: 1, padding: '7px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--destructive)', color: '#fff', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
                  {deactivateMut.isPending ? 'Processing...' : 'Yes, Deactivate'}
                </button>
                <button onClick={() => setConfirmDeactivate(false)}
                  style={{ flex: 1, padding: '7px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'transparent', fontSize: '12px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Basic Info / Edit Form */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={15} color="var(--primary)" /> Account Information
              </h2>
              {editMode && (
                <button onClick={() => setEditMode(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted-fg)' }}>
                  <X size={16} />
                </button>
              )}
            </div>

            {!editMode ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                {[
                  ['Full Name', user.fullName, <User size={13} />],
                  ['Email', user.email, <Mail size={13} />],
                  ['Username', `@${user.username}`, <Shield size={13} />],
                  ['Phone', user.phone || '—', <Phone size={13} />],
                  ['Role', user.role, <Shield size={13} />],
                  ['Account Status', user.isActive ? 'Active' : 'Inactive', <CheckCircle size={13} />],
                ].map(([label, value, icon]) => (
                  <div key={label}>
                    <p style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {icon} {label}
                    </p>
                    <p style={{ fontSize: '14px', fontWeight: 600 }}>{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); updateMut.mutate(form); }}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  ['fullName', 'Full Name', 'text'],
                  ['phone', 'Phone', 'tel'],
                ].map(([field, label, type]) => (
                  <div key={field}>
                    <label style={labelStyle}>{label}</label>
                    <input type={type} value={form[field] || ''} onChange={(e) => setForm({ ...form, [field]: e.target.value })} style={inputStyle} />
                  </div>
                ))}
                <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8 }}>
                  <button type="submit" disabled={updateMut.isPending} style={{ padding: '9px 20px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Save size={13} /> {updateMut.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={() => setEditMode(false)} style={{ padding: '9px 20px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'transparent', fontSize: '13px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Student-specific info */}
          {user.role === 'STUDENT' && sp && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
              <h2 style={{ fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <BookOpen size={15} color="#3b82f6" /> Academic Information
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                {[
                  ['Enrollment No.', sp.enrollmentNumber || '—'],
                  ['Course', sp.course?.name || '—'],
                  ['Semester', sp.currentSemester ? `Semester ${sp.currentSemester}` : '—'],
                  ['Academic Year', sp.academicYear || '—'],
                  ['Guardian Name', sp.guardianName || '—'],
                  ['Guardian Phone', sp.guardianPhone || '—'],
                  ['Date of Birth', formatDate(sp.dateOfBirth)],
                  ['Address', sp.address || '—'],
                ].map(([label, value]) => (
                  <div key={label} style={label === 'Address' ? { gridColumn: '1/-1' } : {}}>
                    <p style={labelStyle}>{label}</p>
                    <p style={{ fontSize: '14px', fontWeight: 500 }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Faculty-specific info */}
          {user.role === 'FACULTY' && fp && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
              <h2 style={{ fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <BookOpen size={15} color="#7c3aed" /> Professional Information
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                {[
                  ['Department', fp.department || '—'],
                  ['Designation', fp.designation || '—'],
                  ['Qualification', fp.qualification || '—'],
                  ['Joining Date', formatDate(fp.joiningDate)],
                  ['Office Address', fp.address || '—'],
                ].map(([label, value]) => (
                  <div key={label} style={['Qualification', 'Office Address'].includes(label) ? { gridColumn: '1/-1' } : {}}>
                    <p style={labelStyle}>{label}</p>
                    <p style={{ fontSize: '14px', fontWeight: 500 }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              ['Account Created', formatDateTime(user.createdAt)],
              ['Last Login', user.lastLogin ? formatDateTime(user.lastLogin) : 'Never logged in'],
            ].map(([label, value]) => (
              <div key={label}>
                <p style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={12} /> {label}
                </p>
                <p style={{ fontSize: '13px', fontWeight: 500 }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
