package com.iicmr.eduportal.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class HostelAllocationResponse {
    private UUID id;
    private UUID studentId;
    private String studentName;
    private UUID roomId;
    private String roomNumber;
    private UUID hostelId;
    private String hostelName;
    private String hostelAddress;
    private String wardenName;
    private String wardenPhone;
    private LocalDate startDate;
    private LocalDate endDate;
    private String academicYear;
    private String status;
    private String notes;
    private Instant createdAt;
}
