import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { authApi, coursesApi } from '../../api';
import useAuthStore from '../../store/authStore';
import { ROLES } from '../../lib/constants';
import { toast, Toaster } from 'sonner';

const roleRedirect = { [ROLES.STUDENT]: '/student', [ROLES.FACULTY]: '/faculty', [ROLES.ADMIN]: '/admin' };

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', username: '', password: '', role: 'STUDENT', phone: '', enrollmentNumber: '', courseId: '', currentSemester: 1, department: '', designation: '' });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    coursesApi.getAll().then(res => setCourses(res.data || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.username || !form.password) { toast.error('Please fill required fields'); return; }
    const normalizedFullName = form.fullName.trim().replace(/\s+/g, ' ');
    if (normalizedFullName.split(' ').length < 2) { toast.error('Please enter full name with name and surname'); return; }
    setLoading(true);
    try {
      const payload = {
        fullName: normalizedFullName,
        email: form.email?.trim(),
        username: form.username?.trim(),
        password: form.password,
        role: form.role?.toUpperCase(),
        phone: form.phone?.trim() || null,
      };

      if (form.role === 'STUDENT') {
        payload.enrollmentNumber = form.enrollmentNumber?.trim() || null;
        payload.courseId = form.courseId || null;
        payload.currentSemester = form.currentSemester ? Number(form.currentSemester) : 1;
      } else if (form.role === 'FACULTY') {
        payload.department = form.department?.trim() || null;
        payload.designation = form.designation?.trim() || null;
      }

      const res = await authApi.register(payload);
      const { user, tokens } = res.data;
      setAuth(user, tokens);
      toast.success('Account created!');
      navigate(roleRedirect[user.role] || '/student');
    } catch (err) {
      const data = err.response?.data;
      const validation = data?.errors ? Object.values(data.errors)[0] : null;
      toast.error(data?.message || data?.detail || validation || 'Registration failed');
    } finally { setLoading(false); }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)',
    border: '1px solid var(--border)', background: 'var(--background)',
    color: 'var(--foreground)', fontSize: '14px', outline: 'none',
  };
  const labelStyle = { fontSize: '13px', fontWeight: 500, color: 'var(--foreground)', display: 'block', marginBottom: 4 };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, hsl(220,25%,12%) 0%, hsl(240,20%,18%) 40%, hsl(200,40%,16%) 100%)', padding: 20,
    }}>
      <Toaster position="top-right" richColors />
      <Motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{
          background: 'var(--card)', borderRadius: '16px', padding: '36px', width: '100%', maxWidth: 480,
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)', border: '1px solid var(--border)',
          maxHeight: '90vh', overflowY: 'auto',
        }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#fff', marginBottom: 12 }}>EP</div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--foreground)' }}>Create Account</h1>
          <p style={{ fontSize: '14px', color: 'var(--muted-fg)' }}>Join IICMR EduPortal</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={labelStyle}>Full Name *</label><input value={form.fullName} onChange={set('fullName')} style={inputStyle} /></div>
            <div><label style={labelStyle}>Username *</label><input value={form.username} onChange={set('username')} style={inputStyle} /></div>
          </div>
          <div><label style={labelStyle}>Email *</label><input type="email" value={form.email} onChange={set('email')} style={inputStyle} /></div>
          <div><label style={labelStyle}>Password *</label><input type="password" value={form.password} onChange={set('password')} style={inputStyle} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={labelStyle}>Phone</label><input value={form.phone} onChange={set('phone')} style={inputStyle} /></div>
            <div>
              <label style={labelStyle}>Role *</label>
              <select value={form.role} onChange={set('role')} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="STUDENT">Student</option>
                <option value="FACULTY">Faculty</option>
              </select>
            </div>
          </div>
          {form.role === 'STUDENT' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={labelStyle}>Enrollment No.</label><input value={form.enrollmentNumber} onChange={set('enrollmentNumber')} style={inputStyle} /></div>
                <div>
                  <label style={labelStyle}>Course *</label>
                  <select value={form.courseId} onChange={set('courseId')} style={{ ...inputStyle, cursor: 'pointer' }} required>
                    <option value="">Select Course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Current Semester</label>
                <input type="number" min={1} max={8} value={form.currentSemester} onChange={set('currentSemester')} style={inputStyle} />
              </div>
            </>
          )}
          {form.role === 'FACULTY' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={labelStyle}>Department</label><input value={form.department} onChange={set('department')} style={inputStyle} /></div>
              <div><label style={labelStyle}>Designation</label><input value={form.designation} onChange={set('designation')} style={inputStyle} /></div>
            </div>
          )}
          <Motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{
              padding: '12px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)',
              color: '#fff', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4,
            }}>
            <UserPlus size={16} /> {loading ? 'Creating...' : 'Create Account'}
          </Motion.button>
        </form>
        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--muted-fg)', marginTop: 16 }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </Motion.div>
    </div>
  );
}
