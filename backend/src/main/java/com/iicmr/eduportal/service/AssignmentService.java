package com.iicmr.eduportal.service;

import com.iicmr.eduportal.dto.request.AssignmentCreateRequest;
import com.iicmr.eduportal.dto.response.AssignmentResponse;
import com.iicmr.eduportal.entity.Assignment;
import com.iicmr.eduportal.entity.Subject;
import com.iicmr.eduportal.entity.User;
import com.iicmr.eduportal.entity.enums.AssignmentStatus;
import com.iicmr.eduportal.exception.BadRequestException;
import com.iicmr.eduportal.exception.ForbiddenException;
import com.iicmr.eduportal.exception.ResourceNotFoundException;
import com.iicmr.eduportal.repository.AssignmentRepository;
import com.iicmr.eduportal.repository.StudentProfileRepository;
import com.iicmr.eduportal.repository.SubjectRepository;
import com.iicmr.eduportal.repository.SubmissionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final SubjectRepository subjectRepository;
    private final SubmissionRepository submissionRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final FileStorageService fileStorageService;
    private final SubmissionService submissionService;

    @Transactional
    public List<AssignmentResponse> getByFaculty(UUID facultyId) {
        return assignmentRepository.findByFacultyIdOrderByCreatedAtDesc(facultyId).stream()
                .map(a -> toResponse(a, null))
                .toList();
    }

    @Transactional
    public List<AssignmentResponse> getForStudent(User student) {
        var profileOpt = studentProfileRepository.findByUserId(student.getId());
        if (profileOpt.isEmpty()) {
            return List.of();
        }

        var profile = profileOpt.get();
        List<Assignment> assignments;

        // Preferred strict match (course + semester). Fallbacks support legacy student profiles
        // that were created before course mapping was stored at registration.
        if (profile.getCourse() != null && profile.getCurrentSemester() != null) {
            UUID courseId = profile.getCourse().getId();
            Integer semester = profile.getCurrentSemester();
            assignments = assignmentRepository.findPublishedForStudents(courseId, semester, AssignmentStatus.PUBLISHED);
            if (assignments.isEmpty()) {
                assignments = assignmentRepository.findPublishedForCourse(courseId, AssignmentStatus.PUBLISHED);
            }
        } else if (profile.getCourse() != null) {
            assignments = assignmentRepository.findPublishedForCourse(profile.getCourse().getId(), AssignmentStatus.PUBLISHED);
        } else {
            assignments = assignmentRepository.findByStatusOrderByDeadlineAsc(AssignmentStatus.PUBLISHED);
            if (profile.getCurrentSemester() != null) {
                Integer semester = profile.getCurrentSemester();
                assignments = assignments.stream()
                        .filter(a -> a.getSubject() != null && semester.equals(a.getSubject().getSemester()))
                        .toList();
                if (assignments.isEmpty()) {
                    assignments = assignmentRepository.findByStatusOrderByDeadlineAsc(AssignmentStatus.PUBLISHED);
                }
            }
        }

        return assignments.stream()
                .map(a -> toResponseForStudent(a, student.getId()))
                .toList();
    }

    @Transactional
    public AssignmentResponse getById(UUID id, User currentUser) {
        Assignment a = findById(id);
        return toResponse(a, currentUser != null ? currentUser.getId() : null);
    }

    @Transactional
    public AssignmentResponse create(User faculty, AssignmentCreateRequest request, MultipartFile file) throws IOException {
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        if (subject.getFaculty() == null || !subject.getFaculty().getId().equals(faculty.getId())) {
            throw new ForbiddenException("You can only create assignments for your assigned subjects");
        }

        AssignmentStatus status;
        try {
            status = AssignmentStatus.valueOf(request.getStatus().toUpperCase());
        } catch (Exception e) {
            status = AssignmentStatus.DRAFT;
        }

        Assignment a = Assignment.builder()
                .faculty(faculty)
                .subject(subject)
                .title(request.getTitle())
                .instructions(request.getInstructions())
                .totalMarks(request.getTotalMarks())
                .deadline(request.getDeadline())
                .allowLate(request.getAllowLate() != null ? request.getAllowLate() : false)
                .status(status)
                .build();

        if (file != null && !file.isEmpty()) {
            String fileUrl = fileStorageService.store(file, "assignments", 10 * 1024 * 1024);
            a.setFileUrl(fileUrl);
            a.setFileName(file.getOriginalFilename());
        }

        return toResponse(assignmentRepository.save(a), null);
    }

    @Transactional
    public AssignmentResponse update(UUID id, User faculty, AssignmentCreateRequest request, MultipartFile file) throws IOException {
        Assignment a = findById(id);
        if (!a.getFaculty().getId().equals(faculty.getId())) {
            throw new ForbiddenException("You cannot edit this assignment");
        }
        if (a.getSubject().getFaculty() == null || !a.getSubject().getFaculty().getId().equals(faculty.getId())) {
            throw new ForbiddenException("You can only update assignments for your assigned subjects");
        }
        if (a.getStatus() == AssignmentStatus.CLOSED) {
            throw new BadRequestException("Cannot edit a closed assignment");
        }

        a.setTitle(request.getTitle());
        if (request.getInstructions() != null) a.setInstructions(request.getInstructions());
        a.setTotalMarks(request.getTotalMarks());
        a.setDeadline(request.getDeadline());
        if (request.getAllowLate() != null) a.setAllowLate(request.getAllowLate());

        if (file != null && !file.isEmpty()) {
            if (a.getFileUrl() != null) fileStorageService.delete(a.getFileUrl());
            String fileUrl = fileStorageService.store(file, "assignments", 10 * 1024 * 1024);
            a.setFileUrl(fileUrl);
            a.setFileName(file.getOriginalFilename());
        }

        return toResponse(assignmentRepository.save(a), null);
    }

    @Transactional
    public AssignmentResponse publish(UUID id, User faculty) {
        Assignment a = findById(id);
        if (!a.getFaculty().getId().equals(faculty.getId())) throw new ForbiddenException("Not authorized");
        if (a.getStatus() != AssignmentStatus.DRAFT) throw new BadRequestException("Already published or closed");
        a.setStatus(AssignmentStatus.PUBLISHED);
        return toResponse(assignmentRepository.save(a), null);
    }

    @Transactional
    public AssignmentResponse close(UUID id, User faculty) {
        Assignment a = findById(id);
        if (!a.getFaculty().getId().equals(faculty.getId())) throw new ForbiddenException("Not authorized");
        a.setStatus(AssignmentStatus.CLOSED);
        return toResponse(assignmentRepository.save(a), null);
    }

    @Transactional
    public void delete(UUID id, User faculty) {
        Assignment a = findById(id);
        if (!a.getFaculty().getId().equals(faculty.getId())) throw new ForbiddenException("Not authorized");
        if (a.getFileUrl() != null) fileStorageService.delete(a.getFileUrl());
        assignmentRepository.delete(a);
    }

    /** Faculty: get submission stats for an assignment */
    public Map<String, Object> getStats(UUID id, User faculty) {
        Assignment a = findById(id);
        if (!a.getFaculty().getId().equals(faculty.getId()))
            throw new ForbiddenException("Not authorized");

        long total = submissionRepository.countByAssignmentId(id);
        long graded = submissionRepository.countByAssignmentIdAndObtainedMarksIsNotNull(id);
        long lateCount = submissionRepository.findByAssignmentIdOrderBySubmittedAtDesc(id)
                .stream().filter(s -> Boolean.TRUE.equals(s.getIsLate())).count();
        Double avgMarks = submissionRepository.findAverageMarksByAssignmentId(id);

        Map<String, Object> stats = new java.util.LinkedHashMap<>();
        stats.put("assignmentId", id);
        stats.put("totalSubmissions", total);
        stats.put("gradedSubmissions", graded);
        stats.put("pendingSubmissions", total - graded);
        stats.put("lateSubmissions", lateCount);
        stats.put("averageMarks", avgMarks != null ? Math.round(avgMarks * 10.0) / 10.0 : null);
        stats.put("totalMarks", a.getTotalMarks());
        return stats;
    }

    /** Faculty: get list of all submissions for an assignment (delegates to SubmissionService) */
    public Object getSubmissionsForAssignment(UUID id, User faculty) {
        return submissionService.getByAssignment(id, faculty);
    }

    private Assignment findById(UUID id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + id));
    }

    private AssignmentResponse toResponseForStudent(Assignment a, UUID studentId) {
        AssignmentResponse response = toResponse(a, studentId);
        submissionRepository.findByAssignmentIdAndStudentId(a.getId(), studentId).ifPresent(sub -> {
            response.setSubmitted(true);
            response.setSubmissionStatus(sub.getStatus().name().toLowerCase());
            response.setObtainedMarks(sub.getObtainedMarks());
        });
        if (response.getSubmitted() == null) response.setSubmitted(false);
        return response;
    }

    public AssignmentResponse toResponse(Assignment a, UUID currentUserId) {
        long total = submissionRepository.countByAssignmentId(a.getId());
        long graded = submissionRepository.countByAssignmentIdAndObtainedMarksIsNotNull(a.getId());

        return AssignmentResponse.builder()
                .id(a.getId())
                .subjectId(a.getSubject().getId())
                .subjectName(a.getSubject().getName())
                .subjectCode(a.getSubject().getCode())
                .subjectSemester(a.getSubject().getSemester())
                .facultyId(a.getFaculty().getId())
                .facultyName(a.getFaculty().getFullName())
                .title(a.getTitle())
                .instructions(a.getInstructions())
                .totalMarks(a.getTotalMarks())
                .fileUrl(a.getFileUrl())
                .fileName(a.getFileName())
                .status(a.getStatus().name().toLowerCase())
                .deadline(a.getDeadline())
                .allowLate(a.getAllowLate())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .totalSubmissions(total)
                .gradedSubmissions(graded)
                .pendingSubmissions(total - graded)
                .build();
    }
}
