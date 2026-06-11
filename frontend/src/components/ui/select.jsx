/* shadcn/ui — Select primitive */
import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({ children, style, ...props }, ref) => {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <select
        ref={ref}
        style={{
          width: '100%',
          padding: '8px 32px 8px 12px',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          background: 'var(--background)',
          color: 'var(--foreground)',
          fontSize: '14px',
          fontFamily: 'inherit',
          outline: 'none',
          appearance: 'none',
          cursor: 'pointer',
          transition: 'border-color var(--transition)',
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--ring)';
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          props.onBlur?.(e);
        }}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={14}
        style={{
          position: 'absolute',
          right: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          color: 'var(--muted-fg)',
        }}
      />
    </div>
  );
});

Select.displayName = 'Select';
export { Select };
