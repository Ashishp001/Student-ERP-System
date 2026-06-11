import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const colorMap = {
  blue: { bg: 'rgba(59,130,246,0.12)', text: '#3b82f6', border: '#3b82f6' },
  green: { bg: 'rgba(16,185,129,0.12)', text: '#10b981', border: '#10b981' },
  red: { bg: 'rgba(239,68,68,0.12)', text: '#ef4444', border: '#ef4444' },
  orange: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b', border: '#f59e0b' },
  gray: { bg: 'rgba(107,114,128,0.12)', text: '#6b7280', border: '#6b7280' },
  purple: { bg: 'rgba(139,92,246,0.12)', text: '#8b5cf6', border: '#8b5cf6' },
};

export default function StatusBadge({ status, color, className }) {
  const c = colorMap[color] || colorMap.gray;
  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 10px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 600,
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}22`,
        textTransform: 'capitalize',
      }}
      className={className}
    >
      {status}
    </motion.span>
  );
}
