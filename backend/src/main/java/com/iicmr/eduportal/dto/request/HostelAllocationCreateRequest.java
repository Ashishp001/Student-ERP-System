package com.iicmr.eduportal.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class HostelAllocationCreateRequest {
    @NotNull(message = "Student ID is required")
    private UUID studentId;

    @NotNull(message = "Room ID is required")
    private UUID roomId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private String academicYear;
    private String notes;
}
