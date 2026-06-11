/* shadcn/ui — Skeleton loading primitive */
export function Skeleton({ style, ...props }) {
  return (
    <div
      style={{
        borderRadius: 'var(--radius)',
        background: 'var(--muted)',
        animation: 'pulse 1.8s ease-in-out infinite',
        ...style,
      }}
      {...props}
    />
  );
}

/* Add to index.css: @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} } */
