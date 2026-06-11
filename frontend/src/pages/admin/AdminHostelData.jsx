import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageTransition from '../../components/blocks/PageTransition';
import { hostelApi, usersApi } from '../../api';

const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '13px', outline: 'none' };
const labelStyle = { fontSize: '12px', fontWeight: 500, color: 'var(--muted-fg)', display: 'block', marginBottom: 4 };
const EMPTY_LIST = [];

export default function AdminHostelData() {
  const [selectedHostelId, setSelectedHostelId] = useState('');

  const { data: hostelsData } = useQuery({ queryKey: ['hostels-admin'], queryFn: () => hostelApi.getHostels() });
  const { data: allocationsData } = useQuery({ queryKey: ['hostel-allocations-admin'], queryFn: () => hostelApi.getActiveAllocations() });
  const { data: usersData } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.getAll() });

  const hostels = hostelsData?.data ?? EMPTY_LIST;
  const allocations = allocationsData?.data ?? EMPTY_LIST;
  const users = usersData?.data ?? EMPTY_LIST;

  const enrollmentByStudentId = useMemo(
    () => new Map(
      users
        .filter((u) => u.role === 'STUDENT')
        .map((u) => [u.id, u.studentProfile?.enrollmentNumber || '-']),
    ),
    [users],
  );

  const filteredAllocations = useMemo(
    () => (selectedHostelId ? allocations.filter((a) => a.hostelId === selectedHostelId) : allocations),
    [allocations, selectedHostelId],
  );

  return (
    <PageTransition>
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: 16 }}>Hostel Data</h1>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 16 }}>
        <div style={{ maxWidth: 360 }}>
          <label style={labelStyle}>Filter by Hostel Name</label>
          <select
            style={inputStyle}
            value={selectedHostelId}
            onChange={(e) => setSelectedHostelId(e.target.value)}
          >
            <option value="">All Hostels</option>
            {hostels.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
        <h3 style={{ marginBottom: 12 }}>Hostel-wise Student Allocation Data</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 900 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Sr.No', 'Student Name', 'Enrollment No', 'Room No', 'Status', 'Start Date', 'Academic Year'].map((head) => (
                  <th key={head} style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: 'var(--muted-fg)', fontSize: '12px', textTransform: 'uppercase' }}>
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAllocations.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '16px 12px', color: 'var(--muted-fg)' }}>
                    No hostel allocation data found for selected hostel.
                  </td>
                </tr>
              ) : filteredAllocations.map((a, index) => (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px' }}>{index + 1}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 500 }}>{a.studentName || '-'}</td>
                  <td style={{ padding: '10px 12px' }}>{enrollmentByStudentId.get(a.studentId) || '-'}</td>
                  <td style={{ padding: '10px 12px' }}>{a.roomNumber || '-'}</td>
                  <td style={{ padding: '10px 12px' }}>{a.status || '-'}</td>
                  <td style={{ padding: '10px 12px' }}>{a.startDate || '-'}</td>
                  <td style={{ padding: '10px 12px' }}>{a.academicYear || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageTransition>
  );
}
