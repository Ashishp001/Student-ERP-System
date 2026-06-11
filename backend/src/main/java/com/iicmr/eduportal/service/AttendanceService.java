package com.iicmr.eduportal.service;

import com.iicmr.eduportal.dto.request.AttendanceRequest;
import com.iicmr.eduportal.dto.response.AttendanceResponse;
import com.iicmr.eduportal.entity.Attendance;
import com.iicmr.eduportal.entity.Subject;
import com.iicmr.eduportal.entity.User;
import com.iicmr.eduportal.exception.BadRequestException;
import com.iicmr.eduportal.exception.ForbiddenException;
import com.iicmr.eduportal.exception.ResourceNotFoundException;
import com.iicmr.eduportal.repository.AttendanceRepository;
import com.iicmr.eduportal.repository.StudentProfileRepository;
import com.iicmr.eduportal.repository.SubjectRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final SubjectRepository subjectRepository;
    private final StudentProfileRepository studentProfileRepository;

    /** Mark or update attendance for a session (POST — upsert by date+subject) */
    @Transactional
    public AttendanceResponse markAttendance(User faculty, AttendanceRequest request) {
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

        // Allow update if already marked
        Attendance attendance = attendanceRepository
                .findBySubjectIdAndDate(request.getSubjectId(), request.getDate())
                .orElse(Attendance.builder()
                        .subject(subject)
                        .faculty(faculty)
                        .date(request.getDate())
                        .build());

        applyRecords(attendance, request);
        return toResponse(attendanceRepository.save(attendance));
    }

    /**
     * Edit an existing attendance session by its ID.
     * Only the faculty who originally marked it may edit, and only within 3 days.
     */
    @Transactional
    public AttendanceResponse editAttendance(UUID id, User faculty, AttendanceRequest request) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found: " + id));

        // Only the original faculty can edit
        if (!attendance.getFaculty().getId().equals(faculty.getId())) {
            throw new ForbiddenException("You are not allowed to edit this attendance record");
        }

        // 3-day edit window guard
        LocalDate cutoff = attendance.getDate().plusDays(3);
        if (LocalDate.now().isAfter(cutoff)) {
            throw new BadRequestException(
                    "Attendance can only be edited within 3 days of the class date (" + attendance.getDate() + ")");
        }

        applyRecords(attendance, request);
        return toResponse(attendanceRepository.save(attendance));
    }

    /** Faculty: get attendance history for a subject */
    @Transactional
    public List<AttendanceResponse> getBySubject(UUID subjectId) {
        return attendanceRepository.findBySubjectIdOrderByDateDesc(subjectId).stream()
                .map(this::toResponse)
                .toList();
    }

    /** Student: get attendance percentage per subject (all subjects in current semester) */
    @Transactional
    public Map<String, Object> getStudentAttendanceSummary(User student) {
        UUID studentId = student.getId();
        Integer semester = studentProfileRepository.findByUserId(studentId)
                .map(p -> p.getCurrentSemester())
                .orElse(null);

        List<Map<String, Object>> subjectAttendance = new ArrayList<>();

        // Preferred path: use student's mapped course + semester subjects
        Optional<UUID> courseIdOpt = studentProfileRepository.findByUserId(studentId)
                .filter(p -> p.getCourse() != null)
                .map(p -> p.getCourse().getId());
        if (courseIdOpt.isPresent() && semester != null) {
            List<Subject> subjects = subjectRepository.findByCourseIdAndSemesterAndIsActiveTrueOrderByNameAsc(courseIdOpt.get(), semester);
            for (Subject subject : subjects) {
                subjectAttendance.add(buildSubjectSummary(studentId, subject));
            }
        }

        // Fallback path: derive from attendance records where this student is present/absent
        if (subjectAttendance.isEmpty()) {
            Map<UUID, List<Attendance>> bySubject = new LinkedHashMap<>();
            for (Attendance session : attendanceRepository.findAll()) {
                boolean hasStudentRecord = session.getRecords().stream()
                        .anyMatch(r -> studentId.toString().equals(r.get("studentId")));
                if (hasStudentRecord) {
                    bySubject.computeIfAbsent(session.getSubject().getId(), k -> new ArrayList<>()).add(session);
                }
            }

            for (List<Attendance> sessions : bySubject.values()) {
                Subject subject = sessions.get(0).getSubject();
                subjectAttendance.add(buildSubjectSummary(studentId, subject));
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("semester", semester);
        result.put("subjects", subjectAttendance);
        return result;
    }

    /** Student: get attendance for a single subject with session history */
    @Transactional
    public Map<String, Object> getStudentAttendanceForSubject(User student, UUID subjectId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

        List<Attendance> sessions = attendanceRepository.findBySubjectIdOrderByDateDesc(subjectId);

        List<Map<String, Object>> sessionHistory = new ArrayList<>();
        long presentCount = 0;

        for (Attendance a : sessions) {
            String status = "ABSENT";
            for (Map<String, String> r : a.getRecords()) {
                if (student.getId().toString().equals(r.get("studentId"))) {
                    status = r.getOrDefault("status", "ABSENT");
                    break;
                }
            }
            if ("PRESENT".equalsIgnoreCase(status)) presentCount++;

            Map<String, Object> session = new LinkedHashMap<>();
            session.put("date", a.getDate());
            session.put("status", status);
            session.put("totalPresent", a.getTotalPresent());
            session.put("totalAbsent", a.getTotalAbsent());
            sessionHistory.add(session);
        }

        long totalSessions = sessions.size();
        double percentage = totalSessions > 0 ? (presentCount * 100.0 / totalSessions) : 0.0;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("subjectId", subject.getId());
        result.put("subjectName", subject.getName());
        result.put("subjectCode", subject.getCode());
        result.put("totalSessions", totalSessions);
        result.put("presentSessions", presentCount);
        result.put("percentage", Math.round(percentage * 10.0) / 10.0);
        result.put("belowThreshold", percentage < 75.0);
        result.put("sessions", sessionHistory);
        return result;
    }

    /** Student: get all marked attendance sessions with date and subject name */
    @Transactional
    public List<Map<String, Object>> getStudentAttendanceSessions(User student) {
        UUID studentId = student.getId();
        List<Map<String, Object>> rows = new ArrayList<>();

        for (Attendance session : attendanceRepository.findAll()) {
            Map<String, String> record = session.getRecords().stream()
                    .filter(r -> studentId.toString().equals(r.get("studentId")))
                    .findFirst()
                    .orElse(null);
            if (record == null) continue;

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("date", session.getDate());
            row.put("subjectName", session.getSubject().getName());
            row.put("subjectCode", session.getSubject().getCode());
            row.put("status", record.getOrDefault("status", "ABSENT"));
            rows.add(row);
        }

        rows.sort((a, b) -> ((LocalDate) b.get("date")).compareTo((LocalDate) a.get("date")));
        return rows;
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void applyRecords(Attendance attendance, AttendanceRequest request) {
        List<Map<String, String>> records = new ArrayList<>();
        int presentCount = 0, absentCount = 0;

        for (AttendanceRequest.AttendanceRecordDto dto : request.getRecords()) {
            Map<String, String> record = new LinkedHashMap<>();
            record.put("studentId", dto.getStudentId().toString());
            record.put("status", dto.getStatus().toUpperCase());
            records.add(record);

            if ("PRESENT".equalsIgnoreCase(dto.getStatus())) presentCount++;
            else if ("ABSENT".equalsIgnoreCase(dto.getStatus())) absentCount++;
        }

        attendance.setRecords(records);
        attendance.setTotalPresent(presentCount);
        attendance.setTotalAbsent(absentCount);
    }

    private Map<String, Object> buildSubjectSummary(UUID studentId, Subject subject) {
        List<Attendance> sessions = attendanceRepository.findBySubjectIdOrderByDateDesc(subject.getId());
        long totalSessions = sessions.size();
        long presentSessions = sessions.stream()
                .flatMap(a -> a.getRecords().stream())
                .filter(r -> studentId.toString().equals(r.get("studentId"))
                        && "PRESENT".equalsIgnoreCase(r.get("status")))
                .count();

        double percentage = totalSessions > 0 ? (presentSessions * 100.0 / totalSessions) : 0.0;

        Map<String, Object> entry = new LinkedHashMap<>();
        entry.put("subjectId", subject.getId().toString());
        entry.put("subjectName", subject.getName());
        entry.put("subjectCode", subject.getCode());
        entry.put("totalSessions", totalSessions);
        entry.put("presentSessions", presentSessions);
        entry.put("percentage", Math.round(percentage * 10.0) / 10.0);
        entry.put("belowThreshold", percentage < 75.0 && totalSessions > 0);
        return entry;
    }

    private AttendanceResponse toResponse(Attendance a) {
        List<Map<String, Object>> records = new ArrayList<>();
        for (Map<String, String> r : a.getRecords()) {
            Map<String, Object> record = new LinkedHashMap<>();
            record.put("studentId", r.get("studentId"));
            record.put("status", r.get("status"));
            records.add(record);
        }

        return AttendanceResponse.builder()
                .id(a.getId())
                .subjectId(a.getSubject().getId())
                .subjectName(a.getSubject().getName())
                .facultyId(a.getFaculty().getId())
                .facultyName(a.getFaculty().getFullName())
                .date(a.getDate())
                .records(records)
                .totalPresent(a.getTotalPresent())
                .totalAbsent(a.getTotalAbsent())
                .build();
    }
}
