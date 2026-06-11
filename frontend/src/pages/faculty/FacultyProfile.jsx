import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Save, X, Lock, Eye, EyeOff, BookOpen, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import PageTransition from '../../components/blocks/PageTransition';
import { Skeleton } from '../../components/ui/skeleton';
import { usersApi, authApi } from '../../api';
import useAuthStore from '../../store/authStore';
import { getInitials, formatDate } from '../../lib/utils';
import { API_BASE } from '../../lib/constants';

const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 'var(--radius)',
  border: '1px solid var(--border)', background: 'var(--background)',
  color: 'var(--foreground)', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
};
const labelStyle = { fontSize: '12px', fontWeight: 600, color: 'var(--muted-fg)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' };

export default function FacultyProfile() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const { data, isLoading } = useQuery({ queryKey: ['profile'], queryFn: () => usersApi.getMe() });
  const profile = data?.data;

  const [editMode, setEditMode] = useState(false);
  const [pwMode, setPwMode] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({});
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmNew: '' });

  const updateMut = useMutation({
    mutationFn: (d) => usersApi.updateMe(d),
    onSuccess: (res) => { setUser(res.data); qc.invalidateQueries({ queryKey: ['profile'] }); toast.success('Profile updated'); setEditMode(false); },
    onError: () => toast.error('Failed to update profile'),
  });

  const avatarMut = useMutation({
    mutationFn: (file) => usersApi.uploadAvatar(file),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['profile'] }); toast.success('Avatar updated'); },
    onError: () => toast.error('Upload failed'),
  });

  const pwMut = useMutation({
    mutationFn: (d) => authApi.changePassword(d),
    onSuccess: () => { toast.success('Password changed'); setPwMode(false); setPwForm({ oldPassword: '', newPassword: '', confirmNew: '' }); },
    onError: () => toast.error('Incorrect current password'),
  });

  const startEdit = () => {
    const fp = profile?.facultyProfile;
    setForm({
      fullName: profile?.fullName || '',
      phone: profile?.phone || '',
      department: fp?.department || '',
      designation: fp?.designation || '',
      qualification: fp?.qualification || '',
      address: fp?.address || '',
      joiningDate: fp?.joiningDate || '',
    });
    setEditMode(true);
  };

  const handlePwSubmit = (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmNew) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    pwMut.mutate({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
  };

  if (isLoading) {
    return (
      <PageTransition>
        <Skeleton style={{ height: 28, width: 180, marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24 }}>
          <Skeleton style={{ height: 320, borderRadius: 'var(--radius-lg)' }} />
          <Skeleton style={{ height: 320, borderRadius: 'var(--radius-lg)' }} />
        </div>
      </PageTransition>
    );
  }

  const fp = profile?.facultyProfile;
  const avatarSrc = profile?.avatarUrl ? `${API_BASE}${profile.avatarUrl}` : null;

  return (
    <PageTransition>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800 }}>My Profile</h1>
        <p style={{ color: 'var(--muted-fg)', fontSize: '13px', marginTop: 4 }}>Manage your faculty profile and credentials</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'flex-start' }}>

        {/* Left Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, textAlign: 'center' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 16px' }}>
              <div style={{
                width: 100, height: 100, borderRadius: '50%', overflow: 'hidden',
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '32px', fontWeight: 800, color: '#fff', border: '3px solid var(--border)',
              }}>
                {avatarSrc
                  ? <img src={avatarSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : getInitials(profile?.fullName)}
              </div>
              <label style={{
                position: 'absolute', bottom: 2, right: 2, width: 30, height: 30, borderRadius: '50%',
                background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', border: '2px solid var(--card)',
              }}>
                <Camera size={14} color="#fff" />
                <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) avatarMut.mutate(f); }} />
              </label>
            </div>

            <p style={{ fontWeight: 700, fontSize: '16px' }}>{profile?.fullName}</p>
            <p style={{ color: 'var(--muted-fg)', fontSize: '13px', marginTop: 2 }}>{profile?.email}</p>
            <span style={{
              display: 'inline-block', marginTop: 8, padding: '3px 10px', borderRadius: 9999,
              fontSize: '11px', fontWeight: 600, background: '#7c3aed22', color: '#7c3aed',
            }}>Faculty</span>

            <div style={{ marginTop: 16, padding: '12px 0', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Department', fp?.department || '—'],
                ['Designation', fp?.designation || '—'],
                ['Joined', formatDate(fp?.joiningDate)],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--muted-fg)' }}>{label}</span>
                  <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '55%' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Teaching Stats */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
            <p style={{ fontSize: '13px', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={14} color="var(--primary)" /> Teaching Load
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '13px', color: 'var(--muted-fg)' }}>
              <span>Subjects assigned: managed via Admin</span>
              <span>View your schedule in the Attendance section</span>
            </div>
          </div>

          {/* Change Password */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
            <button onClick={() => setPwMode(!pwMode)} style={{
              width: '100%', padding: '8px', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
              background: 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              color: 'var(--foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <Lock size={14} /> Change Password
            </button>
            {pwMode && (
              <form onSubmit={handlePwSubmit} style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[['oldPassword', 'Current Password'], ['newPassword', 'New Password'], ['confirmNew', 'Confirm Password']].map(([field, label]) => (
                  <div key={field}>
                    <label style={labelStyle}>{label}</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showPw ? 'text' : 'password'}
                        value={pwForm[field]} onChange={(e) => setPwForm({ ...pwForm, [field]: e.target.value })}
                        style={{ ...inputStyle, paddingRight: 36 }} />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted-fg)' }}>
                        {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" style={{ flex: 1, padding: '8px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Save</button>
                  <button type="button" onClick={() => setPwMode(false)} style={{ padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}><X size={14} /></button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Professional Information</h2>
            {!editMode && (
              <button onClick={startEdit} style={{ padding: '7px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--card)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                Edit Profile
              </button>
            )}
          </div>

          {!editMode ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {[
                ['Full Name', profile?.fullName],
                ['Email', profile?.email],
                ['Username', profile?.username],
                ['Phone', profile?.phone || '—'],
                ['Department', fp?.department || '—'],
                ['Designation', fp?.designation || '—'],
                ['Qualification', fp?.qualification || '—'],
                ['Joining Date', formatDate(fp?.joiningDate)],
                ['Office Address', fp?.address || '—'],
              ].map(([label, val]) => (
                <div key={label} style={label === 'Office Address' || label === 'Qualification' ? { gridColumn: '1/-1' } : {}}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{label}</p>
                  <p style={{ fontSize: '14px', fontWeight: 500 }}>{val}</p>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); updateMut.mutate(form); }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                ['fullName', 'Full Name', 'text'],
                ['phone', 'Phone', 'tel'],
                ['department', 'Department', 'text'],
                ['designation', 'Designation', 'text'],
                ['qualification', 'Qualification', 'text'],
                ['joiningDate', 'Joining Date', 'date'],
              ].map(([field, label, type]) => (
                <div key={field} style={field === 'qualification' ? { gridColumn: '1/-1' } : {}}>
                  <label style={labelStyle}>{label}</label>
                  <input type={type} value={form[field] || ''} onChange={(e) => setForm({ ...form, [field]: e.target.value })} style={inputStyle} />
                </div>
              ))}
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Office Address</label>
                <textarea value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8 }}>
                <button type="submit" disabled={updateMut.isPending} style={{ padding: '9px 20px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Save size={14} /> {updateMut.isPending ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditMode(false)} style={{ padding: '9px 20px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'transparent', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          )}
        </div>

      </div>
    </PageTransition>
  );
}
