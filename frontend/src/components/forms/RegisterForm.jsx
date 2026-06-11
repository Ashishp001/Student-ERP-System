/* RegisterForm — Reusable registration form with conditional role fields */
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { ROLES } from '../../lib/constants';

export default function RegisterForm({ onSubmit, loading, courses = [] }) {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', username: '', password: '', confirmPassword: '', role: 'STUDENT', courseId: '', semester: '1', academicYear: '', enrollmentNumber: '', department: '', designation: '' });
  const [showPw, setShowPw] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = (e) => { e.preventDefault(); onSubmit?.(form); };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Row><Field label="Full Name" value={form.fullName} onChange={set('fullName')} required /><Field label="Username" value={form.username} onChange={set('username')} required /></Row>
      <Row><Field label="Email" type="email" value={form.email} onChange={set('email')} required /><Field label="Phone" value={form.phone} onChange={set('phone')} /></Row>
      <Row>
        <Field label="Password" type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} required suffix={<button type="button" onClick={() => setShowPw(!showPw)} style={eyeBtn}>{showPw ? <EyeOff size={14}/> : <Eye size={14}/>}</button>} />
        <Field label="Confirm Password" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} required />
      </Row>
      <div>
        <label style={labelStyle}>Role</label>
        <select value={form.role} onChange={set('role')} style={inputStyle}>
          <option value="STUDENT">Student</option>
          <option value="FACULTY">Faculty</option>
        </select>
      </div>
      {form.role === 'STUDENT' && (
        <>
          <Row>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Course</label>
              <select value={form.courseId} onChange={set('courseId')} style={inputStyle} required>
                <option value="">Select Course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
              </select>
            </div>
            <Field label="Semester" type="number" min="1" max="8" value={form.semester} onChange={set('semester')} required />
          </Row>
          <Row><Field label="Academic Year" value={form.academicYear} onChange={set('academicYear')} placeholder="2025-2026" /><Field label="Enrollment Number" value={form.enrollmentNumber} onChange={set('enrollmentNumber')} /></Row>
        </>
      )}
      {form.role === 'FACULTY' && (
        <Row><Field label="Department" value={form.department} onChange={set('department')} required /><Field label="Designation" value={form.designation} onChange={set('designation')} /></Row>
      )}
      <button type="submit" disabled={loading} style={{ padding: '12px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 4 }}>
        {loading ? 'Creating account...' : 'Register'}
      </button>
    </form>
  );
}

function Row({ children }) { return <div style={{ display: 'flex', gap: 12 }}>{children}</div>; }
function Field({ label, suffix, ...props }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input style={inputStyle} {...props} />
        {suffix && <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>{suffix}</span>}
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '14px', outline: 'none' };
const labelStyle = { fontSize: '13px', fontWeight: 500, color: 'var(--foreground)', display: 'block', marginBottom: 6 };
const eyeBtn = { background: 'none', border: 'none', color: 'var(--muted-fg)', cursor: 'pointer' };
