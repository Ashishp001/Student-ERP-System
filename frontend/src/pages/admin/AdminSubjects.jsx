import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import PageTransition from '../../components/blocks/PageTransition';
import EmptyState from '../../components/blocks/EmptyState';
import ConfirmDialog from '../../components/blocks/ConfirmDialog';
import { subjectsApi, coursesApi, usersApi } from '../../api';

const typeColors = {
  core:     { bg: 'hsl(221,83%,95%)', color: 'hsl(221,83%,40%)' },
  elective: { bg: 'hsl(142,60%,93%)', color: 'hsl(142,60%,30%)' },
  lab:      { bg: 'hsl(38,90%,93%)',  color: 'hsl(38,90%,35%)'  },
  project:  { bg: 'hsl(280,50%,93%)', color: 'hsl(280,50%,40%)' },
};

export default function AdminSubjects() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['subjects'], queryFn: () => subjectsApi.getAll() });
  const { data: coursesData } = useQuery({ queryKey: ['courses'], queryFn: () => coursesApi.getAll() });
  const { data: usersData } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.getAll() });

  const subjects  = data?.data || [];
  const courses   = coursesData?.data || [];
  const facultyList = (usersData?.data || []).filter(u => u.role === 'FACULTY');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm] = useState({ courseId: '', facultyId: '', name: '', code: '', semester: 1, credits: 3, type: 'core', maxInternalMarks: 40, maxExternalMarks: 60 });
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch]     = useState('');
  const [filterCourse, setFilterCourse] = useState('');

  const createMut = useMutation({
    mutationFn: (d) => subjectsApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subjects'] }); toast.success('Subject created successfully'); resetForm(); },
    onError: (e) => toast.error(e.response?.data?.detail || 'Failed to create subject'),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, d }) => subjectsApi.update(id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subjects'] }); toast.success('Subject updated successfully'); resetForm(); },
    onError: (e) => toast.error(e.response?.data?.detail || 'Failed to update subject'),
  });
  const deleteMut = useMutation({
    mutationFn: (id) => subjectsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subjects'] }); toast.success('Subject deactivated'); },
    onError: (e) => toast.error(e.response?.data?.detail || 'Failed to deactivate subject'),
  });

  const resetForm = () => { setShowForm(false); setEditing(null); setForm({ courseId: '', facultyId: '', name: '', code: '', semester: 1, credits: 3, type: 'core', maxInternalMarks: 40, maxExternalMarks: 60 }); };
  const startEdit = (s) => { setEditing(s.id); setForm({ courseId: s.courseId, facultyId: s.facultyId || '', name: s.name, code: s.code, semester: s.semester, credits: s.credits, type: s.type, maxInternalMarks: s.maxInternalMarks, maxExternalMarks: s.maxExternalMarks }); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, semester: parseInt(form.semester), credits: parseInt(form.credits), maxInternalMarks: parseFloat(form.maxInternalMarks), maxExternalMarks: parseFloat(form.maxExternalMarks), facultyId: form.facultyId || null };
    if (editing) updateMut.mutate({ id: editing, d: payload });
    else createMut.mutate(payload);
  };

  // Filtered list
  const filtered = subjects.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || (s.courseName || '').toLowerCase().includes(q);
    const matchCourse = !filterCourse || s.courseId === filterCourse;
    return matchSearch && matchCourse;
  });

  const inputStyle  = { width: '100%', padding: '9px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '13px', outline: 'none' };
  const labelStyle  = { fontSize: '12px', fontWeight: 500, color: 'var(--muted-fg)', display: 'block', marginBottom: 4 };
  const btnPrimary  = { padding: '9px 18px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 };

  return (
    <PageTransition>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Subjects</h1>
          <p style={{ fontSize: '13px', color: 'var(--muted-fg)', marginTop: 2 }}>{subjects.length} subject{subjects.length !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} style={btnPrimary}>
          <Plus size={16} /> Add Subject
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: 16 }}>{editing ? '✏️ Edit Subject' : '➕ New Subject'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Course *</label>
                <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} style={inputStyle} required>
                  <option value="">Select course</option>
                  {courses.filter(c => c.isActive).map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Subject Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} required placeholder="e.g. Data Structures" /></div>
              <div><label style={labelStyle}>Subject Code *</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} style={inputStyle} required placeholder="e.g. MCA-201" /></div>
              <div>
                <label style={labelStyle}>Faculty</label>
                <select value={form.facultyId} onChange={(e) => setForm({ ...form, facultyId: e.target.value })} style={inputStyle}>
                  <option value="">Unassigned</option>
                  {facultyList.map(f => <option key={f.id} value={f.id}>{f.fullName}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Semester *</label><input type="number" min={1} max={12} value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} style={inputStyle} required /></div>
              <div><label style={labelStyle}>Credits *</label><input type="number" min={1} value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} style={inputStyle} required /></div>
              <div>
                <label style={labelStyle}>Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={inputStyle}>
                  {['core', 'elective', 'lab', 'project'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Max Internal Marks</label><input type="number" value={form.maxInternalMarks} onChange={(e) => setForm({ ...form, maxInternalMarks: e.target.value })} style={inputStyle} /></div>
              <div><label style={labelStyle}>Max External Marks</label><input type="number" value={form.maxExternalMarks} onChange={(e) => setForm({ ...form, maxExternalMarks: e.target.value })} style={inputStyle} /></div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" style={btnPrimary} disabled={createMut.isPending || updateMut.isPending}>
                {(createMut.isPending || updateMut.isPending) ? 'Saving...' : (editing ? 'Update Subject' : 'Create Subject')}
              </button>
              <button type="button" onClick={resetForm} style={{ ...btnPrimary, background: 'var(--secondary)', color: 'var(--foreground)' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-fg)' }} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code or course…"
            style={{ ...inputStyle, paddingLeft: 32 }}
          />
        </div>
        <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: 180 }}>
          <option value="">All Courses</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Subjects Table */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted-fg)' }}>Loading subjects...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={subjects.length === 0 ? 'No subjects yet' : 'No results found'}
          description={subjects.length === 0 ? 'Create courses first, then add subjects using the button above.' : 'Try adjusting your search or filter.'}
        />
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', background: 'var(--secondary)' }}>
                {['Subject Name', 'Code', 'Course Name', 'Sem', 'Credits', 'Faculty', 'Type', 'Marks (Int/Ext)', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: 'var(--muted-fg)', fontSize: '11px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const tc = typeColors[s.type] || typeColors.core;
                return (
                  <tr key={s.id}
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Subject Name */}
                    <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--foreground)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <BookOpen size={13} color="#fff" />
                        </span>
                        {s.name}
                      </div>
                    </td>
                    {/* Code */}
                    <td style={{ padding: '11px 14px' }}>
                      <code style={{ background: 'var(--secondary)', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>{s.code}</code>
                    </td>
                    {/* Course Name — the key field! */}
                    <td style={{ padding: '11px 14px', fontWeight: 500, color: 'var(--foreground)' }}>
                      <div>{s.courseName || '—'}</div>
                      {s.courseCode && <div style={{ fontSize: 11, color: 'var(--muted-fg)' }}>{s.courseCode}</div>}
                    </td>
                    {/* Semester */}
                    <td style={{ padding: '11px 14px', textAlign: 'center' }}>{s.semester}</td>
                    {/* Credits */}
                    <td style={{ padding: '11px 14px', textAlign: 'center' }}>{s.credits}</td>
                    {/* Faculty */}
                    <td style={{ padding: '11px 14px', color: s.facultyName ? 'var(--foreground)' : 'var(--muted-fg)', fontStyle: s.facultyName ? 'normal' : 'italic' }}>
                      {s.facultyName || 'Unassigned'}
                    </td>
                    {/* Type badge */}
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ background: tc.bg, color: tc.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {s.type}
                      </span>
                    </td>
                    {/* Marks */}
                    <td style={{ padding: '11px 14px', color: 'var(--muted-fg)', fontSize: 12 }}>
                      {s.maxInternalMarks}/{s.maxExternalMarks}
                    </td>
                    {/* Status */}
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ color: s.isActive ? 'var(--success, #16a34a)' : 'var(--destructive)', fontWeight: 600, fontSize: 12 }}>
                        {s.isActive ? '● Active' : '● Inactive'}
                      </span>
                    </td>
                    {/* Actions */}
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => startEdit(s)}
                          title="Edit"
                          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '5px 9px', cursor: 'pointer', color: 'var(--foreground)', display: 'inline-flex', alignItems: 'center' }}
                        ><Pencil size={13} /></button>
                        <button
                          onClick={() => setDeleteId(s.id)}
                          title="Deactivate"
                          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '5px 9px', cursor: 'pointer', color: 'var(--destructive)', display: 'inline-flex', alignItems: 'center' }}
                        ><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Footer row count */}
          <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--muted-fg)' }}>
            Showing {filtered.length} of {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { deleteMut.mutate(deleteId); setDeleteId(null); }}
        title="Deactivate Subject?"
        description="This will hide the subject from active listings. Faculty and students won't see it."
        variant="destructive"
      />
    </PageTransition>
  );
}
