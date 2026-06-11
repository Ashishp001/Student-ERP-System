package com.iicmr.eduportal.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class SubjectRequest {

    @NotNull(message = "Course ID is required")
    private UUID courseId;

    private UUID facultyId;

    @NotBlank(message = "Subject name is required")
    private String name;

    @NotBlank(message = "Subject code is required")
    private String code;

    @NotNull(message = "Semester is required")
    @Min(value = 1, message = "Semester must be at least 1")
    private Integer semester;

    @NotNull(message = "Credits is required")
    @Min(value = 1, message = "Credits must be at least 1")
    private Integer credits;

    /** core | elective | lab | project */
    private String type = "core";

    private Double maxInternalMarks = 40.0;
    private Double maxExternalMarks = 60.0;
}
