package com.iicmr.eduportal.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GrievanceCreateRequest {

    @NotBlank(message = "Category is required")
    private String category;          // academic | facility | faculty | administrative | other

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Description is required")
    private String description;

    private Boolean isAnonymous = false;

    private String priority = "medium";  // low | medium | high
}
