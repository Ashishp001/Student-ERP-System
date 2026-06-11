/* shadcn/ui — Calendar primitive */
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameDay, isSameMonth } from 'date-fns';

export function Calendar({ selected, onSelect, style }) {
  const [currentMonth, setCurrentMonth] = useState(selected || new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const days = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div style={{ padding: 12, width: 280, ...style }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} style={navBtnStyle}>
          <ChevronLeft size={14} />
        </button>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} style={navBtnStyle}>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Day names */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
        {dayNames.map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 600, color: 'var(--muted-fg)', padding: '4px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
        {days.map((d, i) => {
          const isSelected = selected && isSameDay(d, selected);
          const isCurrentMonth = isSameMonth(d, monthStart);
          const isToday = isSameDay(d, new Date());
          return (
            <button
              key={i}
              onClick={() => onSelect?.(d)}
              style={{
                width: 36, height: 36, border: 'none', borderRadius: 'var(--radius)',
                background: isSelected ? 'var(--primary)' : 'none',
                color: isSelected ? 'var(--primary-fg)' : isCurrentMonth ? 'var(--foreground)' : 'var(--muted-fg)',
                fontWeight: isToday ? 700 : 400, fontSize: '13px',
                cursor: 'pointer', transition: 'background var(--transition)',
                outline: isToday && !isSelected ? '1px solid var(--primary)' : 'none',
              }}
              onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--muted)'; }}
              onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'none'; }}
            >
              {format(d, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const navBtnStyle = {
  width: 28, height: 28, borderRadius: 'var(--radius)', border: '1px solid var(--border)',
  background: 'none', color: 'var(--foreground)', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
