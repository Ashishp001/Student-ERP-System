package com.iicmr.eduportal.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class AttendanceRequest {

    @NotNull(message = "Subject ID is required")
    private UUID subjectId;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotEmpty(message = "Attendance records cannot be empty")
    private List<AttendanceRecordDto> records;

    @Data
    public static class AttendanceRecordDto {
        @NotNull
        private UUID studentId;
        /** present | absent | leave */
        @NotNull
        private String status;
    }
}
