import { useEffect } from 'react';
import { X, Download, ZoomIn, FileText, ExternalLink } from 'lucide-react';

/**
 * PDFViewer — inline PDF preview modal
 * Props: url (string), title (string), open (bool), onClose (fn)
 */
export default function PDFViewer({ url, title, open, onClose }) {
  // Escape key closes
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    if (open) {
      document.addEventListener('keydown', handler);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || !url) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = title || 'document.pdf';
    a.target = '_blank';
    a.click();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        display: 'flex', flexDirection: 'column',
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', background: 'hsl(222,47%,6%)',
        borderBottom: '1px solid hsl(217,33%,17%)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileText size={18} color="#6366f1" />
          <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '14px', maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title || 'Document Preview'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => window.open(url, '_blank')}
            title="Open in new tab"
            style={{
              padding: '6px 12px', borderRadius: 'var(--radius)', border: '1px solid hsl(217,33%,17%)',
              background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '12px',
              display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit', fontWeight: 500,
            }}
          >
            <ExternalLink size={13} /> Open Tab
          </button>
          <button
            onClick={handleDownload}
            title="Download"
            style={{
              padding: '6px 12px', borderRadius: 'var(--radius)', border: 'none',
              background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: '12px',
              display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit', fontWeight: 600,
            }}
          >
            <Download size={13} /> Download
          </button>
          <button
            onClick={onClose}
            title="Close preview"
            style={{
              width: 32, height: 32, borderRadius: 'var(--radius)', border: 'none',
              background: 'hsl(217,33%,17%)', color: '#94a3b8', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* PDF Iframe */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{
          width: '100%', maxWidth: 960, height: '100%',
          background: '#fff', borderRadius: 'var(--radius-lg)',
          overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          animation: 'scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <iframe
            src={`${url}#toolbar=0&navpanes=0&scrollbar=1`}
            title={title || 'PDF Preview'}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            allowFullScreen
          />
        </div>
      </div>

      {/* Fallback hint */}
      <div style={{
        padding: '8px 20px', textAlign: 'center',
        background: 'hsl(222,47%,6%)', borderTop: '1px solid hsl(217,33%,17%)',
        flexShrink: 0,
      }}>
        <p style={{ fontSize: '11px', color: '#475569' }}>
          If the PDF does not load,{' '}
          <button
            onClick={() => window.open(url, '_blank')}
            style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '11px', padding: 0, fontFamily: 'inherit', textDecoration: 'underline' }}
          >
            open it in a new tab
          </button>
          {' '}or{' '}
          <button
            onClick={handleDownload}
            style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '11px', padding: 0, fontFamily: 'inherit', textDecoration: 'underline' }}
          >
            download directly
          </button>.
        </p>
      </div>
    </div>
  );
}
