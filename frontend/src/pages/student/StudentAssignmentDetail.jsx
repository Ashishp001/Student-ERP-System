import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Download, Upload, FileText, Clock, Award,
  CheckCircle2, AlertTriangle, RefreshCw, Star,
} from 'lucide-react';
import { toast } from 'sonner';
import PageTransition from '../../components/blocks/PageTransition';
import DeadlineIndicator from '../../components/blocks/DeadlineIndicator';
import { assignmentsApi, submissionsApi } from '../../api';
import { formatDateTime, formatBytes } from '../../lib/utils';
import { API_BASE } from '../../lib/constants';

export default function StudentAssignmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragging, setDragging] = useState(false);

  // Fetch assignment + submission info
  const { data: aData, isLoading: aLoading, error: aError } = useQuery({
    queryKey: ['assignment', id],
    queryFn: () => assignmentsApi.getById(id),
    enabled: !!id,
  });

  const assignment = aData?.data;

  // Fetch student's own submission for this assignment
  const { data: subData } = useQuery({
    queryKey: ['my-submission', id],
    queryFn: () => submissionsApi.getMyForAssignment(id),
    enabled: !!id,
    retry: false, // 404 = not submitted yet, that's fine
  });
  const submission = subData?.data;

  const submitMut = useMutation({
    mutationFn: ({ assignmentId, file }) => submissionsApi.submit(assignmentId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-submission', id] });
      qc.invalidateQueries({ queryKey: ['student-assignments'] });
      toast.success('Assignment submitted successfully!');
      setSelectedFile(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Submission failed'),
  });

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF files are accepted');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large — max 10 MB');
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };

  const handleSubmit = () => {
    if (!selectedFile || !assignment) return;
    submitMut.mutate({ assignmentId: assignment.id, file: selectedFile });
  };

  const isDeadlinePassed = assignment && new Date(assignment.deadline) < new Date();
  const canSubmit = assignment &&
    assignment.status === 'published' &&
    (!isDeadlinePassed || assignment.allowLate);

  if (aLoading) return (
    <PageTransition>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            height: 80, background: 'var(--muted)', borderRadius: 'var(--radius-lg)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        ))}
      </div>
    </PageTransition>
  );

  if (aError || !assignment) return (
    <PageTransition>
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted-fg)' }}>
        <AlertTriangle size={40} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
        <p>Assignment not found.</p>
        <button onClick={() => navigate(-1)} style={linkBtn}>← Go back</button>
      </div>
    </PageTransition>
  );

  return (
    <PageTransition>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none',
          border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          padding: '6px 12px', cursor: 'pointer', color: 'var(--muted-fg)', fontSize: 13,
        }}>
          <ArrowLeft size={14} /> Back
        </button>
        <span style={{
          padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
          background: statusBg(assignment.status), color: statusColor(assignment.status),
        }}>
          {assignment.status.toUpperCase()}
        </span>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 24 }}>

        {/* ── Left Column: Assignment Info ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={card}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{assignment.title}</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              <span style={metaBadge}>{assignment.subjectName} · {assignment.subjectCode}</span>
              <span style={metaBadge}>Prof. {assignment.facultyName}</span>
            </div>

            {/* Meta row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 16 }}>
              <div style={metaItem}>
                <Award size={14} style={{ color: 'var(--primary)' }} />
                <span>Total Marks: <strong>{assignment.totalMarks}</strong></span>
              </div>
              <div style={metaItem}>
                <Clock size={14} style={{ color: 'var(--muted-fg)' }} />
                <span>Deadline: <strong>{formatDateTime(assignment.deadline)}</strong></span>
              </div>
              <DeadlineIndicator deadline={assignment.deadline} />
            </div>

            {/* Instructions */}
            {assignment.instructions && (
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Instructions
                </p>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--foreground)', whiteSpace: 'pre-wrap' }}>
                  {assignment.instructions}
                </p>
              </div>
            )}
          </div>

          {/* Reference File */}
          {assignment.fileUrl && (
            <div style={card}>
              <p style={sectionLabel}>Reference File</p>
              <a
                href={`${API_BASE}${assignment.fileUrl}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '8px 16px', borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)', background: 'var(--muted)',
                  color: 'var(--foreground)', textDecoration: 'none', fontSize: 13,
                  fontWeight: 500, transition: 'all 150ms',
                }}
              >
                <FileText size={14} style={{ color: 'var(--primary)' }} />
                {assignment.fileName || 'Download reference'}
                <Download size={12} style={{ color: 'var(--muted-fg)' }} />
              </a>
            </div>
          )}
        </div>

        {/* ── Right Column: Submission Zone ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={card}>
            <p style={sectionLabel}>Your Submission</p>

            {/* ── Graded state ── */}
            {submission?.status === 'graded' ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <Star size={28} style={{ color: '#f59e0b' }} />
                  <div>
                    <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--success)', lineHeight: 1 }}>
                      {submission.obtainedMarks}<span style={{ fontSize: 16, color: 'var(--muted-fg)', fontWeight: 400 }}>/{submission.totalMarks}</span>
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--muted-fg)' }}>
                      Graded by {submission.gradedByName} · {formatDateTime(submission.gradedAt)}
                    </p>
                  </div>
                </div>
                {submission.feedback && (
                  <div style={{
                    background: 'var(--muted)', borderRadius: 'var(--radius)',
                    padding: 12, marginBottom: 16,
                  }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted-fg)', marginBottom: 4 }}>Feedback</p>
                    <p style={{ fontSize: 13, lineHeight: 1.6 }}>{submission.feedback}</p>
                  </div>
                )}
                <SubmittedFileRow submission={submission} />
              </div>

            ) : submission ? (
              /* ── Already submitted (not yet graded) ── */
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                  <span style={{ fontWeight: 600, color: 'var(--success)' }}>Submitted</span>
                  {submission.isLate && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#ef4444', background: '#ef444422', padding: '2px 8px', borderRadius: 9999 }}>
                      Late
                    </span>
                  )}
                </div>
                <SubmittedFileRow submission={submission} />
                {canSubmit && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontSize: 12, color: 'var(--muted-fg)', marginBottom: 8 }}>Resubmit a new version</p>
                    <DropZone
                      dragging={dragging} setDragging={setDragging}
                      selectedFile={selectedFile} fileInputRef={fileInputRef}
                      onFileSelect={handleFileSelect} onDrop={handleDrop}
                    />
                    {selectedFile && (
                      <button onClick={handleSubmit} disabled={submitMut.isPending} style={submitBtn}>
                        <RefreshCw size={14} />
                        {submitMut.isPending ? 'Resubmitting…' : 'Resubmit'}
                      </button>
                    )}
                  </div>
                )}
              </div>

            ) : canSubmit ? (
              /* ── Not submitted, can submit ── */
              <div>
                <p style={{ fontSize: 13, color: 'var(--muted-fg)', marginBottom: 12 }}>
                  Upload your assignment as a PDF (max 10 MB)
                </p>
                <DropZone
                  dragging={dragging} setDragging={setDragging}
                  selectedFile={selectedFile} fileInputRef={fileInputRef}
                  onFileSelect={handleFileSelect} onDrop={handleDrop}
                />
                {selectedFile && (
                  <button onClick={handleSubmit} disabled={submitMut.isPending} style={submitBtn}>
                    <Upload size={14} />
                    {submitMut.isPending ? 'Submitting…' : 'Submit Assignment'}
                  </button>
                )}
              </div>

            ) : (
              /* ── Deadline passed, not submitted ── */
              <div style={{
                padding: '20px', textAlign: 'center', background: 'var(--muted)',
                borderRadius: 'var(--radius)', color: 'var(--muted-fg)',
              }}>
                <AlertTriangle size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <p style={{ fontSize: 14 }}>Deadline passed. Submission is closed.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        @media (max-width: 768px) {
          .assignment-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </PageTransition>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SubmittedFileRow({ submission }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 14px', background: 'var(--muted)', borderRadius: 'var(--radius)',
      flexWrap: 'wrap', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <FileText size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 500 }}>{submission.fileName}</p>
          <p style={{ fontSize: 11, color: 'var(--muted-fg)' }}>
            {formatBytes(submission.fileSize)} · Submitted {formatDateTime(submission.submittedAt)}
          </p>
        </div>
      </div>
      <a
        href={`${API_BASE}${submission.fileUrl}`}
        target="_blank"
        rel="noreferrer"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 12, color: 'var(--primary)', textDecoration: 'none', fontWeight: 500,
        }}
      >
        <Download size={12} /> View
      </a>
    </div>
  );
}

function DropZone({ dragging, setDragging, selectedFile, fileInputRef, onFileSelect, onDrop }) {
  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      style={{
        border: `2px dashed ${dragging ? 'var(--primary)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)', padding: '24px 16px', textAlign: 'center',
        cursor: 'pointer', transition: 'all 150ms',
        background: dragging ? 'rgba(59,130,246,0.05)' : 'transparent',
        marginBottom: 12,
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        style={{ display: 'none' }}
        onChange={e => onFileSelect(e.target.files?.[0])}
      />
      <Upload size={24} style={{ margin: '0 auto 8px', color: 'var(--primary)', opacity: 0.7 }} />
      {selectedFile ? (
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>{selectedFile.name}</p>
          <p style={{ fontSize: 11, color: 'var(--muted-fg)' }}>{formatBytes(selectedFile.size)} · Click to change</p>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: 13, fontWeight: 500 }}>Drag & drop your PDF here</p>
          <p style={{ fontSize: 11, color: 'var(--muted-fg)' }}>or click to browse · PDF only · max 10 MB</p>
        </div>
      )}
    </div>
  );
}

// ── Style helpers ─────────────────────────────────────────────────────────────
const card = {
  background: 'var(--card)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)', padding: '20px 24px',
};
const sectionLabel = {
  fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.07em', color: 'var(--muted-fg)', marginBottom: 12,
};
const metaBadge = {
  background: 'var(--secondary)', padding: '3px 10px',
  borderRadius: 9999, fontSize: 12, color: 'var(--secondary-fg)',
};
const metaItem = {
  display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
  color: 'var(--muted-fg)',
};
const linkBtn = {
  marginTop: 12, background: 'none', border: 'none',
  color: 'var(--primary)', cursor: 'pointer', fontSize: 13,
};
const submitBtn = {
  width: '100%', padding: '10px 16px', borderRadius: 'var(--radius)',
  border: 'none', background: 'var(--primary)', color: '#fff',
  fontSize: 14, fontWeight: 600, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  transition: 'opacity 150ms',
};

function statusBg(status) {
  if (status === 'published') return '#3b82f622';
  if (status === 'closed') return '#ef444422';
  return '#6b728022';
}
function statusColor(status) {
  if (status === 'published') return '#3b82f6';
  if (status === 'closed') return '#ef4444';
  return '#6b7280';
}
