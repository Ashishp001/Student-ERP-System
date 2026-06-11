/* shadcn/ui — Sheet (sliding drawer) primitive — used for mobile sidebar */
import { useEffect } from 'react';
import { X } from 'lucide-react';

export function Sheet({ open, onClose, children }) {
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
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      {children}
    </div>
  );
}

export function SheetContent({ children, side = 'left', style, onClose, ...props }) {
  const sideStyles = {
    left: { left: 0, top: 0, bottom: 0, width: 280, animation: 'slideInLeft 0.2s ease-out' },
    right: { right: 0, top: 0, bottom: 0, width: 280, animation: 'slideInRight 0.2s ease-out' },
  };

  return (
    <div
      style={{
        position: 'fixed',
        background: 'var(--sidebar, var(--card))',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex', flexDirection: 'column',
        ...sideStyles[side],
        ...style,
      }}
      {...props}
    >
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 12, right: 12, width: 28, height: 28,
            borderRadius: 'var(--radius)', border: 'none',
            background: 'rgba(255,255,255,0.1)', color: 'var(--sidebar-fg, var(--foreground))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 1,
          }}
        >
          <X size={14} />
        </button>
      )}
      {children}
    </div>
  );
}

export function SheetHeader({ children, style }) {
  return (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', ...style }}>
      {children}
    </div>
  );
}

export function SheetTitle({ children, style }) {
  return (
    <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--sidebar-fg, var(--foreground))', ...style }}>
      {children}
    </h2>
  );
}
