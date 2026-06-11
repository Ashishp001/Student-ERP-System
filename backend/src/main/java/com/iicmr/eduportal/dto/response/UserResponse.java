package com.iicmr.eduportal.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID id;
    private String email;
    private String username;
    private String fullName;
    private String role;
    private String phone;
    private String avatarUrl;
    private Boolean isActive;
    private Instant lastLogin;
    private Instant createdAt;

    // Student fields (null if not student)
    private String enrollmentNumber;
    private Integer currentSemester;
    private String academicYear;
    private String studentAddress;

    // Faculty fields (null if not faculty)
    private String department;
    private String designation;
    private String qualification;
    private String facultyAddress;
}
