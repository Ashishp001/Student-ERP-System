package com.iicmr.eduportal.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class SubjectResponse {
    private UUID id;
    private UUID courseId;
    private String courseName;
    private String courseCode;
    private UUID facultyId;
    private String facultyName;
    private String name;
    private String code;
    private Integer semester;
    private Integer credits;
    private String type;
    private Double maxInternalMarks;
    private Double maxExternalMarks;
    private Boolean isActive;
    private Instant createdAt;
}
