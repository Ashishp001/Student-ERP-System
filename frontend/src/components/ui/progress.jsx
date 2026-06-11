/* shadcn/ui — Progress primitive */
export function Progress({ value = 0, max = 100, color, style, ...props }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor = color || (pct < 40 ? 'var(--destructive)' : pct < 75 ? 'var(--warning)' : 'var(--success)');

  return (
    <div
      style={{
        width: '100%', height: 8, borderRadius: '9999px',
        background: 'var(--muted)', overflow: 'hidden', ...style,
      }}
      {...props}
    >
      <div style={{
        height: '100%', width: `${pct}%`, borderRadius: '9999px',
        background: barColor, transition: 'width 0.5s ease',
      }} />
    </div>
  );
}
