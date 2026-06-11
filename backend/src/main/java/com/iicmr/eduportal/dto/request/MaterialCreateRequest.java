package com.iicmr.eduportal.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class MaterialCreateRequest {
    @NotNull  private UUID subjectId;
    @NotBlank private String title;
    private String description;
    private String topic;
}
