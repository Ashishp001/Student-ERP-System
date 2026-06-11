/* AssignmentCard — Assignment preview card for feeds */
import { motion } from 'framer-motion';
import { FileText, Clock, User } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import StatusBadge from './StatusBadge';
import DeadlineIndicator from './DeadlineIndicator';

/**
 * @param {Object} assignment - { id, title, subjectName, subjectCode, facultyName, totalMarks, deadline, status }
 * @param {string} submissionStatus - 'pending' | 'submitted' | 'graded' | 'late' | 'closed'
 * @param {number} obtainedMarks - marks obtained (if graded)
 * @param {function} onClick - click handler
 * @param {number} index - for stagger animation
 */
export default function AssignmentCard({ assignment, submissionStatus, obtainedMarks, onClick, index = 0 }) {
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
        transition: 'box-shadow var(--transition), transform var(--transition)',
      }}
      whileHover={onClick ? { y: -2, boxShadow: 'var(--shadow-md)' } : {}}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)', marginBottom: 6 }}>
            {assignment.title}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: '12px', color: 'var(--muted-fg)', marginBottom: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <FileText size={12} /> {assignment.subjectCode || assignment.subjectName}
            </span>
            {assignment.facultyName && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <User size={12} /> {assignment.facultyName}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} /> {formatDate(assignment.deadline)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--muted-fg)' }}>
              Marks: {obtainedMarks != null ? `${obtainedMarks}/` : ''}{assignment.totalMarks}
            </span>
            <DeadlineIndicator deadline={assignment.deadline} />
          </div>
        </div>
        <div>
          <StatusBadge status={submissionStatus || assignment.status} />
        </div>
      </div>
    </motion.div>
  );
}
