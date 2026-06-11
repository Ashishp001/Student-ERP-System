package com.iicmr.eduportal.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class ResultEntryRequest {
    @NotNull  private UUID studentId;
    @NotNull  private UUID subjectId;
    @NotBlank private String examType;       // "mid_sem", "end_sem", "supplementary"
    @NotNull  private Double maxMarks;
    @NotNull  private Double obtainedMarks;
    @NotNull  private Integer semester;
    @NotBlank private String academicYear;   // "2025-2026"
}
