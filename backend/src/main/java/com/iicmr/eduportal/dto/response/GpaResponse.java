package com.iicmr.eduportal.dto.response;

import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class GpaResponse {
    private Double cgpa;
    private List<SgpaEntry> semesters;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SgpaEntry {
        private Integer semester;
        private Double  sgpa;
        private Integer totalCredits;
    }
}
