import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', description = '', variant = 'default' }) {
  if (!open) return null;

  const isDestructive = variant === 'destructive';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
    }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--card)', borderRadius: 'var(--radius-lg)', padding: '24px',
          maxWidth: 400, width: '90%', boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          {isDestructive && (
            <div style={{
              width: 40, height: 40, borderRadius: '50%', background: 'rgba(239,68,68,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <AlertTriangle size={20} color="#ef4444" />
            </div>
          )}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--foreground)', marginBottom: 4 }}>{title}</h3>
            {description && <p style={{ fontSize: '13px', color: 'var(--muted-fg)' }}>{description}</p>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
              background: 'var(--card)', color: 'var(--foreground)', fontSize: '13px', fontWeight: 500,
            }}
          >Cancel</button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            style={{
              padding: '8px 16px', borderRadius: 'var(--radius)', border: 'none',
              background: isDestructive ? 'var(--destructive)' : 'var(--primary)',
              color: 'white', fontSize: '13px', fontWeight: 500,
            }}
          >{isDestructive ? 'Delete' : 'Confirm'}</button>
        </div>
      </div>
    </div>
  );
}
