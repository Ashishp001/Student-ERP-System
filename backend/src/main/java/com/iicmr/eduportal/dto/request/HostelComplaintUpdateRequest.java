package com.iicmr.eduportal.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class HostelComplaintUpdateRequest {
    @NotBlank(message = "Status is required")
    private String status;
    private String adminNote;
}
