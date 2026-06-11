package com.iicmr.eduportal.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrievanceResponse {
    private UUID id;
    private UUID studentId;
    private String studentName;
    private String category;
    private String subject;
    private String description;
    private String status;
    private boolean isAnonymous;
    private UUID assignedTo;
    private String assignedToName;
    private String resolutionNote;
    private String priority;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant resolvedAt;
}
