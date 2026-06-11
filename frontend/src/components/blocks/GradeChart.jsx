/* GradeChart — GPA trend line chart */
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * @param {Array} data - Array of { semester, sgpa, cgpa } objects
 */
export default function GradeChart({ data = [], style }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted-fg)', fontSize: '13px', ...style }}>
        No GPA data available yet.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 260, ...style }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="semester"
            tick={{ fontSize: 12, fill: 'var(--muted-fg)' }}
            tickFormatter={(v) => `Sem ${v}`}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fontSize: 12, fill: 'var(--muted-fg)' }}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', fontSize: '12px',
            }}
          />
          <Line
            type="monotone" dataKey="sgpa" name="SGPA"
            stroke="var(--primary)" strokeWidth={2} dot={{ r: 4 }}
            animationDuration={600}
          />
          <Line
            type="monotone" dataKey="cgpa" name="CGPA"
            stroke="var(--success, hsl(160,84%,39%))" strokeWidth={2} dot={{ r: 4 }}
            strokeDasharray="5 5"
            animationDuration={600}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
