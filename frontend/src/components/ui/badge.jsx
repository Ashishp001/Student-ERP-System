/* shadcn/ui — Badge primitive */
const variantStyles = {
  default:     { background: 'var(--primary)',     color: 'var(--primary-fg)' },
  secondary:   { background: 'var(--secondary)',   color: 'var(--secondary-fg)' },
  destructive: { background: 'var(--destructive)', color: '#fff' },
  success:     { background: 'var(--success)',     color: '#fff' },
  warning:     { background: 'var(--warning)',     color: '#1a1a00' },
  outline:     { background: 'transparent',        color: 'var(--foreground)', border: '1px solid var(--border)' },
};

export function Badge({ children, variant = 'default', style, ...props }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: '9999px',
        fontSize: '11px',
        fontWeight: 600,
        lineHeight: 1.5,
        whiteSpace: 'nowrap',
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}
