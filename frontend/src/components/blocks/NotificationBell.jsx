import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, X, CheckCheck } from 'lucide-react';
import { notificationsApi } from '../../api';
import { timeAgo } from '../../lib/utils';
import useAuthStore from '../../store/authStore';

const TYPE_COLORS = {
  assignment: '#3b82f6', grade: '#10b981', notice: '#8b5cf6',
  attendance: '#f59e0b', result: '#10b981', grievance: '#ef4444', default: '#6b7280',
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);

  // Poll unread count every 30 seconds
  const { data: countData } = useQuery({
    queryKey: ['notif-count'],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 30_000,
    enabled: !!user,
  });
  const unread = countData?.data ?? 0;

  const { data: notifsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll(0, 10),
    enabled: open,
  });
  const notifications = notifsData?.data?.content || [];

  const markReadMut = useMutation({
    mutationFn: (id) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notif-count', 'notifications'] }),
  });

  const markAllMut = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notif-count'] }); qc.invalidateQueries({ queryKey: ['notifications'] }); },
  });

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 36, height: 36, borderRadius: 'var(--radius)', border: '1px solid var(--border)',
          background: 'var(--secondary)', cursor: 'pointer', color: 'var(--foreground)',
        }}
      >
        <Bell size={16} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: '#ef4444', color: '#fff', borderRadius: 9999,
            fontSize: 10, fontWeight: 700, minWidth: 16, height: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 3px',
          }}>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 8,
          width: 340, maxHeight: 480,
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
          zIndex: 200, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Notifications {unread > 0 && <span style={{ color: 'var(--muted-fg)', fontWeight: 400, fontSize: 12 }}>({unread} new)</span>}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {unread > 0 && (
                <button onClick={() => markAllMut.mutate()} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-fg)' }}>
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted-fg)', fontSize: 13 }}>
                🔔 No notifications yet
              </div>
            ) : notifications.map(n => (
              <div
                key={n.id}
                onClick={() => { if (!n.isRead) markReadMut.mutate(n.id); }}
                style={{
                  padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: n.isRead ? 'default' : 'pointer',
                  background: n.isRead ? 'transparent' : 'color-mix(in srgb, var(--primary) 4%, transparent)',
                  transition: 'background 150ms',
                  display: 'flex', gap: 10,
                }}
                onMouseEnter={e => { if (!n.isRead) e.currentTarget.style.background = 'var(--muted)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = n.isRead ? 'transparent' : 'color-mix(in srgb, var(--primary) 4%, transparent)'; }}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', marginTop: 6, flexShrink: 0,
                  background: n.isRead ? 'transparent' : (TYPE_COLORS[n.type] || TYPE_COLORS.default),
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: n.isRead ? 400 : 600, fontSize: 13, marginBottom: 2 }}>{n.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted-fg)', lineHeight: 1.4 }}>{n.message}</p>
                  <p style={{ fontSize: 10, color: 'var(--muted-fg)', marginTop: 4 }}>{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
