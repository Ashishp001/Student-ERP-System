/* shadcn/ui — Input primitive */
import { forwardRef } from 'react';

const Input = forwardRef(({ className, type = 'text', style, ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      style={{
        width: '100%',
        padding: '8px 12px',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        background: 'var(--background)',
        color: 'var(--foreground)',
        fontSize: '14px',
        fontFamily: 'inherit',
        outline: 'none',
        transition: 'border-color var(--transition), box-shadow var(--transition)',
        ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'var(--ring)';
        e.currentTarget.style.boxShadow = '0 0 0 2px color-mix(in srgb, var(--ring) 25%, transparent)';
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
        props.onBlur?.(e);
      }}
      {...props}
    />
  );
});

Input.displayName = 'Input';
export { Input };
