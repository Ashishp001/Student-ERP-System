import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import PageTransition from '../../components/blocks/PageTransition';
import EmptyState from '../../components/blocks/EmptyState';
import ConfirmDialog from '../../components/blocks/ConfirmDialog';
import { coursesApi } from '../../api';

export default function AdminCourses() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['courses'], queryFn: () => coursesApi.getAll() });
  const courses = data?.data || [];
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', totalSemesters: 4, totalCredits: '' });
  const [deleteCourse, setDeleteCourse] = useState(null);

  const createMut = useMutation({ mutationFn: (d) => coursesApi.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); toast.success('Course created'); resetForm(); } });
  const updateMut = useMutation({ mutationFn: ({ id, d }) => coursesApi.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); toast.success('Course updated'); resetForm(); } });
  const deleteMut = useMutation({
    mutationFn: (id) => coursesApi.delete(id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['courses'] });
      toast.success(res?.message || 'Course updated');
      setDeleteCourse(null);
    },
    onError: (e) => {
      toast.error(e.response?.data?.detail || 'Failed to delete course');
    },
  });

  const resetForm = () => { setShowForm(false); setEditing(null); setForm({ name: '', code: '', totalSemesters: 4, totalCredits: '' }); };
  const startEdit = (c) => { setEditing(c.id); setForm({ name: c.name, code: c.code, totalSemesters: c.totalSemesters, totalCredits: c.totalCredits || '' }); setShowForm(true); };
  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, totalSemesters: parseInt(form.totalSemesters), totalCredits: form.totalCredits ? parseInt(form.totalCredits) : null };
    if (editing) updateMut.mutate({ id: editing, d: payload });
    else createMut.mutate(payload);
  };

  const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '13px', outline: 'none' };
  const labelStyle = { fontSize: '12px', fontWeight: 500, color: 'var(--muted-fg)', display: 'block', marginBottom: 4 };
  const btnPrimary = { padding: '9px 18px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 };

  return (
    <PageTransition>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Courses</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} style={btnPrimary}><Plus size={16} /> Add Course</button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: 14 }}>{editing ? 'Edit Course' : 'New Course'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, alignItems: 'end' }}>
            <div><label style={labelStyle}>Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} required /></div>
            <div><label style={labelStyle}>Code *</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} style={inputStyle} required placeholder="e.g. MCA" /></div>
            <div><label style={labelStyle}>Semesters *</label><input type="number" min={1} value={form.totalSemesters} onChange={(e) => setForm({ ...form, totalSemesters: e.target.value })} style={inputStyle} required /></div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" style={btnPrimary}>{editing ? 'Update' : 'Create'}</button>
              <button type="button" onClick={resetForm} style={{ ...btnPrimary, background: 'var(--secondary)', color: 'var(--foreground)' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {courses.length === 0 && !isLoading ? (
        <EmptyState title="No courses yet" description="Create your first course to get started" />
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {['Name', 'Code', 'Semesters', 'Credits', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: 'var(--muted-fg)', fontSize: '11px', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background var(--transition)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 14px', fontWeight: 500 }}>{c.name}</td>
                  <td style={{ padding: '10px 14px' }}><code style={{ background: 'var(--secondary)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{c.code}</code></td>
                  <td style={{ padding: '10px 14px' }}>{c.totalSemesters}</td>
                  <td style={{ padding: '10px 14px' }}>{c.totalCredits || '—'}</td>
                  <td style={{ padding: '10px 14px', color: c.isActive ? 'var(--success)' : 'var(--destructive)', fontWeight: 500 }}>{c.isActive ? 'Active' : 'Inactive'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => startEdit(c)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '4px 8px', cursor: 'pointer', color: 'var(--foreground)' }}><Pencil size={13} /></button>
                      <button onClick={() => setDeleteCourse(c)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '4px 8px', cursor: 'pointer', color: 'var(--destructive)' }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog
        open={!!deleteCourse}
        onClose={() => setDeleteCourse(null)}
        onConfirm={() => deleteMut.mutate(deleteCourse.id)}
        title={deleteCourse?.isActive ? 'Deactivate Course?' : 'Delete Course Permanently?'}
        description={
          deleteCourse?.isActive
            ? 'This will hide the course from active listings.'
            : 'This will permanently remove the inactive course from the system.'
        }
        variant="destructive"
      />
    </PageTransition>
  );
}
