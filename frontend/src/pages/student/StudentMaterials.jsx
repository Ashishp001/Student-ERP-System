import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { BookOpen, Download, Search, Filter } from 'lucide-react';
import PageTransition from '../../components/blocks/PageTransition';
import EmptyState from '../../components/blocks/EmptyState';
import { materialsApi, subjectsApi } from '../../api';
import { formatDate, formatBytes } from '../../lib/utils';
import { API_BASE } from '../../lib/constants';

const FILE_ICONS = { 'application/pdf': '📄', 'application/vnd.ms-powerpoint': '📊', 'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📊', default: '📁' };

export default function StudentMaterials() {
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const { data: subData } = useQuery({ queryKey: ['my-subjects'], queryFn: () => subjectsApi.getMy() });
  const subjects = subData?.data || [];

  const { data: matData, isLoading } = useQuery({
    queryKey: ['materials', selectedSubjectId],
    queryFn: () => materialsApi.getAll(selectedSubjectId || undefined),
  });
  const materials = matData?.data || [];

  const dlMut = useMutation({ mutationFn: (id) => materialsApi.download(id) });

  return (
    <PageTransition>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <BookOpen size={22} style={{ color: 'var(--primary)' }} />
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Study Materials</h1>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Filter size={14} style={{ color: 'var(--muted-fg)' }} />
        <select value={selectedSubjectId} onChange={e => setSelectedSubjectId(e.target.value)}
          style={{ padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--background)', color: 'var(--foreground)', fontSize: 13 }}>
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 72, borderRadius: 'var(--radius-lg)', background: 'var(--muted)', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
        </div>
      ) : materials.length === 0 ? (
        <EmptyState title="No materials available" description="Your faculty hasn't uploaded any materials yet" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {materials.map(m => (
            <div key={m.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{FILE_ICONS[m.fileType] || FILE_ICONS.default}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{m.title}</p>
                  {m.topic && <p style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>{m.topic}</p>}
                  <p style={{ fontSize: 11, color: 'var(--muted-fg)' }}>{m.subjectName} · {m.facultyName}</p>
                </div>
              </div>
              {m.description && <p style={{ fontSize: 12, color: 'var(--muted-fg)', lineHeight: 1.5 }}>{m.description}</p>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--muted-fg)' }}>
                <span>{formatBytes(m.fileSize)} · {formatDate(m.createdAt)}</span>
                <span>{m.downloadCount} downloads</span>
              </div>
              <a
                href={`${API_BASE}${m.fileUrl}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => dlMut.mutate(m.id)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}
              >
                <Download size={13} /> Download
              </a>
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </PageTransition>
  );
}
