package com.iicmr.eduportal.service;

import com.iicmr.eduportal.dto.request.GradeRequest;
import com.iicmr.eduportal.dto.response.SubmissionResponse;
import com.iicmr.eduportal.entity.Assignment;
import com.iicmr.eduportal.entity.Submission;
import com.iicmr.eduportal.entity.User;
import com.iicmr.eduportal.entity.enums.AssignmentStatus;
import com.iicmr.eduportal.entity.enums.SubmissionStatus;
import com.iicmr.eduportal.exception.BadRequestException;
import com.iicmr.eduportal.exception.ForbiddenException;
import com.iicmr.eduportal.exception.ResourceNotFoundException;
import com.iicmr.eduportal.repository.AssignmentRepository;
import com.iicmr.eduportal.repository.StudentProfileRepository;
import com.iicmr.eduportal.repository.SubmissionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final FileStorageService fileStorageService;

    /** Student submits or resubmits an assignment */
    @Transactional
    public SubmissionResponse submit(UUID assignmentId, User student, MultipartFile file) throws IOException {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        if (assignment.getStatus() != AssignmentStatus.PUBLISHED) {
            throw new BadRequestException("Assignment is not open for submission");
        }

        boolean isLate = Instant.now().isAfter(assignment.getDeadline());
        if (isLate && !assignment.getAllowLate()) {
            throw new BadRequestException("Submission deadline has passed and late submissions are not allowed");
        }

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Submission file is required");
        }

        String fileUrl = fileStorageService.store(file, "submissions", 10 * 1024 * 1024);

        // Upsert: delete old if resubmit
        submissionRepository.findByAssignmentIdAndStudentId(assignmentId, student.getId()).ifPresent(old -> {
            if (old.getFileUrl() != null) fileStorageService.delete(old.getFileUrl());
            submissionRepository.delete(old);
        });

        Submission submission = Submission.builder()
                .assignment(assignment)
                .student(student)
                .fileUrl(fileUrl)
                .fileName(file.getOriginalFilename())
                .fileSize((int) file.getSize())
                .isLate(isLate)
                .status(SubmissionStatus.SUBMITTED)
                .build();

        return toResponse(submissionRepository.save(submission));
    }

    /** Faculty: get all submissions for an assignment */
    @Transactional
    public List<SubmissionResponse> getByAssignment(UUID assignmentId, User faculty) {
        Assignment a = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        if (!hasFacultyAccess(a, faculty)) {
            throw new ForbiddenException("Not authorized to view these submissions");
        }
        return submissionRepository.findByAssignmentIdOrderBySubmittedAtDesc(assignmentId).stream()
                .map(this::toResponse)
                .toList();
    }

    /** Student: get their own submissions */
    @Transactional
    public List<SubmissionResponse> getMySubmissions(User student) {
        return submissionRepository.findByStudentIdOrderBySubmittedAtDesc(student.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    /** Get single submission for student+assignment */
    @Transactional
    public SubmissionResponse getMySubmission(UUID assignmentId, User student) {
        return submissionRepository.findByAssignmentIdAndStudentId(assignmentId, student.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("No submission found"));
    }

    /** Faculty: grade a submission */
    @Transactional
    public SubmissionResponse grade(UUID submissionId, User faculty, GradeRequest request) {
        Submission sub = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));

        // Verify faculty owns this assignment
        if (!hasFacultyAccess(sub.getAssignment(), faculty)) {
            throw new ForbiddenException("Not authorized to grade this submission");
        }

        double total = sub.getAssignment().getTotalMarks();
        if (request.getObtainedMarks() > total) {
            throw new BadRequestException("Obtained marks (" + request.getObtainedMarks() + ") exceed total marks (" + total + ")");
        }

        sub.setObtainedMarks(request.getObtainedMarks());
        sub.setFeedback(request.getFeedback());
        sub.setStatus(SubmissionStatus.GRADED);
        sub.setGradedAt(Instant.now());
        sub.setGradedBy(faculty);

        return toResponse(submissionRepository.save(sub));
    }

    private SubmissionResponse toResponse(Submission s) {
        String enrollmentNumber = studentProfileRepository.findByUserId(s.getStudent().getId())
                .map(p -> p.getEnrollmentNumber())
                .orElse("-");

        return SubmissionResponse.builder()
                .id(s.getId())
                .assignmentId(s.getAssignment().getId())
                .assignmentTitle(s.getAssignment().getTitle())
                .studentId(s.getStudent().getId())
                .studentName(s.getStudent().getFullName())
                .enrollmentNumber(enrollmentNumber)
                .fileUrl(s.getFileUrl())
                .fileName(s.getFileName())
                .fileSize(s.getFileSize())
                .obtainedMarks(s.getObtainedMarks())
                .totalMarks(s.getAssignment().getTotalMarks())
                .feedback(s.getFeedback())
                .status(s.getStatus().name().toLowerCase())
                .isLate(s.getIsLate())
                .submittedAt(s.getSubmittedAt())
                .gradedAt(s.getGradedAt())
                .gradedById(s.getGradedBy() != null ? s.getGradedBy().getId() : null)
                .gradedByName(s.getGradedBy() != null ? s.getGradedBy().getFullName() : null)
                .build();
    }

    private boolean hasFacultyAccess(Assignment assignment, User faculty) {
        if (assignment == null || faculty == null || faculty.getId() == null) return false;
        if (assignment.getFaculty() != null && faculty.getId().equals(assignment.getFaculty().getId())) {
            return true;
        }
        return assignment.getSubject() != null
                && assignment.getSubject().getFaculty() != null
                && faculty.getId().equals(assignment.getSubject().getFaculty().getId());
    }
}
