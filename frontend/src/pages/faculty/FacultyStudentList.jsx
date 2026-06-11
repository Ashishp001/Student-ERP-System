import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, GraduationCap, BookOpen } from 'lucide-react';
import PageTransition from '../../components/blocks/PageTransition';
import { Skeleton } from '../../components/ui/skeleton';
import { Badge } from '../../components/ui/badge';
import { subjectsApi, usersApi } from '../../api';
import { getInitials } from '../../lib/utils';
import useDebounce from '../../hooks/useDebounce';

export default function FacultyStudentList() {
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: subjectsData, isLoading: subjectsLoading } = useQuery({
    queryKey: ['my-subjects'],
    queryFn: () => subjectsApi.getMy(),
  });
  const subjects = subjectsData?.data || [];

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['all-users', 'student'],
    queryFn: () => usersApi.getAll(),
    enabled: true,
  });

  // Filter students enrolled in same course+semester as the selected subject
  const allStudents = (usersData?.data || []).filter((u) => u.role === 'STUDENT');

  const filteredStudents = allStudents.filter((s) => {
    const matchesSemester = selectedSubject
      ? s.studentProfile?.currentSemester === selectedSubject.semester &&
        s.studentProfile?.courseId === selectedSubject.courseId
      : true;
    const matchesSearch = !debouncedSearch ||
      s.fullName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      s.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      s.studentProfile?.enrollmentNumber?.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchesSemester && matchesSearch;
  });

  const isLoading = subjectsLoading || usersLoading;

  return (
    <PageTransition>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Users size={22} color="var(--primary)" /> Student List
        </h1>
        <p style={{ color: 'var(--muted-fg)', fontSize: '13px', marginTop: 4 }}>
          Students enrolled in your subjects
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-fg)', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or enrollment no."
            style={{
              width: '100%', padding: '9px 12px 9px 34px', boxSizing: 'border-box',
              borderRadius: 'var(--radius)', border: '1px solid var(--border)',
              background: 'var(--background)', color: 'var(--foreground)',
              fontSize: '13px', fontFamily: 'inherit', outline: 'none',
            }}
          />
        </div>

        <div style={{ position: 'relative', minWidth: 240 }}>
          <BookOpen size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-fg)', pointerEvents: 'none' }} />
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            style={{
              padding: '9px 12px 9px 32px', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
              background: 'var(--background)', color: 'var(--foreground)', fontSize: '13px',
              fontFamily: 'inherit', outline: 'none', appearance: 'none', cursor: 'pointer',
            }}
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <GraduationCap size={14} color="var(--muted-fg)" />
        <span style={{ fontSize: '13px', color: 'var(--muted-fg)' }}>
          {isLoading ? 'Loading...' : `${filteredStudents.length} student${filteredStudents.length !== 1 ? 's' : ''}`}
          {selectedSubject && ` in ${selectedSubject.name} — Sem ${selectedSubject.semester}`}
        </span>
      </div>

      {/* Student Table */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>
              {['Student', 'Enrollment No.', 'Course', 'Semester', 'Email', 'Status'].map((h) => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} style={{ padding: '12px 16px' }}>
                      <Skeleton style={{ height: 16, width: j === 0 ? 160 : 80 }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--muted-fg)' }}>
                  <Users size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                  <p style={{ fontWeight: 600 }}>No students found</p>
                  <p style={{ fontSize: '12px', marginTop: 4 }}>
                    {selectedSubjectId ? 'No students enrolled in this subject' : 'Select a subject to filter students'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredStudents.map((student, idx) => (
                <tr key={student.id} style={{
                  borderBottom: '1px solid var(--border)',
                  background: idx % 2 === 0 ? 'transparent' : 'var(--muted)',
                  transition: 'background var(--transition)',
                }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: 700, color: '#fff', flexShrink: 0,
                      }}>
                        {getInitials(student.fullName)}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{student.fullName}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--muted-fg)', fontFamily: 'monospace' }}>
                    {student.studentProfile?.enrollmentNumber || '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge variant="secondary">{student.studentProfile?.course?.code || '—'}</Badge>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                    Sem {student.studentProfile?.currentSemester || '—'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--muted-fg)' }}>
                    {student.email}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge variant={student.isActive ? 'success' : 'destructive'}>
                      {student.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PageTransition>
  );
}
