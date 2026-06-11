import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, LogIn, GraduationCap, BookOpen, ShieldCheck, AlertCircle, X } from 'lucide-react';
import { authApi } from '../../api';
import useAuthStore from '../../store/authStore';
import { ROLES } from '../../lib/constants';
import { Toaster, toast } from 'sonner';

const roleRedirect = { [ROLES.STUDENT]: '/student', [ROLES.FACULTY]: '/faculty', [ROLES.ADMIN]: '/admin' };

const roleOptions = [
  { value: 'STUDENT', label: 'Student', icon: GraduationCap },
  { value: 'FACULTY', label: 'Faculty', icon: BookOpen },
  { value: 'ADMIN', label: 'Admin', icon: ShieldCheck },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorPopup, setErrorPopup] = useState(null);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  // Auto-dismiss error popup after 5 seconds
  useEffect(() => {
    if (!errorPopup) return;
    const timer = setTimeout(() => setErrorPopup(null), 5000);
    return () => clearTimeout(timer);
  }, [errorPopup]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const res = await authApi.login({ email, password, role });
      const { user, tokens } = res.data;
      setAuth(user, tokens);
      toast.success('Login successful!');
      navigate(roleRedirect[user.role] || '/student');
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail || err.response?.data?.message;
      if (status === 401) {
        setErrorPopup(detail || 'Wrong credentials! Please check your email and password.');
      } else if (status === 403) {
        setErrorPopup(detail || 'Your account has been deactivated. Contact admin.');
      } else if (!err.response) {
        setErrorPopup('Unable to connect to server. Please check your internet connection.');
      } else {
        setErrorPopup(detail || 'Login failed. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)',
    border: '1px solid var(--border)', background: 'var(--background)',
    color: 'var(--foreground)', fontSize: '14px', outline: 'none',
    transition: 'border var(--transition)',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, hsl(220,25%,12%) 0%, hsl(240,20%,18%) 40%, hsl(200,40%,16%) 100%)',
      padding: '20px',
    }}>
      <Toaster position="top-right" richColors />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          background: 'var(--card)', borderRadius: '16px', padding: '40px',
          width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '14px', background: 'var(--primary)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 18, color: '#fff', marginBottom: 16,
          }}>EP</div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--foreground)', marginBottom: 4 }}>Welcome back</h1>
          <p style={{ fontSize: '14px', color: 'var(--muted-fg)' }}>Sign in to IICMR EduPortal</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Role Selector */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--foreground)', display: 'block', marginBottom: 8 }}>Login as</label>
            <div style={{ display: 'flex', gap: 8, background: 'var(--background)', borderRadius: 'var(--radius)', padding: 4, border: '1px solid var(--border)' }}>
              {roleOptions.map((opt) => {
                const isActive = role === opt.value;
                const Icon = opt.icon;
                return (
                  <motion.button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      flex: 1, padding: '8px 4px', borderRadius: 'calc(var(--radius) - 2px)',
                      border: 'none', cursor: 'pointer',
                      background: isActive ? 'var(--primary)' : 'transparent',
                      color: isActive ? '#fff' : 'var(--muted-fg)',
                      fontSize: '13px', fontWeight: isActive ? 600 : 500,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Icon size={14} />
                    {opt.label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--foreground)', display: 'block', marginBottom: 6 }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--foreground)' }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 500 }}>Forgot password?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--muted-fg)', cursor: 'pointer',
              }}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </div>

          {/* Error Popup */}
          <AnimatePresence>
            {errorPopup && (
              <motion.div
                key="error-popup"
                initial={{ opacity: 0, y: -10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1,
                  x: [0, -8, 8, -6, 6, -4, 4, 0],
                  transition: { x: { duration: 0.4, ease: 'easeOut' }, opacity: { duration: 0.2 }, scale: { duration: 0.2 } }
                }}
                exit={{ opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.2 } }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  background: 'rgba(239,68,68,0.12)',
                  border: '1px solid rgba(239,68,68,0.45)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  position: 'relative',
                }}
              >
                <AlertCircle size={18} style={{ color: '#f87171', flexShrink: 0, marginTop: 1 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#fca5a5' }}>Login Failed</p>
                  <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#fca5a5', opacity: 0.85 }}>{errorPopup}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorPopup(null)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#f87171', padding: 2, display: 'flex', alignItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <X size={15} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit" disabled={loading}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{
              padding: '12px', borderRadius: 'var(--radius)', border: 'none',
              background: 'var(--primary)', color: '#fff', fontSize: '14px', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 8,
            }}
          >
            <LogIn size={16} /> {loading ? 'Signing in...' : 'Sign In'}
          </motion.button>
        </form>
        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--muted-fg)', marginTop: 20 }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Register</Link>
        </p>
      </motion.div>
    </div>
  );
}
