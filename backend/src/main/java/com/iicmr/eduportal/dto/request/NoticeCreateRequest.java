package com.iicmr.eduportal.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class NoticeCreateRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    private String category = "general";
    private String targetAudience = "all";
    private Boolean isPinned = false;
}
