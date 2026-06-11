package com.iicmr.eduportal.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class AttendanceResponse {
    private UUID id;
    private UUID subjectId;
    private String subjectName;
    private UUID facultyId;
    private String facultyName;
    private LocalDate date;
    private List<Map<String, Object>> records;
    private Integer totalPresent;
    private Integer totalAbsent;
}
