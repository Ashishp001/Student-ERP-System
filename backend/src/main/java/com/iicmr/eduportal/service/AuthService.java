package com.iicmr.eduportal.service;

import com.iicmr.eduportal.config.JwtTokenProvider;
import com.iicmr.eduportal.dto.request.ChangePasswordRequest;
import com.iicmr.eduportal.dto.request.LoginRequest;
import com.iicmr.eduportal.dto.request.RegisterRequest;
import com.iicmr.eduportal.dto.response.AuthResponse;
import com.iicmr.eduportal.dto.response.TokenResponse;
import com.iicmr.eduportal.dto.response.UserResponse;
import com.iicmr.eduportal.entity.Course;
import com.iicmr.eduportal.entity.FacultyProfile;
import com.iicmr.eduportal.entity.StudentProfile;
import com.iicmr.eduportal.entity.User;
import com.iicmr.eduportal.entity.enums.UserRole;
import com.iicmr.eduportal.exception.BadRequestException;
import com.iicmr.eduportal.exception.ResourceNotFoundException;
import com.iicmr.eduportal.exception.UnauthorizedException;
import com.iicmr.eduportal.repository.CourseRepository;
import com.iicmr.eduportal.repository.FacultyProfileRepository;
import com.iicmr.eduportal.repository.StudentProfileRepository;
import com.iicmr.eduportal.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already taken: " + request.getUsername());
        }

        UserRole role = UserRole.valueOf(request.getRole());

        User user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(normalizeFullName(request.getFullName()))
                .role(role)
                .phone(request.getPhone())
                .build();
        user = userRepository.save(user);

        // Create role-specific profile
        if (role == UserRole.STUDENT) {
            if (request.getCourseId() == null) {
                throw new BadRequestException("Course is required for student registration");
            }
            Course course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + request.getCourseId()));
            StudentProfile profile = StudentProfile.builder()
                    .user(user)
                    .course(course)
                    .enrollmentNumber(request.getEnrollmentNumber())
                    .currentSemester(request.getCurrentSemester() != null ? request.getCurrentSemester() : 1)
                    .academicYear(request.getAcademicYear())
                    .build();
            studentProfileRepository.save(profile);
        } else if (role == UserRole.FACULTY) {
            FacultyProfile profile = FacultyProfile.builder()
                    .user(user)
                    .department(request.getDepartment())
                    .designation(request.getDesignation())
                    .build();
            facultyProfileRepository.save(profile);
        }

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }
        if (!user.getIsActive()) {
            throw new UnauthorizedException("Account is deactivated. Contact admin.");
        }

        // Validate role if provided
        if (request.getRole() != null && !request.getRole().isBlank()) {
            try {
                UserRole selectedRole = UserRole.valueOf(request.getRole());
                if (user.getRole() != selectedRole) {
                    throw new UnauthorizedException("You are not registered as " + selectedRole + ". Your account role is " + user.getRole() + ".");
                }
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid role: " + request.getRole());
            }
        }

        user.setLastLogin(Instant.now());
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    public TokenResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }
        String tokenType = jwtTokenProvider.getTokenType(refreshToken);
        if (!"refresh".equals(tokenType)) {
            throw new UnauthorizedException("Not a refresh token");
        }
        UUID userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        String newAccessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getRole().name());
        return TokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken) // return same refresh token
                .build();
    }

    @Transactional
    public void changePassword(User currentUser, ChangePasswordRequest request) {
        if (!passwordEncoder.matches(request.getOldPassword(), currentUser.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }
        currentUser.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(currentUser);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getRole().name());

        return AuthResponse.builder()
                .user(userService.mapToUserResponse(user))
                .tokens(TokenResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(refreshToken)
                        .build())
                .build();
    }

    private String normalizeFullName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            throw new BadRequestException("Full name is required");
        }
        String normalized = fullName.trim().replaceAll("\\s+", " ");
        String[] parts = normalized.split(" ");
        if (parts.length < 2) {
            throw new BadRequestException("Please enter full name with name and surname");
        }
        return normalized;
    }
}
