package com.iicmr.eduportal.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class HostelComplaintResponse {
    private UUID id;
    private UUID studentId;
    private String studentName;
    private UUID allocationId;
    private String category;
    private String title;
    private String description;
    private String status;
    private String adminNote;
    private String resolvedByName;
    private Instant resolvedAt;
    private Instant createdAt;
}
