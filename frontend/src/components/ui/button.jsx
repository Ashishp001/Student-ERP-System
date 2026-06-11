/* shadcn/ui — Button primitive */
import { forwardRef } from 'react';

const variants = {
  default: { background: 'var(--primary)', color: 'var(--primary-fg)', border: 'none' },
  destructive: { background: 'var(--destructive)', color: '#fff', border: 'none' },
  outline: { background: 'transparent', color: 'var(--foreground)', border: '1px solid var(--border)' },
  secondary: { background: 'var(--secondary)', color: 'var(--secondary-fg)', border: 'none' },
  ghost: { background: 'transparent', color: 'var(--foreground)', border: 'none' },
  link: { background: 'transparent', color: 'var(--primary)', border: 'none', textDecoration: 'underline', padding: 0 },
};

const sizes = {
  default: { padding: '8px 16px', fontSize: '14px', minHeight: '36px' },
  sm: { padding: '4px 12px', fontSize: '12px', minHeight: '28px' },
  lg: { padding: '10px 24px', fontSize: '15px', minHeight: '44px' },
  icon: { padding: '0', width: '36px', height: '36px' },
};

const Button = forwardRef(({
  children, variant = 'default', size = 'default',
  disabled = false, loading = false, style, ...props
}, ref) => {
  const variantStyle = variants[variant] || variants.default;
  const sizeStyle = sizes[size] || sizes.default;

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        borderRadius: 'var(--radius)', fontWeight: 600, fontFamily: 'inherit',
        cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'opacity var(--transition), transform var(--transition)',
        whiteSpace: 'nowrap', userSelect: 'none',
        ...variantStyle, ...sizeStyle, ...style,
      }}
      onMouseEnter={(e) => { if (!disabled && !loading) e.currentTarget.style.opacity = '0.85'; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = disabled ? '0.5' : '1'; }}
      onMouseDown={(e) => { if (!disabled && !loading) e.currentTarget.style.transform = 'scale(0.98)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      {...props}
    >
      {loading ? (
        <>
          <span style={{
            width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent',
            borderRadius: '50%', display: 'inline-block',
            animation: 'spin 0.6s linear infinite',
          }} />
          {children}
        </>
      ) : children}
    </button>
  );
});

Button.displayName = 'Button';
export { Button };
