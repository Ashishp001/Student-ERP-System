package com.iicmr.eduportal.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class AssignmentResponse {
    private UUID id;
    private UUID subjectId;
    private String subjectName;
    private String subjectCode;
    private Integer subjectSemester;
    private UUID facultyId;
    private String facultyName;
    private String title;
    private String instructions;
    private Double totalMarks;
    private String fileUrl;
    private String fileName;
    private String status;
    private Instant deadline;
    private Boolean allowLate;
    private Instant createdAt;
    private Instant updatedAt;

    // Stats (populated when fetching detail)
    private Long totalSubmissions;
    private Long gradedSubmissions;
    private Long pendingSubmissions;

    // Student-specific: has this student submitted?
    private Boolean submitted;
    private String submissionStatus;
    private Double obtainedMarks;
}
