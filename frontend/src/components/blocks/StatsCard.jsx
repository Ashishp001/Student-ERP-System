import { motion } from 'framer-motion';

export default function StatsCard({ title, value, icon: Icon, trend, trendValue, onClick, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      whileHover={{ y: -2, boxShadow: 'var(--shadow-lg)' }}
      onClick={onClick}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow var(--transition)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '13px', color: 'var(--muted-fg)', fontWeight: 500, marginBottom: 4 }}>{title}</p>
          <motion.p
            style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1.2 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.08 + 0.2, duration: 0.4 }}
          >
            {value}
          </motion.p>
          {trend && (
            <p style={{ fontSize: '12px', marginTop: 4, color: trend === 'up' ? 'var(--success)' : 'var(--destructive)', fontWeight: 500 }}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </p>
          )}
        </div>
        {Icon && (
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--radius)',
            background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={22} color="var(--primary-fg)" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
