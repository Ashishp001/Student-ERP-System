package com.iicmr.eduportal.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class HostelResponse {
    private UUID id;
    private String name;
    private String type;
    private String address;
    private String wardenName;
    private String wardenPhone;
    private Integer totalRooms;
    private Integer floors;
    private Boolean isActive;
    private Instant createdAt;
}
