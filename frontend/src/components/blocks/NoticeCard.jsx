/* NoticeCard — Notice preview card for feeds */
import { motion } from 'framer-motion';
import { Pin, Megaphone } from 'lucide-react';
import { timeAgo } from '../../lib/utils';

const categoryColors = {
  academic: { bg: 'hsl(221,83%,53%)', label: 'Academic' },
  event: { bg: 'hsl(270,70%,55%)', label: 'Event' },
  urgent: { bg: 'hsl(0,84%,60%)', label: 'Urgent' },
  general: { bg: 'hsl(210,10%,50%)', label: 'General' },
};

/**
 * @param {Object} notice - { id, title, content, category, createdAt, isPinned, createdByName }
 * @param {function} onClick - click handler
 * @param {number} index - for stagger animation
 */
export default function NoticeCard({ notice, onClick, index = 0 }) {
  const cat = categoryColors[notice.category] || categoryColors.general;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      onClick={onClick}
      style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg, 12px)', padding: 16,
        cursor: onClick ? 'pointer' : 'default',
        borderLeft: notice.category === 'urgent' ? '3px solid var(--destructive)' : undefined,
        transition: 'box-shadow var(--transition)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            {notice.isPinned && <Pin size={12} style={{ color: 'var(--primary)' }} />}
            <span style={{
              fontSize: '11px', fontWeight: 600, padding: '2px 8px',
              borderRadius: '9999px', background: cat.bg, color: '#fff',
            }}>
              {cat.label}
            </span>
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', marginBottom: 4 }}>
            {notice.title}
          </h3>
          <p style={{
            fontSize: '12px', color: 'var(--muted-fg)', lineHeight: 1.5,
            overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {notice.content}
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, fontSize: '11px', color: 'var(--muted-fg)' }}>
        <span>{notice.createdByName || 'Admin'}</span>
        <span>{timeAgo(notice.createdAt)}</span>
      </div>
    </motion.div>
  );
}
