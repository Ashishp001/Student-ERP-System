package com.iicmr.eduportal.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.UUID;

@Data
public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 100, message = "Username must be 3-100 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "STUDENT|FACULTY", message = "Role must be STUDENT or FACULTY")
    private String role;

    private String phone;

    // Student-specific
    private String enrollmentNumber;
    private UUID courseId;
    private Integer currentSemester;
    private String academicYear;

    // Faculty-specific
    private String department;
    private String designation;
}
