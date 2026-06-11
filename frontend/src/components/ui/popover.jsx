/* shadcn/ui — Popover primitive */
import { useState, useRef, useEffect } from 'react';

export function Popover({ children }) {
  return <div style={{ position: 'relative', display: 'inline-block' }}>{children}</div>;
}

export function PopoverTrigger({ children, onClick, ...props }) {
  return (
    <div onClick={onClick} style={{ cursor: 'pointer', display: 'inline-flex' }} {...props}>
      {children}
    </div>
  );
}

export function PopoverContent({ open, onClose, children, align = 'start', style, ...props }) {
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
        marginTop: 4, background: 'var(--card)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-lg)', zIndex: 200,
        animation: 'scaleIn 0.15s ease-out',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
