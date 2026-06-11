import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Download, Check, ArrowLeft, FileText, RefreshCw, AlertCircle } from 'lucide-react';
import PageTransition from '../../components/blocks/PageTransition';
import { assignmentsApi, submissionsApi } from '../../api';
import { formatDateTime } from '../../lib/utils';
import { API_BASE } from '../../lib/constants';

export default function EvaluateSubmissions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  
  const { data: aData, isLoading: aLoading, isError: aIsError } = useQuery({ 
    queryKey: ['assignment', id], 
    queryFn: () => assignmentsApi.getById(id) 
  });
  
  const { data: sData, dataUpdatedAt, isFetching, isError: sIsError, isPending: sPending, error: sError } = useQuery({ 
    queryKey: ['submissions', id], 
    queryFn: () => submissionsApi.getByAssignment(id),
    staleTime: 5000,
    refetchInterval: 7000,
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    enabled: !!id
  });

  const assignment = aData?.data;
  
  // Robustly extract submissions array
  const submissions = (() => {
    let result = [];
    // 1. Check sData from submissions query
    if (sData) {
      if (Array.isArray(sData)) result = sData;
      else if (sData.data && Array.isArray(sData.data)) result = sData.data;
      else if (sData.data?.content && Array.isArray(sData.data.content)) result = sData.data.content;
      else if (sData.data?.submissions && Array.isArray(sData.data.submissions)) result = sData.data.submissions;
      else if (sData.submissions && Array.isArray(sData.submissions)) result = sData.submissions;
      else if (sData.content && Array.isArray(sData.content)) result = sData.content;
      else {
        const firstArray = Object.values(sData).find(val => Array.isArray(val));
        if (firstArray) result = firstArray;
      }
    }

    // 2. Fallback to assignment object if it contains submissions
    if (result.length === 0) {
      if (assignment?.submissions && Array.isArray(assignment.submissions)) {
        result = assignment.submissions;
      } else if (assignment?.data?.submissions && Array.isArray(assignment.data.submissions)) {
        result = assignment.data.submissions;
      }
    }

    return result;
  })();

  const [gradeForm, setGradeForm] = useState({});
  const lastSync = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : 'Not synced yet';

  const gradeMut = useMutation({
    mutationFn: ({ subId, data }) => submissionsApi.grade(subId, data),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['submissions', id] }); 
      qc.invalidateQueries({ queryKey: ['assignment', id] });
      qc.invalidateQueries({ queryKey: ['my-assignments'] });
      toast.success('Marks saved successfully!'); 
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Grading failed'),
  });

  const handleGrade = (subId) => {
    if (!assignment) return;
    
    const s = submissions.find(sub => sub.id === subId);
    const marks = gradeForm[subId]?.marks ?? (s?.status === 'graded' ? s.obtainedMarks : undefined);
    
    if (marks === undefined || marks === '') { 
      toast.error('Please enter marks'); 
      return; 
    }
    const marksNum = parseFloat(marks);
    if (isNaN(marksNum) || marksNum < 0 || marksNum > assignment.totalMarks) {
      toast.error(`Marks must be between 0 and ${assignment.totalMarks}`);
      return;
    }
    gradeMut.mutate({ subId, data: { obtainedMarks: marksNum } });
  };

  if (aLoading) {
    return (
      <PageTransition>
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted-fg)' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px' }} />
          <div>Loading assignment details...</div>
        </div>
      </PageTransition>
    );
  }

  if (aIsError || !assignment) {
    return (
      <PageTransition>
        <div style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>
          <h3>Error loading assignment</h3>
          <p>The assignment might have been deleted or you don't have permission to view it.</p>
          <button onClick={() => navigate('/faculty/assignments')} style={{ marginTop: '20px', padding: '8px 16px', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Back to Assignments
          </button>
        </div>
      </PageTransition>
    );
  }

  /* ─── Styles ─── */
  const cardStyle = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  };

  const infoItemStyle = {
    marginBottom: '8px',
    fontSize: '14px',
    display: 'flex',
    gap: '8px'
  };

  const labelStyle = {
    fontWeight: 700,
    minWidth: '120px'
  };

  const thStyle = {
    padding: '12px',
    fontWeight: 600,
    fontSize: '13px',
    textAlign: 'left',
    color: '#1e293b',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    borderRight: '1px solid #e2e8f0',
  };

  const tdStyle = {
    padding: '12px',
    fontSize: '13px',
    borderBottom: '1px solid #e2e8f0',
    borderRight: '1px solid #e2e8f0',
    verticalAlign: 'middle',
  };

  return (
    <PageTransition>
      <div style={{ padding: '20px' }}>
        {/* Pulse Animation Style */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(3, 105, 161, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(3, 105, 161, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(3, 105, 161, 0); }
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#334155', margin: 0 }}>
            Evaluate Submissions
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              background: '#e0f2fe', 
              color: '#0369a1', 
              padding: '6px 12px', 
              borderRadius: '9999px', 
              fontSize: '13px', 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                background: '#0369a1', 
                borderRadius: '50%',
                animation: isFetching ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
              }} />
              {sPending ? 'Loading...' : `${submissions.length} ${submissions.length === 1 ? 'Submission' : 'Submissions'}`}
              {isFetching && !sPending && <span style={{ fontSize: '10px', opacity: 0.7 }}> (Syncing...)</span>}
            </div>
          </div>
        </div>

        {/* Debug info - helpful for verifying IDs */}
        <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <span>Assignment ID: <strong>{id}</strong></span>
            <span>Last Sync: <strong>{lastSync}</strong></span>
            {isFetching && <span style={{ color: '#3b82f6' }}>• Updating data...</span>}
          </div>
          {submissions.length === 0 && !sPending && !sIsError && (
            <span style={{ color: '#f59e0b', fontWeight: 500 }}>
              ⚠ No submissions found yet for this assignment.
            </span>
          )}
        </div>

        {/* Assignment Info Section */}
        <div style={{ ...cardStyle, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <div style={infoItemStyle}>
            <span style={labelStyle}>Assignment Title:</span>
            <span style={{ color: '#64748b' }}>{assignment.title}</span>
          </div>
          <div style={infoItemStyle}>
            <span style={labelStyle}>Subject:</span>
            <span style={{ color: '#64748b' }}>{assignment.subjectName}</span>
          </div>
          <div style={infoItemStyle}>
            <span style={labelStyle}>Semester:</span>
            <span style={{ color: '#64748b' }}>{assignment.semester || assignment.subjectSemester || 'N/A'}</span>
          </div>
          <div style={infoItemStyle}>
            <span style={labelStyle}>Total Marks:</span>
            <span style={{ color: '#64748b' }}>{assignment.totalMarks?.toFixed(2)}</span>
          </div>
        </div>

        {/* Submissions Table */}
        <div style={{ 
          background: '#fff', 
          border: '1px solid #e2e8f0', 
          borderRadius: '8px', 
          overflow: 'hidden',
          marginBottom: '30px'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: '60px', textAlign: 'center' }}>Sr.No.</th>
                <th style={thStyle}>Student Name</th>
                <th style={thStyle}>Course/Class</th>
                <th style={thStyle}>Submission Date</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Submitted PDF</th>
                <th style={{ ...thStyle, borderRight: 'none' }}>Evaluate</th>
              </tr>
            </thead>
            <tbody>
              {sPending ? (
                <tr>
                  <td colSpan="7" style={{ ...tdStyle, textAlign: 'center', padding: '60px' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px', color: '#3b82f6' }} />
                    <div style={{ color: '#64748b', fontSize: '14px' }}>Fetching student submissions...</div>
                  </td>
                </tr>
              ) : sIsError ? (
                <tr>
                  <td colSpan="7" style={{ ...tdStyle, textAlign: 'center', padding: '40px', color: '#ef4444' }}>
                    Error loading submissions: {sError?.response?.data?.message || sError?.message || 'Please try again later.'}
                  </td>
                </tr>
              ) : (submissions.length === 0 && !sPending) ? (
                <tr>
                  <td colSpan="7" style={{ ...tdStyle, textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    <div style={{ marginBottom: '10px' }}>No submissions found for this assignment.</div>
                    <div style={{ fontSize: '11px', opacity: 0.6 }}>
                      Assignment ID: {id}<br/>
                      Total Submissions Expected: {assignment?.totalSubmissions || 0}
                    </div>
                  </td>
                </tr>
              ) : (
                submissions.map((s, idx) => {
                  const isLate = s.isLate ?? (s.submittedAt && assignment.deadline && new Date(s.submittedAt) > new Date(assignment.deadline));
                  
                  return (
                    <tr key={s.id}>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>{idx + 1}</td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600 }}>{s.studentName || s.fullName || s.studentFullName || 'Student'}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Roll No: {s.enrollmentNumber || s.rollNumber || s.studentRollNo || s.studentUsername || '-'}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div>{s.studentClass || s.className || s.courseName || assignment?.subjectName || 'N/A'}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Semester: {assignment?.semester || assignment?.subjectSemester || '-'}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 500 }}>{s.submittedAt ? formatDateTime(s.submittedAt) : 'N/A'}</div>
                        {isLate && (
                          <div style={{ color: '#ef4444', fontSize: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px', marginTop: '4px' }}>
                            <AlertCircle size={10} /> Late Submission
                          </div>
                        )}
                      </td>
                    <td style={tdStyle}>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '9999px', 
                        fontSize: '11px', 
                        fontWeight: 600,
                        background: s.status === 'graded' ? '#dcfce7' : '#fef9c3',
                        color: s.status === 'graded' ? '#166534' : '#854d0e'
                      }}>
                        {s.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {s.fileUrl ? (
                        <a 
                          href={`${API_BASE}${s.fileUrl}`} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ 
                            color: '#2563eb', 
                            textDecoration: 'none', 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '6px',
                            fontSize: '13px',
                            fontWeight: 500,
                            background: '#eff6ff',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            border: '1px solid #bfdbfe'
                          }}
                        >
                          <FileText size={16} /> View PDF
                        </a>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>No file uploaded</span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, borderRight: 'none' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input 
                            type="number" 
                            min={0} 
                            max={assignment.totalMarks}
                            placeholder="Marks"
                            value={gradeForm[s.id]?.marks ?? (s.status === 'graded' ? s.obtainedMarks : '')}
                            onChange={(e) => setGradeForm({ 
                              ...gradeForm, 
                              [s.id]: { ...gradeForm[s.id], marks: e.target.value } 
                            })}
                            style={{ 
                              width: '70px', 
                              padding: '6px 10px', 
                              border: '1px solid #cbd5e1', 
                              borderRadius: '4px',
                              fontSize: '13px'
                            }}
                          />
                          <span style={{ fontSize: '12px', color: '#64748b' }}>/ {assignment.totalMarks}</span>
                        </div>
                        <button 
                          onClick={() => handleGrade(s.id)}
                          disabled={gradeMut.isPending}
                          style={{ 
                            background: '#10b981', 
                            color: '#fff', 
                            border: 'none', 
                            padding: '6px 16px', 
                            borderRadius: '4px', 
                            fontSize: '13px', 
                            fontWeight: 600, 
                            cursor: 'pointer',
                            alignSelf: 'flex-start'
                          }}
                        >
                          {gradeMut.isPending ? 'Saving...' : 'Save Grade'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <button
          onClick={() => navigate('/faculty/assignments')}
          style={{ 
            background: '#e2e8f0', 
            color: '#475569', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '6px', 
            fontSize: '14px', 
            fontWeight: 600, 
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ArrowLeft size={16} /> Back to Assignments
        </button>
      </div>
    </PageTransition>
  );
}
