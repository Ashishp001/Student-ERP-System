/* SubmissionRow — Row in faculty's submission grading table */
import { Eye, Download, Check, Clock } from 'lucide-react';
import { formatDateTime } from '../../lib/utils';
import StatusBadge from './StatusBadge';

/**
 * @param {Object} submission - { id, studentName, enrollmentNumber, submittedAt, isLate, fileUrl, fileName, obtainedMarks, feedback, status }
 * @param {number} totalMarks - assignment total marks
 * @param {function} onView - view PDF handler
 * @param {function} onDownload - download file handler
 * @param {function} onGradeChange - grade input change handler
 * @param {function} onFeedbackChange - feedback input change handler
 * @param {function} onSave - save grade handler
 * @param {number} index - row index
 */
export default function SubmissionRow({
  submission, totalMarks, onView, onDownload,
  onGradeChange, onFeedbackChange, onSave, index = 0,
}) {
  const isGraded = submission.status === 'graded' || submission.status === 'returned';

  return (
    <tr style={{
      borderBottom: '1px solid var(--border)',
      borderLeft: submission.isLate ? '3px solid var(--destructive)' : 'none',
      transition: 'background var(--transition)',
      animation: `fadeIn 0.2s ease-out ${index * 0.03}s both`,
    }}>
      <td style={cellStyle}>{index + 1}</td>
      <td style={cellStyle}>
        <div>
          <span style={{ fontWeight: 500, color: 'var(--foreground)' }}>{submission.studentName}</span>
          <br />
          <span style={{ fontSize: '11px', color: 'var(--muted-fg)' }}>{submission.enrollmentNumber}</span>
        </div>
      </td>
      <td style={cellStyle}>
        <span style={{ fontSize: '12px', color: 'var(--muted-fg)' }}>
          {formatDateTime(submission.submittedAt)}
        </span>
      </td>
      <td style={cellStyle}>
        {submission.isLate ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '12px', color: 'var(--destructive)', fontWeight: 500 }}>
            <Clock size={12} /> Late
          </span>
        ) : '—'}
      </td>
      <td style={cellStyle}>
        <div style={{ display: 'flex', gap: 4 }}>
          {onView && (
            <button onClick={() => onView(submission)} style={iconBtnStyle} title="View PDF">
              <Eye size={14} />
            </button>
          )}
          {onDownload && (
            <button onClick={() => onDownload(submission)} style={iconBtnStyle} title="Download">
              <Download size={14} />
            </button>
          )}
        </div>
      </td>
      <td style={cellStyle}>
        <input
          type="number"
          min="0"
          max={totalMarks}
          value={submission.obtainedMarks ?? ''}
          onChange={(e) => onGradeChange?.(submission.id, e.target.value)}
          disabled={submission.isLocked}
          style={{
            width: 60, padding: '4px 6px', borderRadius: 'var(--radius)',
            border: '1px solid var(--border)', background: 'var(--background)',
            color: 'var(--foreground)', fontSize: '13px', textAlign: 'center',
          }}
        />
        <span style={{ fontSize: '12px', color: 'var(--muted-fg)', marginLeft: 3 }}>/{totalMarks}</span>
      </td>
      <td style={cellStyle}>
        <textarea
          value={submission.feedback ?? ''}
          onChange={(e) => onFeedbackChange?.(submission.id, e.target.value)}
          disabled={submission.isLocked}
          rows={1}
          style={{
            width: '100%', minWidth: 120, padding: '4px 6px',
            borderRadius: 'var(--radius)', border: '1px solid var(--border)',
            background: 'var(--background)', color: 'var(--foreground)',
            fontSize: '12px', resize: 'vertical',
          }}
        />
      </td>
      <td style={cellStyle}>
        {isGraded ? (
          <Check size={16} style={{ color: 'var(--success, hsl(160,84%,39%))' }} />
        ) : (
          onSave && (
            <button
              onClick={() => onSave(submission.id)}
              style={{
                padding: '4px 10px', borderRadius: 'var(--radius)', border: 'none',
                background: 'var(--primary)', color: '#fff', fontSize: '12px',
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              Save
            </button>
          )
        )}
      </td>
    </tr>
  );
}

const cellStyle = { padding: '10px 12px', fontSize: '13px', color: 'var(--foreground)', verticalAlign: 'middle' };
const iconBtnStyle = {
  width: 28, height: 28, borderRadius: 'var(--radius)', border: '1px solid var(--border)',
  background: 'none', color: 'var(--foreground)', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
