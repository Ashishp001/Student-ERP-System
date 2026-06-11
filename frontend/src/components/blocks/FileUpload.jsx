import { useCallback, useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { formatBytes } from '../../lib/utils';

export default function FileUpload({ accept = '.pdf,.doc,.docx', maxSize = 10 * 1024 * 1024, onFileSelect, value, label = 'Upload File' }) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const handleFile = useCallback((file) => {
    setError('');
    if (!file) return;
    if (file.size > maxSize) {
      setError(`File too large. Max: ${formatBytes(maxSize)}`);
      return;
    }
    onFileSelect(file);
  }, [maxSize, onFileSelect]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    handleFile(file);
  }, [handleFile]);

  const handleChange = useCallback((e) => {
    handleFile(e.target.files?.[0]);
  }, [handleFile]);

  return (
    <div>
      <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--foreground)', marginBottom: 6, display: 'block' }}>{label}</label>
      {value ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
          background: 'var(--secondary)', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
        }}>
          <FileText size={18} style={{ color: 'var(--primary)' }} />
          <span style={{ flex: 1, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {value.name} <span style={{ color: 'var(--muted-fg)' }}>({formatBytes(value.size)})</span>
          </span>
          <button type="button" onClick={() => onFileSelect(null)} style={{
            background: 'none', border: 'none', color: 'var(--muted-fg)', padding: 2,
          }}><X size={16} /></button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: 'var(--radius)', padding: '28px 20px', textAlign: 'center',
            background: dragActive ? 'var(--primary)08' : 'var(--secondary)',
            transition: 'all var(--transition)', cursor: 'pointer',
          }}
          onClick={() => document.getElementById('file-upload-input')?.click()}
        >
          <Upload size={28} style={{ color: 'var(--muted-fg)', marginBottom: 8, margin: '0 auto' }} />
          <p style={{ fontSize: '13px', color: 'var(--muted-fg)', marginTop: 8 }}>
            Drag & drop or <span style={{ color: 'var(--primary)', fontWeight: 600 }}>browse</span>
          </p>
          <p style={{ fontSize: '11px', color: 'var(--muted-fg)', marginTop: 4 }}>Max: {formatBytes(maxSize)}</p>
          <input id="file-upload-input" type="file" accept={accept} onChange={handleChange} style={{ display: 'none' }} />
        </div>
      )}
      {error && <p style={{ color: 'var(--destructive)', fontSize: '12px', marginTop: 4 }}>{error}</p>}
    </div>
  );
}
