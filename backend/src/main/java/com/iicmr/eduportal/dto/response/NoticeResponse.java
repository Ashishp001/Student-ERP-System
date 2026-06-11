package com.iicmr.eduportal.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class NoticeResponse {
    private UUID id;
    private UUID createdById;
    private String createdByName;
    private String title;
    private String content;
    private String category;
    private String targetAudience;
    private String fileUrl;
    private String fileName;
    private Boolean isPinned;
    private Boolean isArchived;
    private Instant createdAt;
    private Instant updatedAt;
}
