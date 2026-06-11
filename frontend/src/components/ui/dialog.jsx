/* shadcn/ui — Dialog (Modal) primitive */
import { useEffect } from 'react';
import { X } from 'lucide-react';

export function Dialog({ open, onClose, children }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    if (open) {
      document.addEventListener('keydown', handler);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      {children}
    </div>
  );
}

export function DialogContent({ children, style, ...props }) {
  return (
    <div
      style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
        padding: '24px', width: '90%', maxWidth: '520px', maxHeight: '90vh',
        overflowY: 'auto', position: 'relative',
        animation: 'scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ children, onClose, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, ...style }}>
      <div style={{ flex: 1 }}>{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            width: 28, height: 28, borderRadius: 'var(--radius)', border: 'none',
            background: 'var(--muted)', color: 'var(--muted-fg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', marginLeft: 8, flexShrink: 0,
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export function DialogTitle({ children, style }) {
  return <h2 style={{ fontSize: '18px', fontWeight: 700, ...style }}>{children}</h2>;
}

export function DialogFooter({ children, style }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20, ...style }}>
      {children}
    </div>
  );
}
