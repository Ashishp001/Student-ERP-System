package com.iicmr.eduportal.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class HostelApplicationCreateRequest {
    private UUID preferredHostelId;
    private String preferredRoomType;

    @NotBlank(message = "Reason is required")
    private String reason;
}
