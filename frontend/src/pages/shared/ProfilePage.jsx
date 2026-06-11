import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Save } from 'lucide-react';
import { toast } from 'sonner';
import PageTransition from '../../components/blocks/PageTransition';
import { usersApi } from '../../api';
import useAuthStore from '../../store/authStore';
import { getInitials } from '../../lib/utils';
import { API_BASE } from '../../lib/constants';

export default function ProfilePage() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { data } = useQuery({ queryKey: ['profile'], queryFn: () => usersApi.getMe() });
  const profile = data?.data;

  const [form, setForm] = useState({});
  const [editMode, setEditMode] = useState(false);

  const updateMut = useMutation({
    mutationFn: (d) => usersApi.updateMe(d),
    onSuccess: (res) => { setUser(res.data); qc.invalidateQueries({ queryKey: ['profile'] }); toast.success('Profile updated'); setEditMode(false); },
  });

  const avatarMut = useMutation({
    mutationFn: (file) => usersApi.uploadAvatar(file),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['profile'] }); toast.success('Avatar uploaded'); },
  });

  const startEdit = () => {
    setForm({ fullName: profile?.fullName || '', phone: profile?.phone || '' });
    setEditMode(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) avatarMut.mutate(file);
  };

  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '14px', outline: 'none' };
  const labelStyle = { fontSize: '13px', fontWeight: 500, color: 'var(--muted-fg)', display: 'block', marginBottom: 4 };

  return (
    <PageTransition>
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: 24 }}>Profile</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 32, alignItems: 'flex-start' }}>
        {/* Avatar */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 120, height: 120 }}>
            <div style={{
              width: 120, height: 120, borderRadius: '50%', background: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '36px', fontWeight: 800, color: '#fff', overflow: 'hidden',
              border: '3px solid var(--border)',
            }}>
              {profile?.avatarUrl ? (
                <img src={`${API_BASE}${profile.avatarUrl}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : getInitials(profile?.fullName)}
            </div>
            <label style={{
              position: 'absolute', bottom: 2, right: 2, width: 32, height: 32, borderRadius: '50%',
              background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', border: '2px solid var(--card)',
            }}>
              <Camera size={14} color="#fff" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
            </label>
          </div>
          <p style={{ marginTop: 12, fontWeight: 600, fontSize: '16px' }}>{profile?.fullName}</p>
          <span style={{ padding: '2px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600, background: '#3b82f622', color: '#3b82f6', textTransform: 'capitalize' }}>{profile?.role?.toLowerCase()}</span>
        </div>

        {/* Details */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
          {!editMode ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: '14px' }}>
                {[
                  ['Full Name', profile?.fullName],
                  ['Email', profile?.email],
                  ['Username', profile?.username],
                  ['Phone', profile?.phone || '—'],
                  ['Role', profile?.role],
                  ['Status', profile?.isActive ? 'Active' : 'Inactive'],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p style={{ fontSize: '12px', color: 'var(--muted-fg)', fontWeight: 500, marginBottom: 2 }}>{label}</p>
                    <p style={{ fontWeight: 500 }}>{val}</p>
                  </div>
                ))}
              </div>
              <button onClick={startEdit} style={{
                marginTop: 20, padding: '8px 20px', borderRadius: 'var(--radius)', border: 'none',
                background: 'var(--primary)', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}>Edit Profile</button>
            </>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); updateMut.mutate(form); }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={labelStyle}>Full Name</label><input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} style={inputStyle} /></div>
              <div><label style={labelStyle}>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} /></div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" style={{ padding: '8px 20px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Save size={14} /> Save
                </button>
                <button type="button" onClick={() => setEditMode(false)} style={{ padding: '8px 20px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
