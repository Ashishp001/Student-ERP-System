/* shadcn/ui — Avatar primitive */
import { getInitials } from '../../lib/utils';

export function Avatar({ src, name, size = 40, style, ...props }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        background: 'var(--primary)', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.35, fontWeight: 700, color: '#fff',
        flexShrink: 0, border: '2px solid var(--border)',
        ...style,
      }}
      {...props}
    >
      {src ? (
        <img src={src} alt={name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}
