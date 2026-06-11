package com.iicmr.eduportal.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class HostelNameUpdateRequest {
    @NotBlank(message = "Hostel name is required")
    private String name;
}
