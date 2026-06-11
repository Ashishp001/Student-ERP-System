package com.iicmr.eduportal.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class BulkMarkRequest {
    @NotNull private UUID subjectId;
    @NotBlank private String component;
    @NotNull private Double maxMarks;
    @NotNull private List<StudentMarkDto> marks;

    @Data
    public static class StudentMarkDto {
        @NotNull private UUID studentId;
        private Double obtainedMarks;
    }
}
