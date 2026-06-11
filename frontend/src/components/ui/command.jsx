/* shadcn/ui — Command (cmdk palette) primitive */
import { useState, useEffect, useRef, forwardRef } from 'react';
import { Search } from 'lucide-react';

export function Command({ children, style, ...props }) {
  return (
    <div
      style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        width: '100%', maxWidth: 520,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CommandInput({ value, onChange, placeholder = 'Type a command or search...', ...props }) {
  const ref = useRef(null);

  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
      <Search size={16} style={{ color: 'var(--muted-fg)', flexShrink: 0 }} />
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1, border: 'none', outline: 'none', background: 'none',
          color: 'var(--foreground)', fontSize: '14px',
        }}
        {...props}
      />
    </div>
  );
}

export function CommandList({ children, style }) {
  return (
    <div style={{ maxHeight: 300, overflowY: 'auto', padding: '4px 0', ...style }}>
      {children}
    </div>
  );
}

export function CommandGroup({ heading, children, style }) {
  return (
    <div style={{ ...style }}>
      {heading && (
        <div style={{ padding: '8px 16px 4px', fontSize: '11px', fontWeight: 600, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {heading}
        </div>
      )}
      {children}
    </div>
  );
}

export function CommandItem({ children, onSelect, style, ...props }) {
  return (
    <button
      onClick={onSelect}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
        padding: '8px 16px', border: 'none', background: 'none',
        color: 'var(--foreground)', fontSize: '13px', cursor: 'pointer',
        textAlign: 'left', transition: 'background var(--transition)',
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

export function CommandEmpty({ children }) {
  return (
    <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: '13px', color: 'var(--muted-fg)' }}>
      {children || 'No results found.'}
    </div>
  );
}

export function CommandSeparator() {
  return <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />;
}
