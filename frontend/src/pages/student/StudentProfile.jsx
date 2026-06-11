import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Save, X, Lock, Eye, EyeOff } from 'lucide-react';
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
  color: 'var(--foreground)', fontSize: '14px', fontFamily: 'inherit', outline: 'none',
  boxSizing: 'border-box',
};
const labelStyle = { fontSize: '12px', fontWeight: 600, color: 'var(--muted-fg)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' };

export default function StudentProfile() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const { data, isLoading } = useQuery({ queryKey: ['profile'], queryFn: () => usersApi.getMe() });
  const profile = data?.data;

  const [editMode, setEditMode] = useState(false);
  const [pwMode, setPwMode] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({});
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmNew: '' });

  const updateMut = useMutation({
    mutationFn: (d) => usersApi.updateMe(d),
    onSuccess: (res) => {
      setUser(res.data);
      qc.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
      setEditMode(false);
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const avatarMut = useMutation({
    mutationFn: (file) => usersApi.uploadAvatar(file),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['profile'] }); toast.success('Avatar updated'); },
    onError: () => toast.error('Avatar upload failed'),
  });

  const pwMut = useMutation({
    mutationFn: (d) => authApi.changePassword(d),
    onSuccess: () => { toast.success('Password changed successfully'); setPwMode(false); setPwForm({ oldPassword: '', newPassword: '', confirmNew: '' }); },
    onError: () => toast.error('Incorrect current password'),
  });

  const startEdit = () => {
    setForm({
      fullName: profile?.fullName || '',
      phone: profile?.phone || '',
      address: profile?.studentProfile?.address || '',
      dateOfBirth: profile?.studentProfile?.dateOfBirth || '',
      guardianName: profile?.studentProfile?.guardianName || '',
      guardianPhone: profile?.studentProfile?.guardianPhone || '',
    });
    setEditMode(true);
  };

  const handlePwSubmit = (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmNew) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    pwMut.mutate({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div style={{ padding: '0 0 32px' }}>
          <Skeleton style={{ height: 28, width: 200, marginBottom: 24 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24 }}>
            <Skeleton style={{ height: 300, borderRadius: 'var(--radius-lg)' }} />
            <Skeleton style={{ height: 300, borderRadius: 'var(--radius-lg)' }} />
          </div>
        </div>
      </PageTransition>
    );
  }

  const sp = profile?.studentProfile;
  const avatarSrc = profile?.avatarUrl ? `${API_BASE}${profile.avatarUrl}` : null;

  return (
    <PageTransition>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800 }}>My Profile</h1>
        <p style={{ color: 'var(--muted-fg)', fontSize: '13px', marginTop: 4 }}>View and manage your personal information</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'flex-start' }}>

        {/* Left Panel — Avatar + Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
            padding: 24, textAlign: 'center',
          }}>
            {/* Avatar */}
            <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 16px' }}>
              <div style={{
                width: 100, height: 100, borderRadius: '50%', overflow: 'hidden',
                background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '32px', fontWeight: 800, color: '#fff',
                border: '3px solid var(--border)',
              }}>
                {avatarSrc
                  ? <img src={avatarSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : getInitials(profile?.fullName)}
              </div>
              <label style={{
                position: 'absolute', bottom: 2, right: 2, width: 30, height: 30, borderRadius: '50%',
                background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
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
              display: 'inline-block', marginTop: 8, padding: '3px 10px',
              borderRadius: 9999, fontSize: '11px', fontWeight: 600,
              background: '#3b82f622', color: '#3b82f6',
            }}>Student</span>

            <div style={{ marginTop: 16, padding: '12px 0', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Enrollment No.', sp?.enrollmentNumber || '—'],
                ['Course', sp?.course?.code || '—'],
                ['Semester', sp?.currentSemester ? `Semester ${sp.currentSemester}` : '—'],
                ['Academic Year', sp?.academicYear || '—'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--muted-fg)' }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Change Password */}
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: 20,
          }}>
            <button
              onClick={() => setPwMode(!pwMode)}
              style={{
                width: '100%', padding: '8px', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                background: 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                color: 'var(--foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <Lock size={14} /> Change Password
            </button>
            {pwMode && (
              <form onSubmit={handlePwSubmit} style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  ['oldPassword', 'Current Password', showOld, setShowOld],
                  ['newPassword', 'New Password', showNew, setShowNew],
                  ['confirmNew', 'Confirm New Password', showNew, setShowNew],
                ].map(([field, label, show, setShow]) => (
                  <div key={field}>
                    <label style={labelStyle}>{label}</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={show ? 'text' : 'password'}
                        value={pwForm[field]}
                        onChange={(e) => setPwForm({ ...pwForm, [field]: e.target.value })}
                        style={{ ...inputStyle, paddingRight: 36 }}
                      />
                      <button type="button"
                        onClick={() => setShow(!show)}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted-fg)' }}>
                        {show ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" style={{ flex: 1, padding: '8px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                    Save
                  </button>
                  <button type="button" onClick={() => setPwMode(false)} style={{ padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}>
                    <X size={14} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Panel — Details and Edit */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Personal Information</h2>
            {!editMode && (
              <button onClick={startEdit} style={{
                padding: '7px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                background: 'var(--card)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}>Edit Profile</button>
            )}
          </div>

          {!editMode ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {[
                ['Full Name', profile?.fullName],
                ['Email', profile?.email],
                ['Username', profile?.username],
                ['Phone', profile?.phone || '—'],
                ['Date of Birth', formatDate(sp?.dateOfBirth)],
                ['Address', sp?.address || '—'],
                ['Guardian Name', sp?.guardianName || '—'],
                ['Guardian Phone', sp?.guardianPhone || '—'],
              ].map(([label, val]) => (
                <div key={label}>
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
                ['dateOfBirth', 'Date of Birth', 'date'],
                ['guardianName', 'Guardian Name', 'text'],
                ['guardianPhone', 'Guardian Phone', 'tel'],
              ].map(([field, label, type]) => (
                <div key={field}>
                  <label style={labelStyle}>{label}</label>
                  <input type={type} value={form[field] || ''} onChange={(e) => setForm({ ...form, [field]: e.target.value })} style={inputStyle} />
                </div>
              ))}
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Home Address</label>
                <textarea value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8 }}>
                <button type="submit" disabled={updateMut.isPending} style={{
                  padding: '9px 20px', borderRadius: 'var(--radius)', border: 'none',
                  background: 'var(--primary)', color: '#fff', fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <Save size={14} /> {updateMut.isPending ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditMode(false)} style={{
                  padding: '9px 20px', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                  background: 'transparent', fontSize: '13px', cursor: 'pointer',
                }}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
