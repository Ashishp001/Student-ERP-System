export const ROLES = {
  STUDENT: 'STUDENT',
  FACULTY: 'FACULTY',
  ADMIN: 'ADMIN',
};

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  // Student
  STUDENT_DASHBOARD: '/student',
  STUDENT_ASSIGNMENTS: '/student/assignments',
  STUDENT_ATTENDANCE: '/student/attendance',
  STUDENT_MARKS: '/student/marks',
  STUDENT_RESULTS: '/student/results',
  STUDENT_NOTICES: '/student/notices',
  STUDENT_HOSTEL: '/student/hostel',
  STUDENT_MATERIALS: '/student/materials',
  STUDENT_GRIEVANCES: '/student/grievances',
  STUDENT_PROFILE: '/student/profile',
  // Faculty
  FACULTY_DASHBOARD: '/faculty',
  FACULTY_ASSIGNMENTS: '/faculty/assignments',
  FACULTY_ATTENDANCE: '/faculty/attendance',
  FACULTY_MARKS: '/faculty/marks',
  FACULTY_NOTICES: '/faculty/notices',
  FACULTY_MATERIALS: '/faculty/materials',
  FACULTY_STUDENTS: '/faculty/students',
  FACULTY_PROFILE: '/faculty/profile',
  // Admin
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_COURSES: '/admin/courses',
  ADMIN_SUBJECTS: '/admin/subjects',
  ADMIN_RESULTS: '/admin/results',
  ADMIN_GRIEVANCES: '/admin/grievances',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_HOSTEL: '/admin/hostel',
  ADMIN_HOSTEL_DATA: '/admin/hostel-data',
};

export const ASSIGNMENT_STATUS = {
  DRAFT: { label: 'Draft', color: 'gray' },
  PUBLISHED: { label: 'Published', color: 'blue' },
  CLOSED: { label: 'Closed', color: 'red' },
};

export const SUBMISSION_STATUS = {
  SUBMITTED: { label: 'Submitted', color: 'blue' },
  GRADED: { label: 'Graded', color: 'green' },
  RETURNED: { label: 'Returned', color: 'orange' },
};

export const NOTICE_CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'academic', label: 'Academic' },
  { value: 'event', label: 'Event' },
  { value: 'urgent', label: 'Urgent' },
];

export const API_BASE = 'http://localhost:8080';
