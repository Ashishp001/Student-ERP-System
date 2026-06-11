import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CalendarCheck, Check, X } from 'lucide-react';
import PageTransition from '../../components/blocks/PageTransition';
import EmptyState from '../../components/blocks/EmptyState';
import { attendanceApi, subjectsApi, usersApi } from '../../api';

export default function FacultyAttendance() {
  const qc = useQueryClient();
  const { data: subsData } = useQuery({ queryKey: ['my-subjects'], queryFn: () => subjectsApi.getMy() });
  const { data: usersData } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.getAll() });
  const subjects = subsData?.data || [];
  const allStudents = (usersData?.data || []).filter(u => u.role === 'STUDENT');

  const [selectedSubject, setSelectedSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState([]);
  const [tab, setTab] = useState('mark'); // mark | history
  const [historySubject, setHistorySubject] = useState('');

  const { data: historyData } = useQuery({
    queryKey: ['attendance-history', historySubject],
    queryFn: () => attendanceApi.getBySubject(historySubject),
    enabled: !!historySubject,
  });
  const history = historyData?.data || [];

  const markMut = useMutation({
    mutationFn: (data) => attendanceApi.mark(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['attendance-history'] }); toast.success('Attendance saved!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const loadStudents = (subjectId) => {
    setSelectedSubject(subjectId);
    setRecords(allStudents.map(s => ({ studentId: s.id, name: s.fullName, enrollment: s.enrollmentNumber, status: 'ABSENT' })));
  };

  const toggleStatus = (studentId) => {
    setRecords(records.map(r => r.studentId === studentId ? { ...r, status: r.status === 'PRESENT' ? 'ABSENT' : 'PRESENT' } : r));
  };

  const markAll = (status) => setRecords(records.map(r => ({ ...r, status })));

  const handleSubmit = () => {
    if (!selectedSubject || !date || records.length === 0) { toast.error('Select subject and date'); return; }
    markMut.mutate({ subjectId: selectedSubject, date, records: records.map(r => ({ studentId: r.studentId, status: r.status })) });
  };

  const inputStyle = { padding: '9px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '13px', outline: 'none' };
  const tabStyle = (active) => ({ padding: '8px 20px', borderRadius: 'var(--radius)', border: 'none', background: active ? 'var(--primary)' : 'var(--secondary)', color: active ? '#fff' : 'var(--foreground)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' });

  return (
    <PageTransition>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Attendance</h1>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setTab('mark')} style={tabStyle(tab === 'mark')}>Mark</button>
          <button onClick={() => setTab('history')} style={tabStyle(tab === 'history')}>History</button>
        </div>
      </div>

      {tab === 'mark' && (
        <>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--muted-fg)', display: 'block', marginBottom: 4 }}>Subject</label>
              <select value={selectedSubject} onChange={(e) => loadStudents(e.target.value)} style={{ ...inputStyle, minWidth: 200 }}>
                <option value="">Select subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--muted-fg)', display: 'block', marginBottom: 4 }}>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
            </div>
            {records.length > 0 && (
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => markAll('PRESENT')} style={{ ...inputStyle, cursor: 'pointer', background: 'rgba(16,185,129,0.12)', color: 'var(--success)', border: '1px solid var(--success)', fontWeight: 600 }}>All Present</button>
                <button onClick={() => markAll('ABSENT')} style={{ ...inputStyle, cursor: 'pointer', background: 'rgba(239,68,68,0.12)', color: 'var(--destructive)', border: '1px solid var(--destructive)', fontWeight: 600 }}>All Absent</button>
              </div>
            )}
          </div>

          {records.length === 0 ? (
            <EmptyState title="Select a subject" description="Choose a subject to load student list" icon={CalendarCheck} />
          ) : (
            <>
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      {['#', 'Student Name', 'Enrollment', 'Status'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: 'var(--muted-fg)', fontSize: '11px', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r, i) => (
                      <tr key={r.studentId} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 14px' }}>{i + 1}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 500 }}>{r.name}</td>
                        <td style={{ padding: '10px 14px' }}>{r.enrollment || '—'}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <button onClick={() => toggleStatus(r.studentId)} style={{
                            padding: '4px 14px', borderRadius: 9999, border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                            background: r.status === 'PRESENT' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                            color: r.status === 'PRESENT' ? 'var(--success)' : 'var(--destructive)',
                          }}>
                            {r.status === 'PRESENT' ? <><Check size={12} /> Present</> : <><X size={12} /> Absent</>}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={handleSubmit} disabled={markMut.isPending} style={{
                padding: '10px 24px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)',
                color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              }}>{markMut.isPending ? 'Saving...' : 'Save Attendance'}</button>
            </>
          )}
        </>
      )}

      {tab === 'history' && (
        <>
          <div style={{ marginBottom: 16 }}>
            <select value={historySubject} onChange={(e) => setHistorySubject(e.target.value)} style={{ ...inputStyle, minWidth: 250 }}>
              <option value="">Select subject to view history</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
          </div>
          {history.length === 0 ? (
            <EmptyState title="No attendance records" description="Select a subject or mark attendance first" />
          ) : (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    {['Date', 'Present', 'Absent', 'Faculty'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: 'var(--muted-fg)', fontSize: '11px', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 500 }}>{a.date}</td>
                      <td style={{ padding: '10px 14px', color: 'var(--success)' }}>{a.totalPresent}</td>
                      <td style={{ padding: '10px 14px', color: 'var(--destructive)' }}>{a.totalAbsent}</td>
                      <td style={{ padding: '10px 14px', color: 'var(--muted-fg)' }}>{a.facultyName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </PageTransition>
  );
}
