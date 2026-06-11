package com.iicmr.eduportal.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class HostelRoomResponse {
    private UUID id;
    private UUID hostelId;
    private String hostelName;
    private String roomNumber;
    private Integer floorNo;
    private Integer capacity;
    private Integer occupiedCount;
    private Integer availableCount;
    private Boolean isActive;
    private Instant createdAt;
}
