package com.iicmr.eduportal.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaterialResponse {
    private UUID id;
    private UUID facultyId;
    private String facultyName;
    private UUID subjectId;
    private String subjectName;
    private String subjectCode;
    private String title;
    private String description;
    private String topic;
    private String fileUrl;
    private String fileName;
    private String fileType;
    private Integer fileSize;
    private Integer downloadCount;
    private Instant createdAt;
}
