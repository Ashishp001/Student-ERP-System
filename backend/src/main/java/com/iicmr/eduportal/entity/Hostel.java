package com.iicmr.eduportal.entity;

import com.iicmr.eduportal.entity.enums.HostelType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "hostels")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Hostel {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false, length = 200)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private HostelType type;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "warden_name", length = 255)
    private String wardenName;

    @Column(name = "warden_phone", length = 20)
    private String wardenPhone;

    @Column(name = "total_rooms", nullable = false)
    @Builder.Default
    private Integer totalRooms = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer floors = 1;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;
}
