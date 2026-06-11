/* shadcn/ui — Textarea primitive */
import { forwardRef } from 'react';

const Textarea = forwardRef(({ style, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      style={{
        width: '100%',
        minHeight: '80px',
        padding: '8px 12px',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        background: 'var(--background)',
        color: 'var(--foreground)',
        fontSize: '14px',
        fontFamily: 'inherit',
        outline: 'none',
        resize: 'vertical',
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
    />
  );
});

Textarea.displayName = 'Textarea';
export { Textarea };
