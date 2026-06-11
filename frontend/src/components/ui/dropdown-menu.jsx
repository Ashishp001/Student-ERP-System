/* shadcn/ui — DropdownMenu primitive */
import { useState, useRef, useEffect } from 'react';

export function DropdownMenu({ children }) {
  return <div style={{ position: 'relative', display: 'inline-block' }}>{children}</div>;
}

export function DropdownMenuTrigger({ children, asChild, onClick, ...props }) {
  return (
    <div onClick={onClick} style={{ cursor: 'pointer' }} {...props}>
      {children}
    </div>
  );
}

export function DropdownMenuContent({ open, onClose, children, align = 'end', style, ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute', top: '100%', ...(align === 'end' ? { right: 0 } : { left: 0 }),
        marginTop: 4, minWidth: 180, background: 'var(--card)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-lg)', zIndex: 200, overflow: 'hidden', padding: '4px 0',
        animation: 'scaleIn 0.15s ease-out', transformOrigin: 'top',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({ children, onClick, destructive, disabled, style, ...props }) {
  return (
    <button
      onClick={(e) => { if (!disabled) onClick?.(e); }}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
        padding: '8px 12px', border: 'none', background: 'none',
        color: destructive ? 'var(--destructive)' : 'var(--foreground)',
        fontSize: '13px', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, textAlign: 'left',
        transition: 'background var(--transition)',
        ...style,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--muted)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator() {
  return <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />;
}

export function DropdownMenuLabel({ children, style }) {
  return (
    <div style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600, color: 'var(--muted-fg)', ...style }}>
      {children}
    </div>
  );
}
