import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--background)', padding: 24,
    }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        {/* Large 404 */}
        <div style={{
          fontSize: 120, fontWeight: 800, lineHeight: 1,
          background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: 8,
        }}>
          404
        </div>

        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>

        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--foreground)', marginBottom: 8 }}>
          Page Not Found
        </h1>
        <p style={{ fontSize: 15, color: 'var(--muted-fg)', lineHeight: 1.6, marginBottom: 32 }}>
          The page you're looking for doesn't exist or has been moved.<br />
          Let's get you back on track.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 'var(--radius)',
              border: '1px solid var(--border)', background: 'var(--muted)',
              color: 'var(--foreground)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <ArrowLeft size={16} /> Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 'var(--radius)',
              border: 'none', background: 'var(--primary)',
              color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Home size={16} /> Go Home
          </button>
        </div>

        {/* Tip hint */}
        <p style={{ marginTop: 32, fontSize: 12, color: 'var(--muted-fg)' }}>
          💡 Tip: Press <kbd style={{ background: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 6px', fontSize: 11 }}>Ctrl+K</kbd> to quickly find any page.
        </p>
      </div>
    </div>
  );
}
