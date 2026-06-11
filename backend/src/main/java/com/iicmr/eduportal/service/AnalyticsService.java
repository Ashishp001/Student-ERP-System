package com.iicmr.eduportal.service;

import com.iicmr.eduportal.entity.User;
import com.iicmr.eduportal.entity.enums.AssignmentStatus;
import com.iicmr.eduportal.entity.enums.UserRole;
import com.iicmr.eduportal.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserRepository          userRepo;
    private final SubjectRepository       subjectRepo;
    private final AssignmentRepository    assignmentRepo;
    private final SubmissionRepository    submissionRepo;
    private final AttendanceRepository    attendanceRepo;
    private final ExamResultRepository    resultRepo;
    private final InternalMarkRepository  markRepo;
    private final StudentProfileRepository studentProfileRepo;
    private final CourseRepository         courseRepo;

    /** Student analytics dashboard */
    public Map<String, Object> getStudentDashboard(User student) {
        // Attendance
        studentProfileRepo.findByUserId(student.getId()).ifPresent(p -> {});
        long totalPending = assignmentRepo.count(); // rough; refined per student profile

        var profile = studentProfileRepo.findByUserId(student.getId()).orElse(null);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("studentId", student.getId());
        result.put("studentName", student.getFullName());

        if (profile != null && profile.getCourse() != null) {
            UUID courseId = profile.getCourse().getId();
            int sem = profile.getCurrentSemester();
            var assignments = assignmentRepo.findPublishedForStudents(courseId, sem, AssignmentStatus.PUBLISHED);
            long pending = assignments.stream()
                    .filter(a -> submissionRepo.findByAssignmentIdAndStudentId(a.getId(), student.getId()).isEmpty())
                    .count();
            result.put("pendingAssignments", pending);
            result.put("totalAssignments", assignments.size());
            result.put("course", profile.getCourse().getName());
            result.put("semester", sem);
        }

        // Attendance avg across subjects
        var publishedResults = resultRepo.findByStudentIdOrderBySemesterAsc(student.getId())
                .stream().filter(r -> r.getIsPublished()).toList();
        double cgpa = 0;
        if (!publishedResults.isEmpty()) {
            double gp = publishedResults.stream()
                    .mapToDouble(r -> r.getGradePoints() != null ? r.getGradePoints() * r.getSubject().getCredits() : 0).sum();
            int cr = publishedResults.stream().mapToInt(r -> r.getSubject().getCredits()).sum();
            cgpa = cr > 0 ? Math.round((gp / cr) * 100.0) / 100.0 : 0;
        }
        result.put("cgpa", cgpa);
        result.put("hasResults", !publishedResults.isEmpty());
        return result;
    }

    /** Faculty analytics dashboard */
    public Map<String, Object> getFacultyDashboard(User faculty) {
        var subjects = subjectRepo.findByFacultyId(faculty.getId());
        var assignments = assignmentRepo.findByFacultyIdOrderByCreatedAtDesc(faculty.getId());

        long totalSubs    = assignments.stream().mapToLong(a -> submissionRepo.countByAssignmentId(a.getId())).sum();
        long pendingSubs  = assignments.stream()
                .mapToLong(a -> submissionRepo.countByAssignmentId(a.getId())
                        - submissionRepo.countByAssignmentIdAndObtainedMarksIsNotNull(a.getId()))
                .sum();

        List<Map<String, Object>> subjectStats = new ArrayList<>();
        for (var s : subjects) {
            long assCount = assignments.stream().filter(a -> a.getSubject().getId().equals(s.getId())).count();
            Map<String, Object> ss = new LinkedHashMap<>();
            ss.put("subjectId", s.getId());
            ss.put("subjectName", s.getName());
            ss.put("subjectCode", s.getCode());
            ss.put("assignmentCount", assCount);
            subjectStats.add(ss);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalSubjects", subjects.size());
        result.put("totalAssignments", assignments.size());
        result.put("totalSubmissions", totalSubs);
        result.put("pendingGrading", pendingSubs);
        result.put("subjects", subjectStats);
        return result;
    }

    /** Admin analytics dashboard */
    public Map<String, Object> getAdminDashboard() {
        long totalStudents = userRepo.countByRole(UserRole.STUDENT);
        long totalFaculty  = userRepo.countByRole(UserRole.FACULTY);
        long activeStudents = userRepo.countByRoleAndIsActive(UserRole.STUDENT, true);
        long totalCourses  = courseRepo.count();
        long totalSubjects = subjectRepo.count();
        long totalAssignments = assignmentRepo.count();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalStudents", totalStudents);
        result.put("totalFaculty", totalFaculty);
        result.put("activeStudents", activeStudents);
        result.put("totalCourses", totalCourses);
        result.put("totalSubjects", totalSubjects);
        result.put("totalAssignments", totalAssignments);
        return result;
    }

    /** Students enrolled per course — for bar chart */
    public List<Map<String, Object>> getEnrollmentData() {
        var courses = courseRepo.findAll();
        List<Map<String, Object>> data = new ArrayList<>();
        for (var course : courses) {
            long count = studentProfileRepo.countByCourseId(course.getId());
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("course", course.getCode());
            entry.put("fullName", course.getName());
            entry.put("students", count);
            data.add(entry);
        }
        return data;
    }
}
