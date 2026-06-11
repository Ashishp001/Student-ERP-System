package com.iicmr.eduportal.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class HostelCreateRequest {
    @NotBlank(message = "Hostel name is required")
    private String name;

    @NotBlank(message = "Hostel type is required")
    private String type;

    private String address;
    private String wardenName;
    private String wardenPhone;

    @NotNull(message = "Total rooms is required")
    private Integer totalRooms;

    @NotNull(message = "Floors is required")
    private Integer floors;
}
