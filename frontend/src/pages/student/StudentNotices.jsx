import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Bell } from 'lucide-react';
import PageTransition from '../../components/blocks/PageTransition';
import EmptyState from '../../components/blocks/EmptyState';
import { noticesApi } from '../../api';
import { formatDateTime } from '../../lib/utils';
import { API_BASE } from '../../lib/constants';

const formatInstructorName = (name) => {
  if (!name || typeof name !== 'string') return 'Faculty';
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

export default function StudentNotices() {
  const [selectedNotice, setSelectedNotice] = useState(null);
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['notice-feed'],
    queryFn: () => noticesApi.getFeed(),
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
  });
  const notices = data?.data || [];

  return (
    <PageTransition>
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: 20 }}>Notices</h1>
      {isLoading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted-fg)' }}>Loading...</div>
      ) : notices.length === 0 ? (
        <EmptyState title="No notices" description="New notices will appear here" icon={Bell} />
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Notice</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '12px', borderBottom: '1px solid var(--border)' }}>Sr.No</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '12px', borderBottom: '1px solid var(--border)' }}>Notice Title</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '12px', borderBottom: '1px solid var(--border)' }}>Instructor Name</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '12px', borderBottom: '1px solid var(--border)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {notices.map((n, idx) => (
                <tr key={n.id}>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>{idx + 1}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>{n.title}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>{formatInstructorName(n.createdByName)}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={() => setSelectedNotice(n)}
                        style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' }}
                      >
                        View
                      </button>
                      {n.fileUrl && (
                        <a href={`${API_BASE}${n.fileUrl}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Download size={12} /> File
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedNotice && (
        <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>{selectedNotice.title}</div>
          <div style={{ fontSize: '13px', color: 'var(--muted-fg)', marginBottom: 8 }}>{selectedNotice.content}</div>
          <div style={{ fontSize: '11px', color: 'var(--muted-fg)' }}>
            By: {formatInstructorName(selectedNotice.createdByName)} · {formatDateTime(selectedNotice.createdAt)}
          </div>
        </div>
      )}
      {isFetching && !isLoading && (
        <div style={{ marginTop: 10, fontSize: '11px', color: 'var(--muted-fg)' }}>Syncing latest notices...</div>
      )}
    </PageTransition>
  );
}
