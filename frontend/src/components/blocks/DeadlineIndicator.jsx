import { differenceInHours, differenceInDays, isPast } from 'date-fns';

/**
 * DeadlineIndicator — color-coded countdown badge per PRD 9.1
 * green  → more than 3 days
 * yellow → 1–3 days
 * red    → less than 24 hours
 * gray   → deadline passed (overdue)
 */
export default function DeadlineIndicator({ deadline, style = {} }) {
  if (!deadline) return null;

  const date = new Date(deadline);
  const now = new Date();

  let label, bg, color;

  if (isPast(date)) {
    label = 'Overdue';
    bg = 'rgba(107,114,128,0.15)';
    color = '#6b7280';
  } else {
    const hoursLeft = differenceInHours(date, now);
    const daysLeft = differenceInDays(date, now);

    if (hoursLeft < 24) {
      label = hoursLeft <= 1 ? 'Due in < 1 hour' : `Due in ${hoursLeft}h`;
      bg = 'rgba(239,68,68,0.15)';
      color = '#ef4444';
    } else if (daysLeft < 3) {
      label = `${daysLeft + 1} day${daysLeft + 1 > 1 ? 's' : ''} left`;
      bg = 'rgba(245,158,11,0.15)';
      color = '#f59e0b';
    } else {
      label = `${daysLeft} days left`;
      bg = 'rgba(16,185,129,0.15)';
      color = '#10b981';
    }
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 10px',
      borderRadius: 9999,
      fontSize: 11,
      fontWeight: 600,
      background: bg,
      color,
      whiteSpace: 'nowrap',
      ...style,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: color, flexShrink: 0,
      }} />
      {label}
    </span>
  );
}
