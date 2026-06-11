package com.iicmr.eduportal.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class GradeRequest {

    @NotNull(message = "Obtained marks is required")
    @PositiveOrZero(message = "Marks cannot be negative")
    private Double obtainedMarks;

    private String feedback;
}
