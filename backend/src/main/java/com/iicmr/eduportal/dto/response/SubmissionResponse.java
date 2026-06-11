package com.iicmr.eduportal.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class SubmissionResponse {
    private UUID id;
    private UUID assignmentId;
    private String assignmentTitle;
    private UUID studentId;
    private String studentName;
    private String enrollmentNumber;
    private String fileUrl;
    private String fileName;
    private Integer fileSize;
    private Double obtainedMarks;
    private Double totalMarks;
    private String feedback;
    private String status;
    private Boolean isLate;
    private Instant submittedAt;
    private Instant gradedAt;
    private UUID gradedById;
    private String gradedByName;
}
