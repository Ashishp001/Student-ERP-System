package com.iicmr.eduportal.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class CourseResponse {
    private UUID id;
    private String name;
    private String code;
    private Integer totalSemesters;
    private Integer totalCredits;
    private Boolean isActive;
    private Instant createdAt;
}
