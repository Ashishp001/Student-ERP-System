import { z } from 'zod';

// ── Auth ────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Enter a valid email'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['STUDENT', 'FACULTY'], { required_error: 'Select a role' }),
  // Student-specific
  courseId: z.string().optional(),
  currentSemester: z.coerce.number().min(1).optional(),
  academicYear: z.string().optional(),
  enrollmentNumber: z.string().optional(),
  // Faculty-specific
  department: z.string().optional(),
  designation: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((d) => {
  if (d.role === 'STUDENT') return !!d.courseId && !!d.currentSemester;
  return true;
}, { message: 'Course and semester are required for students', path: ['courseId'] })
  .refine((d) => {
    if (d.role === 'FACULTY') return !!d.department;
    return true;
  }, { message: 'Department is required for faculty', path: ['department'] });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmNew: z.string(),
}).refine((d) => d.newPassword === d.confirmNew, {
  message: 'Passwords do not match',
  path: ['confirmNew'],
});

// ── Profile ─────────────────────────────────────────────────────────────────
export const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  qualification: z.string().optional(),
  joiningDate: z.string().optional(),
});

// ── Assignments ──────────────────────────────────────────────────────────────
export const assignmentSchema = z.object({
  subjectId: z.string().min(1, 'Select a subject'),
  title: z.string().min(3, 'Title is required'),
  instructions: z.string().optional(),
  totalMarks: z.coerce.number().min(1, 'Total marks must be at least 1'),
  deadline: z.string().min(1, 'Deadline is required'),
  allowLate: z.boolean().default(false),
  status: z.enum(['draft', 'published']).default('draft'),
});

// ── Notices ──────────────────────────────────────────────────────────────────
export const noticeSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  content: z.string().min(10, 'Content is required'),
  category: z.enum(['general', 'academic', 'event', 'urgent']).default('general'),
  targetAudience: z.enum(['all', 'students', 'faculty']).default('all'),
  isPinned: z.boolean().default(false),
});

// ── Grievances ───────────────────────────────────────────────────────────────
export const grievanceSchema = z.object({
  category: z.enum(['academic', 'facility', 'faculty', 'administrative', 'other']),
  subject: z.string().min(5, 'Subject is required'),
  description: z.string().min(20, 'Please provide a detailed description'),
  isAnonymous: z.boolean().default(false),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

// ── Courses & Subjects ────────────────────────────────────────────────────────
export const courseSchema = z.object({
  name: z.string().min(3, 'Course name is required'),
  code: z.string().min(2, 'Course code is required'),
  totalSemesters: z.coerce.number().min(1),
  totalCredits: z.coerce.number().optional(),
});

export const subjectSchema = z.object({
  courseId: z.string().min(1, 'Select a course'),
  facultyId: z.string().optional(),
  name: z.string().min(3, 'Subject name is required'),
  code: z.string().min(2, 'Subject code is required'),
  semester: z.coerce.number().min(1),
  credits: z.coerce.number().min(1),
  type: z.enum(['core', 'elective', 'lab', 'project']).default('core'),
  maxInternalMarks: z.coerce.number().default(40),
  maxExternalMarks: z.coerce.number().default(60),
});
