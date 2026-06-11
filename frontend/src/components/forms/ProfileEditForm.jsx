/* ProfileEditForm — Edit profile form for student/faculty */
import { useState } from 'react';

export default function ProfileEditForm({ user, onSubmit, loading }) {
  const role = user?.role?.toUpperCase();
  const [form, setForm] = useState({
    phone: user?.phone || '',
    address: user?.studentAddress || user?.facultyAddress || '',
    guardianName: user?.guardianName || '',
    guardianPhone: user?.guardianPhone || '',
    department: user?.department || '',
    designation: user?.designation || '',
    qualification: user?.qualification || '',
  });
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = (e) => { e.preventDefault(); onSubmit?.(form); };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div><label style={labelStyle}>Phone</label><input value={form.phone} onChange={set('phone')} style={inputStyle} placeholder="Phone number" /></div>
      {role === 'STUDENT' && (
        <>
          <div><label style={labelStyle}>Address</label><textarea value={form.address} onChange={set('address')} style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="Home address" /></div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>Guardian Name</label><input value={form.guardianName} onChange={set('guardianName')} style={inputStyle} /></div>
            <div style={{ flex: 1 }}><label style={labelStyle}>Guardian Phone</label><input value={form.guardianPhone} onChange={set('guardianPhone')} style={inputStyle} /></div>
          </div>
        </>
      )}
      {role === 'FACULTY' && (
        <>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>Department</label><input value={form.department} onChange={set('department')} style={inputStyle} /></div>
            <div style={{ flex: 1 }}><label style={labelStyle}>Designation</label><input value={form.designation} onChange={set('designation')} style={inputStyle} /></div>
          </div>
          <div><label style={labelStyle}>Qualification</label><input value={form.qualification} onChange={set('qualification')} style={inputStyle} placeholder="e.g. M.Tech, PhD" /></div>
          <div><label style={labelStyle}>Address</label><textarea value={form.address} onChange={set('address')} style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} /></div>
        </>
      )}
      <button type="submit" disabled={loading} style={{ padding: '10px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}

const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '14px', outline: 'none' };
const labelStyle = { fontSize: '13px', fontWeight: 500, color: 'var(--foreground)', display: 'block', marginBottom: 6 };
