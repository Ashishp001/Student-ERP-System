package com.iicmr.eduportal.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CourseRequest {

    @NotBlank(message = "Course name is required")
    private String name;

    @NotBlank(message = "Course code is required")
    private String code;

    @NotNull(message = "Total semesters is required")
    @Min(value = 1, message = "Must have at least 1 semester")
    private Integer totalSemesters;

    private Integer totalCredits;
}
