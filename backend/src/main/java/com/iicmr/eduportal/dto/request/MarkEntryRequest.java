package com.iicmr.eduportal.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class MarkEntryRequest {
    @NotNull private UUID studentId;
    @NotNull private UUID subjectId;
    @NotBlank private String component;
    @NotNull private Double maxMarks;
    private Double obtainedMarks;
}
