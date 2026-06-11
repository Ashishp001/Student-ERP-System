/* shadcn/ui — Card primitives */
export function Card({ children, style, ...props }) {
  return (
    <div style={{
      background: 'var(--card)', color: 'var(--card-fg)',
      border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)', ...style,
    }} {...props}>{children}</div>
  );
}

export function CardHeader({ children, style, ...props }) {
  return <div style={{ padding: '20px 24px 0', ...style }} {...props}>{children}</div>;
}

export function CardTitle({ children, style, ...props }) {
  return (
    <h3 style={{ fontSize: '16px', fontWeight: 700, lineHeight: 1.3, ...style }} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, style, ...props }) {
  return (
    <p style={{ fontSize: '13px', color: 'var(--muted-fg)', marginTop: 4, ...style }} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, style, ...props }) {
  return <div style={{ padding: '16px 24px', ...style }} {...props}>{children}</div>;
}

export function CardFooter({ children, style, ...props }) {
  return (
    <div style={{
      padding: '0 24px 20px', display: 'flex', alignItems: 'center', gap: 8, ...style,
    }} {...props}>{children}</div>
  );
}
