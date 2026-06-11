import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import PageTransition from '../../components/blocks/PageTransition';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Enter a valid email address');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200)); // Simulate API call
    setSent(true);
    setLoading(false);
    toast.success('Password reset instructions sent');
  };

  return (
    <PageTransition>
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--background)', padding: 24,
      }}>
        {/* Background gradient */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, hsl(221 83% 53% / 0.08), transparent)',
        }} />

        <div style={{
          position: 'relative', zIndex: 1, width: '100%', maxWidth: 420,
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '36px 32px',
          boxShadow: 'var(--shadow-lg)',
          animation: 'scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, hsl(221,83%,53%), hsl(217,91%,60%))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px', boxShadow: '0 4px 12px hsl(221 83% 53% / 0.3)',
            }}>
              <Mail size={24} color="#fff" />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: 4 }}>Forgot Password?</h1>
            <p style={{ fontSize: '13px', color: 'var(--muted-fg)', lineHeight: 1.5 }}>
              Enter your email and we'll send you reset instructions
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--muted-fg)', display: 'block', marginBottom: 6 }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{
                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--muted-fg)', pointerEvents: 'none',
                  }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@iicmr.edu.in"
                    required
                    style={{
                      width: '100%', padding: '10px 12px 10px 36px',
                      borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                      background: 'var(--background)', color: 'var(--foreground)',
                      fontSize: '14px', fontFamily: 'inherit', outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--ring)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '11px', borderRadius: 'var(--radius)',
                  border: 'none', background: 'var(--primary)', color: '#fff',
                  fontWeight: 600, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1, transition: 'opacity var(--transition)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent',
                      borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite',
                    }} />
                    Sending...
                  </>
                ) : 'Send Reset Instructions'}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto 16px' }} />
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: 8 }}>Check your inbox</h2>
              <p style={{ fontSize: '13px', color: 'var(--muted-fg)', lineHeight: 1.6 }}>
                If an account exists for <strong>{email}</strong>, you'll receive password reset instructions shortly.
              </p>
              <p style={{ fontSize: '12px', color: 'var(--muted-fg)', marginTop: 12 }}>
                Didn't receive an email? Check your spam folder.
              </p>
            </div>
          )}

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Link
              to="/login"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: '13px', fontWeight: 500, color: 'var(--primary)',
              }}
            >
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
