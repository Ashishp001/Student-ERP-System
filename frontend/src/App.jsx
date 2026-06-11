import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';
import useThemeStore from './store/themeStore';
import useAuthStore from './store/authStore';

// Layout
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import CommandPalette from './components/blocks/CommandPalette';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminCourses from './pages/admin/AdminCourses';
import AdminSubjects from './pages/admin/AdminSubjects';
import AdminExamResults from './pages/admin/AdminExamResults';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminHostel from './pages/admin/AdminHostel';
import AdminHostelData from './pages/admin/AdminHostelData';

// Faculty
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyAssignments from './pages/faculty/FacultyAssignments';
import EvaluateSubmissions from './pages/faculty/EvaluateSubmissions';
import FacultyAssignmentDetail from './pages/faculty/FacultyAssignmentDetail';
import FacultyAttendance from './pages/faculty/FacultyAttendance';
import FacultyNotices from './pages/faculty/FacultyNotices';

import FacultyMaterials from './pages/faculty/FacultyMaterials';
import FacultyProfile from './pages/faculty/FacultyProfile';
import FacultyStudentList from './pages/faculty/FacultyStudentList';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAssignments from './pages/student/StudentAssignments';
import StudentAssignmentDetail from './pages/student/StudentAssignmentDetail';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentNotices from './pages/student/StudentNotices';

import StudentMaterials from './pages/student/StudentMaterials';
import StudentExamResults from './pages/student/StudentExamResults';

import StudentProfile from './pages/student/StudentProfile';
import StudentHostel from './pages/student/StudentHostel';

// Shared
import ProfilePage from './pages/shared/ProfilePage';
import NotFoundPage from './pages/shared/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function RoleRedirect() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  const role = user.role;
  if (role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (role === 'FACULTY') return <Navigate to="/faculty" replace />;
  return <Navigate to="/student" replace />;
}

function App() {
  const initTheme = useThemeStore((s) => s.initTheme);
  const user = useAuthStore((s) => s.user);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  // Global Ctrl+K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (user) setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [user]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" richColors closeButton />
        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected — all under AppLayout */}
          <Route element={<AppLayout />}>
            {/* ── Admin routes (ADMIN only) ── */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/users/:id" element={<AdminUserDetail />} />
              <Route path="/admin/courses" element={<AdminCourses />} />
              <Route path="/admin/subjects" element={<AdminSubjects />} />
              <Route path="/admin/results" element={<AdminExamResults />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/hostel" element={<AdminHostel />} />
              <Route path="/admin/hostel-data" element={<AdminHostelData />} />
            </Route>

            {/* ── Faculty routes (FACULTY only) ── */}
            <Route element={<ProtectedRoute allowedRoles={['FACULTY']} />}>
              <Route path="/faculty" element={<FacultyDashboard />} />
              <Route path="/faculty/assignments" element={<FacultyAssignments />} />
              <Route path="/faculty/assignments/:id" element={<EvaluateSubmissions />} />
              <Route path="/faculty/assignments/detail/:id" element={<FacultyAssignmentDetail />} />
              <Route path="/faculty/attendance" element={<FacultyAttendance />} />
              <Route path="/faculty/notices" element={<FacultyNotices />} />

              <Route path="/faculty/materials" element={<FacultyMaterials />} />
              <Route path="/faculty/students" element={<FacultyStudentList />} />
              <Route path="/faculty/profile" element={<FacultyProfile />} />
            </Route>

            {/* ── Student routes (STUDENT only) ── */}
            <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/assignments" element={<StudentAssignments />} />
              <Route path="/student/assignments/:id" element={<StudentAssignmentDetail />} />
              <Route path="/student/attendance" element={<StudentAttendance />} />
              <Route path="/student/notices" element={<StudentNotices />} />
              <Route path="/student/hostel" element={<StudentHostel />} />

              <Route path="/student/materials" element={<StudentMaterials />} />
              <Route path="/student/results" element={<StudentExamResults />} />

              <Route path="/student/profile" element={<StudentProfile />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="/" element={<RoleRedirect />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
