package com.iicmr.eduportal.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class AssignmentCreateRequest {

    @NotNull(message = "Subject ID is required")
    private UUID subjectId;

    @NotBlank(message = "Title is required")
    private String title;

    private String instructions;

    @NotNull(message = "Total marks is required")
    @Min(value = 0, message = "Total marks must be 0 or more")
    private Double totalMarks;

    @NotNull(message = "Deadline is required")
    private Instant deadline;

    private Boolean allowLate = false;

    /** draft | published */
    private String status = "draft";
}
