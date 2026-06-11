import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import PageTransition from '../../components/blocks/PageTransition';
import { hostelApi } from '../../api';

const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '13px', outline: 'none' };
const labelStyle = { fontSize: '12px', fontWeight: 500, color: 'var(--muted-fg)', display: 'block', marginBottom: 4 };
const btnPrimary = { padding: '9px 16px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' };

export default function AdminHostel() {
  const qc = useQueryClient();
  const [hostelForm, setHostelForm] = useState({ name: '', type: 'BOYS', address: '', wardenName: '', wardenPhone: '', totalRooms: 0, floors: 1 });
  const [renameForm, setRenameForm] = useState({ hostelId: '', name: '' });
  const [roomForm, setRoomForm] = useState({ hostelId: '', roomNumber: '', floorNo: '', capacity: 2 });
  const [reviewForm, setReviewForm] = useState({});
  const [allocationForm, setAllocationForm] = useState({ studentId: '', roomId: '', startDate: '', academicYear: '', notes: '' });

  const { data: hostelsData } = useQuery({ queryKey: ['hostels-admin'], queryFn: () => hostelApi.getHostels() });
  const { data: applicationsData } = useQuery({ queryKey: ['hostel-applications-admin'], queryFn: () => hostelApi.getApplications() });
  const { data: complaintsData } = useQuery({ queryKey: ['hostel-complaints-admin'], queryFn: () => hostelApi.getComplaints() });
  const { data: allocationsData } = useQuery({ queryKey: ['hostel-allocations-admin'], queryFn: () => hostelApi.getActiveAllocations() });

  const hostels = hostelsData?.data || [];
  const applications = applicationsData?.data || [];
  const approvedApplications = (applicationsData?.data || []).filter((a) => a.status === 'APPROVED');
  const complaints = complaintsData?.data || [];
  const allocations = allocationsData?.data || [];

  const { data: roomsData } = useQuery({
    queryKey: ['hostel-rooms-admin', roomForm.hostelId],
    queryFn: () => hostelApi.getRooms(roomForm.hostelId),
    enabled: !!roomForm.hostelId,
  });
  const allRooms = useMemo(() => (roomsData?.data || []).filter((r) => r.availableCount > 0), [roomsData?.data]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['hostels-admin'] });
    qc.invalidateQueries({ queryKey: ['hostel-applications-admin'] });
    qc.invalidateQueries({ queryKey: ['hostel-complaints-admin'] });
    qc.invalidateQueries({ queryKey: ['hostel-allocations-admin'] });
    qc.invalidateQueries({ queryKey: ['hostel-rooms-admin'] });
  };

  const createHostelMut = useMutation({
    mutationFn: (d) => hostelApi.createHostel({ ...d, totalRooms: Number(d.totalRooms) || 0, floors: Number(d.floors) || 1 }),
    onSuccess: () => { toast.success('Hostel created'); setHostelForm({ name: '', type: 'BOYS', address: '', wardenName: '', wardenPhone: '', totalRooms: 0, floors: 1 }); refresh(); },
    onError: (e) => toast.error(e.response?.data?.detail || 'Failed to create hostel'),
  });
  const addRoomMut = useMutation({
    mutationFn: ({ hostelId, d }) => hostelApi.addRoom(hostelId, { ...d, floorNo: d.floorNo === '' ? null : Number(d.floorNo), capacity: Number(d.capacity) }),
    onSuccess: () => { toast.success('Room added'); setRoomForm({ ...roomForm, roomNumber: '', floorNo: '', capacity: 2 }); refresh(); },
    onError: (e) => toast.error(e.response?.data?.detail || 'Failed to add room'),
  });
  const updateHostelNameMut = useMutation({
    mutationFn: (d) => hostelApi.updateHostelName(d.hostelId, d.name.trim()),
    onSuccess: () => {
      toast.success('Hostel name updated');
      setRenameForm({ hostelId: '', name: '' });
      refresh();
    },
    onError: (e) => {
      const message = e.response?.data?.detail || '';
      if (message.includes('No static resource') || e.response?.status === 404) {
        toast.error('Rename API is not available on running backend. Please restart backend and try again.');
        return;
      }
      toast.error(message || 'Failed to update hostel name');
    },
  });
  const reviewMut = useMutation({
    mutationFn: ({ id, d }) => hostelApi.reviewApplication(id, d),
    onSuccess: () => { toast.success('Application reviewed'); refresh(); },
    onError: (e) => toast.error(e.response?.data?.detail || 'Failed to review application'),
  });
  const allocateMut = useMutation({
    mutationFn: (d) => hostelApi.allocateRoom(d),
    onSuccess: () => { toast.success('Room allocated'); setAllocationForm({ studentId: '', roomId: '', startDate: '', academicYear: '', notes: '' }); refresh(); },
    onError: (e) => toast.error(e.response?.data?.detail || 'Allocation failed'),
  });
  const checkoutMut = useMutation({
    mutationFn: (id) => hostelApi.checkoutAllocation(id),
    onSuccess: () => { toast.success('Checkout done'); refresh(); },
    onError: (e) => toast.error(e.response?.data?.detail || 'Checkout failed'),
  });
  const complaintMut = useMutation({
    mutationFn: ({ id, d }) => hostelApi.updateComplaint(id, d),
    onSuccess: () => { toast.success('Complaint updated'); refresh(); },
    onError: (e) => toast.error(e.response?.data?.detail || 'Failed to update complaint'),
  });

  const handleAllocate = () => {
    if (!allocationForm.studentId || !allocationForm.roomId || !allocationForm.startDate) {
      toast.error('Please select student, room and start date');
      return;
    }
    allocateMut.mutate(allocationForm);
  };

  const handleUpdateHostelName = () => {
    if (!renameForm.hostelId || !renameForm.name.trim()) {
      toast.error('Please select hostel and enter new name');
      return;
    }
    updateHostelNameMut.mutate(renameForm);
  };

  return (
    <PageTransition>
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: 16 }}>Hostel Management</h1>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 16 }}>
        <h3 style={{ marginBottom: 10 }}>Create Hostel</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr 1fr 1fr 1fr', gap: 8, alignItems: 'end' }}>
          <div><label style={labelStyle}>Name</label><input style={inputStyle} value={hostelForm.name} onChange={(e) => setHostelForm({ ...hostelForm, name: e.target.value })} /></div>
          <div><label style={labelStyle}>Type</label><select style={inputStyle} value={hostelForm.type} onChange={(e) => setHostelForm({ ...hostelForm, type: e.target.value })}><option value="BOYS">Boys</option><option value="GIRLS">Girls</option><option value="MIXED">Mixed</option></select></div>
          <div><label style={labelStyle}>Address</label><input style={inputStyle} value={hostelForm.address} onChange={(e) => setHostelForm({ ...hostelForm, address: e.target.value })} /></div>
          <div><label style={labelStyle}>Warden</label><input style={inputStyle} value={hostelForm.wardenName} onChange={(e) => setHostelForm({ ...hostelForm, wardenName: e.target.value })} /></div>
          <div><label style={labelStyle}>Phone</label><input style={inputStyle} value={hostelForm.wardenPhone} onChange={(e) => setHostelForm({ ...hostelForm, wardenPhone: e.target.value })} /></div>
          <div><label style={labelStyle}>Rooms</label><input type="number" style={inputStyle} value={hostelForm.totalRooms} onChange={(e) => setHostelForm({ ...hostelForm, totalRooms: e.target.value })} /></div>
          <div><label style={labelStyle}>Floors</label><input type="number" style={inputStyle} value={hostelForm.floors} onChange={(e) => setHostelForm({ ...hostelForm, floors: e.target.value })} /></div>
        </div>
        <button style={{ ...btnPrimary, marginTop: 10 }} onClick={() => createHostelMut.mutate(hostelForm)}><Plus size={14} style={{ verticalAlign: 'middle' }} /> Create</button>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 16 }}>
        <h3 style={{ marginBottom: 10 }}>Add Room</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'end' }}>
          <div><label style={labelStyle}>Hostel</label><select style={inputStyle} value={roomForm.hostelId} onChange={(e) => setRoomForm({ ...roomForm, hostelId: e.target.value })}><option value="">Select Hostel</option>{hostels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}</select></div>
          <div><label style={labelStyle}>Room No</label><input style={inputStyle} value={roomForm.roomNumber} onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })} /></div>
          <div><label style={labelStyle}>Floor</label><input style={inputStyle} value={roomForm.floorNo} onChange={(e) => setRoomForm({ ...roomForm, floorNo: e.target.value })} /></div>
          <div><label style={labelStyle}>Capacity</label><input type="number" style={inputStyle} value={roomForm.capacity} onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })} /></div>
          <button style={btnPrimary} onClick={() => roomForm.hostelId && addRoomMut.mutate({ hostelId: roomForm.hostelId, d: roomForm })}>Add</button>
        </div>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 16 }}>
        <h3 style={{ marginBottom: 10 }}>Update Hostel Name</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr auto', gap: 8, alignItems: 'end' }}>
          <div>
            <label style={labelStyle}>Hostel</label>
            <select
              style={inputStyle}
              value={renameForm.hostelId}
              onChange={(e) => {
                const hostelId = e.target.value;
                const selected = hostels.find((h) => h.id === hostelId);
                setRenameForm({ hostelId, name: selected?.name || '' });
              }}
            >
              <option value="">Select Hostel</option>
              {hostels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>New Hostel Name</label>
            <input
              style={inputStyle}
              value={renameForm.name}
              onChange={(e) => setRenameForm({ ...renameForm, name: e.target.value })}
              placeholder="Enter updated hostel name"
            />
          </div>
          <button style={btnPrimary} onClick={handleUpdateHostelName}>Update Name</button>
        </div>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 16 }}>
        <h3 style={{ marginBottom: 10 }}>Applications</h3>
        {applications.map((a) => (
          <div key={a.id} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: 10, marginBottom: 8, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, alignItems: 'center' }}>
            <div><strong>{a.studentName}</strong> · {a.reason}</div>
            <div>{a.status}</div>
            <select style={inputStyle} value={reviewForm[a.id]?.status || a.status} onChange={(e) => setReviewForm({ ...reviewForm, [a.id]: { ...reviewForm[a.id], status: e.target.value } })}><option value="PENDING">PENDING</option><option value="APPROVED">APPROVED</option><option value="REJECTED">REJECTED</option></select>
            <button style={btnPrimary} onClick={() => reviewMut.mutate({ id: a.id, d: { status: reviewForm[a.id]?.status || a.status, adminNote: reviewForm[a.id]?.adminNote || '' } })}>Update</button>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 16 }}>
        <h3 style={{ marginBottom: 10 }}>Allocate Room</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'end' }}>
          <div>
            <label style={labelStyle}>Student</label>
            <select style={inputStyle} value={allocationForm.studentId} onChange={(e) => setAllocationForm({ ...allocationForm, studentId: e.target.value })}>
              <option value="">Select Approved Student</option>
              {approvedApplications.map((a) => (
                <option key={a.id} value={a.studentId}>{a.studentName}</option>
              ))}
            </select>
          </div>
          <div><label style={labelStyle}>Hostel</label><select style={inputStyle} value={roomForm.hostelId} onChange={(e) => setRoomForm({ ...roomForm, hostelId: e.target.value })}><option value="">Select Hostel</option>{hostels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}</select></div>
          <div><label style={labelStyle}>Room</label><select style={inputStyle} value={allocationForm.roomId} onChange={(e) => setAllocationForm({ ...allocationForm, roomId: e.target.value })}><option value="">Select Room</option>{allRooms.map((r) => <option key={r.id} value={r.id}>{r.roomNumber} (free {r.availableCount})</option>)}</select></div>
          <div><label style={labelStyle}>Start Date</label><input type="date" style={inputStyle} value={allocationForm.startDate} onChange={(e) => setAllocationForm({ ...allocationForm, startDate: e.target.value })} /></div>
          <div><label style={labelStyle}>Academic Year</label><input style={inputStyle} value={allocationForm.academicYear} onChange={(e) => setAllocationForm({ ...allocationForm, academicYear: e.target.value })} placeholder="2026-27" /></div>
          <button style={btnPrimary} onClick={handleAllocate}>Allocate</button>
        </div>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 16 }}>
        <h3 style={{ marginBottom: 10 }}>Active Allocations</h3>
        {allocations.map((a) => (
          <div key={a.id} style={{ borderBottom: '1px solid var(--border)', padding: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
            <span>{a.studentName} → {a.hostelName} / {a.roomNumber} ({a.status})</span>
            <button style={btnPrimary} onClick={() => checkoutMut.mutate(a.id)}>Checkout</button>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
        <h3 style={{ marginBottom: 10 }}>Complaints</h3>
        {complaints.map((c) => (
          <div key={c.id} style={{ borderBottom: '1px solid var(--border)', padding: '8px 0', display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 8, alignItems: 'center' }}>
            <span><strong>{c.studentName}</strong> · {c.title} · {c.category}</span>
            <select style={inputStyle} value={reviewForm[`c-${c.id}`]?.status || c.status} onChange={(e) => setReviewForm({ ...reviewForm, [`c-${c.id}`]: { ...reviewForm[`c-${c.id}`], status: e.target.value } })}><option value="OPEN">OPEN</option><option value="IN_PROGRESS">IN_PROGRESS</option><option value="RESOLVED">RESOLVED</option><option value="REJECTED">REJECTED</option></select>
            <button style={btnPrimary} onClick={() => complaintMut.mutate({ id: c.id, d: { status: reviewForm[`c-${c.id}`]?.status || c.status, adminNote: reviewForm[`c-${c.id}`]?.adminNote || '' } })}>Update</button>
          </div>
        ))}
      </div>
    </PageTransition>
  );
}
