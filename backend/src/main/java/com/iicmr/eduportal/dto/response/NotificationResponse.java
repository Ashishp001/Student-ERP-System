package com.iicmr.eduportal.dto.response;

import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class NotificationResponse {
    private UUID    id;
    private String  title;
    private String  message;
    private String  type;
    private String  link;
    private Boolean isRead;
    private Instant createdAt;
}
