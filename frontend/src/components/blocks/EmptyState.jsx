import { FileX } from 'lucide-react';

export default function EmptyState({ icon: Icon = FileX, title = 'No data', description = '', action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '60px 20px', color: 'var(--muted-fg)', textAlign: 'center',
    }}>
      <Icon size={56} strokeWidth={1.2} style={{ marginBottom: 16, opacity: 0.5 }} />
      <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--foreground)', marginBottom: 6 }}>{title}</h3>
      {description && <p style={{ fontSize: '14px', maxWidth: 320, marginBottom: 16 }}>{description}</p>}
      {action && action}
    </div>
  );
}
