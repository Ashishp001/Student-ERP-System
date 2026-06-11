/* AttendanceGrid — Monthly attendance heatmap */
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

/**
 * @param {Array} records - Array of { date, status } objects
 * @param {Date} month - Month to display
 */
export default function AttendanceGrid({ records = [], month = new Date(), style }) {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });

  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const startDayOfWeek = start.getDay();

  const getStatus = (date) => {
    const record = records.find((r) => isSameDay(new Date(r.date), date));
    return record?.status || null;
  };

  const statusColors = {
    present: 'var(--success, hsl(160,84%,39%))',
    absent: 'var(--destructive, hsl(0,84%,60%))',
    leave: 'var(--warning, hsl(38,92%,50%))',
  };

  return (
    <div style={{ ...style }}>
      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)', marginBottom: 10 }}>
        {format(month, 'MMMM yyyy')}
      </p>

      {/* Day name headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {dayNames.map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: '10px', fontWeight: 600, color: 'var(--muted-fg)', padding: '2px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {/* Empty cells for offset */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map((day) => {
          const status = getStatus(day);
          return (
            <div
              key={day.toISOString()}
              title={`${format(day, 'dd MMM')} — ${status || 'No class'}`}
              style={{
                width: '100%', aspectRatio: '1', borderRadius: 4,
                background: status ? statusColors[status] : 'var(--muted)',
                opacity: status ? 1 : 0.3,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', color: status ? '#fff' : 'var(--muted-fg)',
                fontWeight: 500, cursor: 'default',
              }}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: '11px', color: 'var(--muted-fg)' }}>
        {Object.entries(statusColors).map(([label, color]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
            <span style={{ textTransform: 'capitalize' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
