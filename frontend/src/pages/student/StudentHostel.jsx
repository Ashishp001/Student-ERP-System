import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import PageTransition from '../../components/blocks/PageTransition';
import { hostelApi, usersApi } from '../../api';

const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '13px', outline: 'none' };
const labelStyle = { fontSize: '12px', fontWeight: 500, color: 'var(--muted-fg)', display: 'block', marginBottom: 4 };
const btnPrimary = { padding: '9px 16px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' };

const readCachedAllocation = (key) => {
  if (!key || typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

const writeCachedAllocation = (key, value) => {
  if (!key || !value || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage write errors (private mode/quota/browser policies)
  }
};

export default function StudentHostel() {
  const qc = useQueryClient();
  const [appForm, setAppForm] = useState({ preferredHostelId: '', studentName: '', enrollmentNo: '' });
  const [complaintForm, setComplaintForm] = useState({ category: '', title: '', description: '' });

  const {
    data: allocationData,
    isLoading: allocationLoading,
    isError: allocationError,
  } = useQuery({
    queryKey: ['hostel-my-allocation'],
    queryFn: () => hostelApi.getMyAllocation(),
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
  const { data: applicationsData } = useQuery({ queryKey: ['hostel-my-applications'], queryFn: () => hostelApi.getMyApplications() });
  const { data: complaintsData } = useQuery({ queryKey: ['hostel-my-complaints'], queryFn: () => hostelApi.getMyComplaints() });
  const { data: hostelsData } = useQuery({ queryKey: ['hostels-student-view'], queryFn: () => hostelApi.getStudentHostels() });
  const { data: profileData } = useQuery({ queryKey: ['profile'], queryFn: () => usersApi.getMe() });

  const allocation = allocationData?.data;
  const applications = applicationsData?.data || [];
  const complaints = complaintsData?.data || [];
  const hostels = hostelsData?.data || [];
  const allocatedHostel = allocation?.hostelId ? hostels.find((h) => h.id === allocation.hostelId) : null;
  const profile = profileData?.data;
  const latestApprovedApplication = applications.find((a) => a.status === 'APPROVED');
  const storageKey = profile?.id ? `hostel-last-allocation-${profile.id}` : null;
  const cachedAllocation = readCachedAllocation(storageKey);
  const studentNameValue = appForm.studentName || profile?.fullName || '';
  const enrollmentNoValue = appForm.enrollmentNo || profile?.studentProfile?.enrollmentNumber || '';

  useEffect(() => {
    if (!storageKey || !allocation) return;
    writeCachedAllocation(storageKey, allocation);
  }, [storageKey, allocation]);

  const displayAllocation = allocation || cachedAllocation;
  const isCachedAllocation = !allocation && !!cachedAllocation;
  const displayAllocatedHostel = displayAllocation?.hostelId ? hostels.find((h) => h.id === displayAllocation.hostelId) : null;
  const allocationAddress = displayAllocation?.hostelAddress || displayAllocatedHostel?.address || allocatedHostel?.address || '-';

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['hostel-my-allocation'] });
    qc.invalidateQueries({ queryKey: ['hostel-my-applications'] });
    qc.invalidateQueries({ queryKey: ['hostel-my-complaints'] });
  };

  const applyMut = useMutation({
    mutationFn: (d) => hostelApi.apply({
      preferredHostelId: d.preferredHostelId || null,
      preferredRoomType: d.studentName || profile?.fullName || '',
      reason: d.enrollmentNo || profile?.studentProfile?.enrollmentNumber || '',
    }),
    onSuccess: () => {
      toast.success('Application submitted');
      setAppForm((prev) => ({ ...prev, preferredHostelId: '' }));
      refresh();
    },
    onError: (e) => toast.error(e.response?.data?.detail || 'Application failed'),
  });
  const complaintMut = useMutation({
    mutationFn: (d) => hostelApi.fileComplaint(d),
    onSuccess: () => { toast.success('Complaint submitted'); setComplaintForm({ category: '', title: '', description: '' }); refresh(); },
    onError: (e) => toast.error(e.response?.data?.detail || 'Complaint failed'),
  });

  const handleApply = () => {
    if (!studentNameValue.trim() || !enrollmentNoValue.trim()) {
      toast.error('Student Name and Enrollment No are required');
      return;
    }
    applyMut.mutate({
      ...appForm,
      studentName: studentNameValue,
      enrollmentNo: enrollmentNoValue,
    });
  };

  return (
    <PageTransition>
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: 16 }}>Hostel</h1>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 16 }}>
        <h3 style={{ marginBottom: 10 }}>My Allocation</h3>
        {allocationLoading ? (
          <div style={{ color: 'var(--muted-fg)' }}>Loading allocation details...</div>
        ) : allocationError ? (
          <div style={{ color: 'var(--muted-fg)' }}>Unable to load allocation right now.</div>
        ) : displayAllocation ? (
          <div style={{ lineHeight: 1.8 }}>
            <div><strong>Hostel:</strong> {displayAllocation.hostelName}</div>
            <div><strong>Address:</strong> {allocationAddress}</div>
            <div><strong>Room:</strong> {displayAllocation.roomNumber}</div>
            <div><strong>Start:</strong> {displayAllocation.startDate}</div>
            <div><strong>Status:</strong> {displayAllocation.status}</div>
            <div><strong>Warden:</strong> {displayAllocation.wardenName || '-'} ({displayAllocation.wardenPhone || '-'})</div>
            <div><strong>Academic Year:</strong> {displayAllocation.academicYear || '-'}</div>
            {isCachedAllocation ? (
              <div style={{ color: 'var(--muted-fg)', fontSize: 12 }}>Showing last known allocation details.</div>
            ) : null}
          </div>
        ) : latestApprovedApplication ? (
          <div style={{ color: 'var(--muted-fg)' }}>
            Your application is approved. Room allocation details will appear once admin assigns a room.
          </div>
        ) : <div style={{ color: 'var(--muted-fg)' }}>No active hostel allocation yet.</div>}
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 16 }}>
        <h3 style={{ marginBottom: 10 }}>Apply For Hostel</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: 8, alignItems: 'end' }}>
          <div><label style={labelStyle}>Preferred Hostel</label><select style={inputStyle} value={appForm.preferredHostelId} onChange={(e) => setAppForm({ ...appForm, preferredHostelId: e.target.value })}><option value="">No preference</option>{hostels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}</select></div>
          <div><label style={labelStyle}>Student Name</label><input style={inputStyle} value={studentNameValue} onChange={(e) => setAppForm({ ...appForm, studentName: e.target.value })} /></div>
          <div><label style={labelStyle}>Enrollment No</label><input style={inputStyle} value={enrollmentNoValue} onChange={(e) => setAppForm({ ...appForm, enrollmentNo: e.target.value })} /></div>
          <button style={btnPrimary} onClick={handleApply}>Apply</button>
        </div>
        <div style={{ marginTop: 12 }}>
          <strong style={{ fontSize: 13 }}>My Applications</strong>
          {applications.map((a) => (
            <div key={a.id} style={{ borderBottom: '1px solid var(--border)', padding: '6px 0' }}>
              {a.createdAt?.slice(0, 10)} · <strong>{a.status}</strong> · {a.reason}
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
        <h3 style={{ marginBottom: 10 }}>Hostel Complaints</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: 8, alignItems: 'end' }}>
          <div><label style={labelStyle}>Category</label><input style={inputStyle} value={complaintForm.category} onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })} placeholder="Water/Electricity..." /></div>
          <div><label style={labelStyle}>Title</label><input style={inputStyle} value={complaintForm.title} onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })} /></div>
          <div><label style={labelStyle}>Description</label><input style={inputStyle} value={complaintForm.description} onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })} /></div>
          <button style={btnPrimary} onClick={() => complaintMut.mutate(complaintForm)}>Submit</button>
        </div>
        <div style={{ marginTop: 12 }}>
          {complaints.map((c) => (
            <div key={c.id} style={{ borderBottom: '1px solid var(--border)', padding: '6px 0' }}>
              <strong>{c.status}</strong> · {c.title} · {c.category}
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
