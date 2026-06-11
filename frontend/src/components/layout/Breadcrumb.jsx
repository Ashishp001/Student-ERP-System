import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/** Dynamic breadcrumb — auto-generates path segments from current URL */
export default function Breadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((seg, i) => {
    const path = '/' + segments.slice(0, i + 1).join('/');
    const label = seg
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const isLast = i === segments.length - 1;

    return { label, path, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px' }}>
      <Link
        to="/"
        style={{ color: 'var(--muted-fg)', display: 'flex', alignItems: 'center' }}
      >
        <Home size={14} />
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ChevronRight size={12} style={{ color: 'var(--muted-fg)' }} />
          {crumb.isLast ? (
            <span style={{ fontWeight: 500, color: 'var(--foreground)' }}>{crumb.label}</span>
          ) : (
            <Link
              to={crumb.path}
              style={{
                color: 'var(--muted-fg)', textDecoration: 'none',
                transition: 'color var(--transition)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--foreground)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted-fg)'; }}
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
