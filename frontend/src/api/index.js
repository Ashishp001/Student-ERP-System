import client from './client';

export const authApi = {
  login: (data) => client.post('/api/v1/auth/login', data).then(r => r.data),
  register: (data) => client.post('/api/v1/auth/register', data).then(r => r.data),
  refresh: (refreshToken) => client.post('/api/v1/auth/refresh', { refresh_token: refreshToken }).then(r => r.data),
  changePassword: (data) => client.post('/api/v1/auth/change-password', data).then(r => r.data),
};

export const usersApi = {
  getMe: () => client.get('/api/v1/users/me').then(r => r.data),
  updateMe: (data) => client.put('/api/v1/users/me', data).then(r => r.data),
  uploadAvatar: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return client.post('/api/v1/users/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
  },
  getAll: () => client.get('/api/v1/users').then(r => r.data),
  deactivate: (id) => client.patch(`/api/v1/users/${id}/deactivate`).then(r => r.data),
};

export const coursesApi = {
  getAll: () => client.get('/api/v1/courses').then(r => r.data),
  getActive: () => client.get('/api/v1/courses/active').then(r => r.data),
  getById: (id) => client.get(`/api/v1/courses/${id}`).then(r => r.data),
  create: (data) => client.post('/api/v1/courses', data).then(r => r.data),
  update: (id, data) => client.put(`/api/v1/courses/${id}`, data).then(r => r.data),
  delete: (id) => client.delete(`/api/v1/courses/${id}`).then(r => r.data),
};

export const subjectsApi = {
  getAll: () => client.get('/api/v1/subjects').then(r => r.data),
  getByCourse: (courseId) => client.get(`/api/v1/subjects/course/${courseId}`).then(r => r.data),
  getMy: () => client.get('/api/v1/subjects/my').then(r => r.data),
  getById: (id) => client.get(`/api/v1/subjects/${id}`).then(r => r.data),
  create: (data) => client.post('/api/v1/subjects', data).then(r => r.data),
  update: (id, data) => client.put(`/api/v1/subjects/${id}`, data).then(r => r.data),
  delete: (id) => client.delete(`/api/v1/subjects/${id}`).then(r => r.data),
};

export const assignmentsApi = {
  getMy: () => client.get('/api/v1/assignments/my').then(r => r.data),
  getForStudent: () => client.get('/api/v1/assignments/student').then(r => r.data),
  getById: (id) => client.get(`/api/v1/assignments/${id}`).then(r => r.data),
  create: (data, file) => {
    const fd = new FormData();
    fd.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (file) fd.append('file', file);
    return client.post('/api/v1/assignments', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
  },
  update: (id, data, file) => {
    const fd = new FormData();
    fd.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (file) fd.append('file', file);
    return client.put(`/api/v1/assignments/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
  },
  publish: (id) => client.post(`/api/v1/assignments/${id}/publish`).then(r => r.data),
  close: (id) => client.post(`/api/v1/assignments/${id}/close`).then(r => r.data),
  delete: (id) => client.delete(`/api/v1/assignments/${id}`).then(r => r.data),
};

export const submissionsApi = {
  submit: (assignmentId, file) => {
    const fd = new FormData();
    fd.append('file', file);
    return client.post(`/api/v1/submissions/assignments/${assignmentId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
  },
  getByAssignment: async (assignmentId) => {
    const REQUEST_TIMEOUT = 30000;
    let lastError;

    // Try both compatible endpoints in sequence; return first successful response.
    const endpoints = [
      `/api/v1/submissions/assignments/${assignmentId}`,
      `/api/v1/assignments/${assignmentId}/submissions`,
    ];

    for (const url of endpoints) {
      try {
        const res = await client.get(url, {
          timeout: REQUEST_TIMEOUT,
          params: { _ts: Date.now() },
        });
        return res.data;
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError;
  },
  getMy: () => client.get('/api/v1/submissions/my').then(r => r.data),
  getMyForAssignment: (assignmentId) => client.get(`/api/v1/submissions/assignments/${assignmentId}/mine`).then(r => r.data),
  grade: (submissionId, data) => client.post(`/api/v1/submissions/${submissionId}/grade`, data).then(r => r.data),
};

export const attendanceApi = {
  mark: (data) => client.post('/api/v1/attendance', data).then(r => r.data),
  update: (id, data) => client.put(`/api/v1/attendance/${id}`, data).then(r => r.data),
  getBySubject: (subjectId) => client.get(`/api/v1/attendance/subject/${subjectId}`).then(r => r.data),
  getMy: () => client.get('/api/v1/attendance/my').then(r => r.data),
  getMyForSubject: (subjectId) => client.get(`/api/v1/attendance/my/${subjectId}`).then(r => r.data),
  getMySessions: async () => {
    let lastError;
    const endpoints = ['/api/v1/attendance/my-sessions', '/api/v1/attendance/my/sessions'];
    for (const url of endpoints) {
      try {
        const res = await client.get(url);
        return res.data;
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError;
  },
};

export const noticesApi = {
  getFeed: (page = 0, size = 20) => client.get('/api/v1/notices', { params: { page, size } }).then(r => r.data),
  getMy: () => client.get('/api/v1/notices/my').then(r => r.data),
  getById: (id) => client.get(`/api/v1/notices/${id}`).then(r => r.data),
  create: (data, file) => {
    const fd = new FormData();
    fd.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (file) fd.append('file', file);
    return client.post('/api/v1/notices', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
  },
  update: (id, data) => client.put(`/api/v1/notices/${id}`, data).then(r => r.data),
  pin: (id) => client.post(`/api/v1/notices/${id}/pin`).then(r => r.data),
  archive: (id) => client.post(`/api/v1/notices/${id}/archive`).then(r => r.data),
  delete: (id) => client.delete(`/api/v1/notices/${id}`).then(r => r.data),
};

// ── Phase 3 APIs ──────────────────────────────────────────────────────────────

export const marksApi = {
  enter: (data) => client.post('/api/v1/marks', data).then(r => r.data),
  enterBulk: (data) => client.post('/api/v1/marks/bulk', data).then(r => r.data),
  lockComponent: (subjectId, component) =>
    client.patch('/api/v1/marks/lock', null, { params: { subjectId, component } }).then(r => r.data),
  getBySubject: (subjectId) => client.get(`/api/v1/marks/subject/${subjectId}`).then(r => r.data),
  getMy: () => client.get('/api/v1/marks/my').then(r => r.data),
};

export const materialsApi = {
  getAll: (subjectId) => client.get('/api/v1/materials', { params: subjectId ? { subjectId } : {} }).then(r => r.data),
  getMy: () => client.get('/api/v1/materials/my').then(r => r.data),
  upload: (data, file) => {
    const fd = new FormData();
    fd.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    fd.append('file', file);
    return client.post('/api/v1/materials', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
  },
  download: (id) => client.post(`/api/v1/materials/${id}/download`).then(r => r.data),
  delete: (id) => client.delete(`/api/v1/materials/${id}`).then(r => r.data),
};

export const resultsApi = {
  enter: (data) => client.post('/api/v1/results', data).then(r => r.data),
  enterBulk: (data) => client.post('/api/v1/results/bulk', data).then(r => r.data),
  publish: (subjectId, examType, academicYear) =>
    client.patch('/api/v1/results/publish', null, { params: { subjectId, examType, academicYear } }).then(r => r.data),
  getMy: () => client.get('/api/v1/results/my').then(r => r.data),
  getGpa: () => client.get('/api/v1/results/my/gpa').then(r => r.data),
  getBySubject: (subjectId) => client.get(`/api/v1/results/subject/${subjectId}`).then(r => r.data),
};

export const analyticsApi = {
  studentDashboard: () => client.get('/api/v1/analytics/student/dashboard').then(r => r.data),
  facultyDashboard: () => client.get('/api/v1/analytics/faculty/dashboard').then(r => r.data),
  adminDashboard: () => client.get('/api/v1/analytics/admin/dashboard').then(r => r.data),
  enrollmentData: () => client.get('/api/v1/analytics/admin/enrollment').then(r => r.data),
};

export const notificationsApi = {
  getAll: (page = 0, size = 20) => client.get('/api/v1/notifications', { params: { page, size } }).then(r => r.data),
  getUnreadCount: () => client.get('/api/v1/notifications/unread-count').then(r => r.data),
  markRead: (id) => client.patch(`/api/v1/notifications/${id}/read`).then(r => r.data),
  markAllRead: () => client.patch('/api/v1/notifications/read-all').then(r => r.data),
};

export const grievancesApi = {
  file: (data) => client.post('/api/v1/grievances', data).then(r => r.data),
  getMy: () => client.get('/api/v1/grievances/my').then(r => r.data),
  getAll: (status, page = 0, size = 20) =>
    client.get('/api/v1/grievances', { params: { status: status || undefined, page, size } }).then(r => r.data),
  getCounts: () => client.get('/api/v1/grievances/counts').then(r => r.data),
  getById: (id) => client.get(`/api/v1/grievances/${id}`).then(r => r.data),
  assign: (id, assigneeId) => client.patch(`/api/v1/grievances/${id}/assign`, { assigneeId }).then(r => r.data),
  resolve: (id, resolutionNote) => client.patch(`/api/v1/grievances/${id}/resolve`, { resolutionNote }).then(r => r.data),
  reject: (id, reason) => client.patch(`/api/v1/grievances/${id}/reject`, { reason }).then(r => r.data),
};

export const hostelApi = {
  // Admin
  getHostels: () => client.get('/api/v1/hostels/admin').then(r => r.data),
  createHostel: (data) => client.post('/api/v1/hostels/admin', data).then(r => r.data),
  updateHostelName: (hostelId, name) => client.patch(`/api/v1/hostels/admin/${hostelId}/name`, { name }).then(r => r.data),
  getRooms: (hostelId) => client.get(`/api/v1/hostels/admin/${hostelId}/rooms`).then(r => r.data),
  addRoom: (hostelId, data) => client.post(`/api/v1/hostels/admin/${hostelId}/rooms`, data).then(r => r.data),
  getApplications: (status) => client.get('/api/v1/hostels/admin/applications', { params: status ? { status } : {} }).then(r => r.data),
  reviewApplication: (id, data) => client.patch(`/api/v1/hostels/admin/applications/${id}`, data).then(r => r.data),
  allocateRoom: (data) => client.post('/api/v1/hostels/admin/allocations', data).then(r => r.data),
  getActiveAllocations: () => client.get('/api/v1/hostels/admin/allocations/active').then(r => r.data),
  checkoutAllocation: (id, endDate) => client.patch(`/api/v1/hostels/admin/allocations/${id}/checkout`, null, { params: endDate ? { endDate } : {} }).then(r => r.data),
  getComplaints: (status) => client.get('/api/v1/hostels/admin/complaints', { params: status ? { status } : {} }).then(r => r.data),
  updateComplaint: (id, data) => client.patch(`/api/v1/hostels/admin/complaints/${id}`, data).then(r => r.data),
  // Student
  apply: (data) => client.post('/api/v1/hostels/student/applications', data).then(r => r.data),
  getMyApplications: () => client.get('/api/v1/hostels/student/applications').then(r => r.data),
  getStudentHostels: () => client.get('/api/v1/hostels/student/hostels').then(r => r.data),
  getMyAllocation: () => client.get('/api/v1/hostels/student/allocation').then(r => r.data),
  fileComplaint: (data) => client.post('/api/v1/hostels/student/complaints', data).then(r => r.data),
  getMyComplaints: () => client.get('/api/v1/hostels/student/complaints').then(r => r.data),
};
