package com.iicmr.eduportal.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class HostelRoomCreateRequest {
    @NotBlank(message = "Room number is required")
    private String roomNumber;

    private Integer floorNo;

    @NotNull(message = "Capacity is required")
    private Integer capacity;
}
