package com.iicmr.eduportal.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class HostelApplicationResponse {
    private UUID id;
    private UUID studentId;
    private String studentName;
    private UUID preferredHostelId;
    private String preferredHostelName;
    private String preferredRoomType;
    private String reason;
    private String status;
    private String adminNote;
    private String reviewedByName;
    private Instant reviewedAt;
    private Instant createdAt;
}
