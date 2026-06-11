/* shadcn/ui — Tooltip primitive */
import { useState, useRef } from 'react';

export function Tooltip({ children }) {
  return <>{children}</>;
}

export function TooltipTrigger({ children, onMouseEnter, onMouseLeave, ...props }) {
  return (
    <span onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} style={{ display: 'inline-flex' }} {...props}>
      {children}
    </span>
  );
}

export function TooltipContent({ children, visible, style, ...props }) {
  if (!visible) return null;
  return (
    <div
      style={{
        position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
        marginBottom: 6, padding: '4px 8px', borderRadius: 'var(--radius)',
        background: 'var(--foreground)', color: 'var(--background)',
        fontSize: '12px', whiteSpace: 'nowrap', zIndex: 300,
        animation: 'fadeIn 0.15s ease-out', pointerEvents: 'none',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

/** Simplified tooltip wrapper — wraps a single element with tooltip behavior */
export function SimpleTooltip({ content, children }) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <TooltipContent visible={visible}>{content}</TooltipContent>
    </span>
  );
}
