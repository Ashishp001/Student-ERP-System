package com.iicmr.eduportal.service;

import com.iicmr.eduportal.config.AppProperties;
import com.iicmr.eduportal.dto.request.UpdateProfileRequest;
import com.iicmr.eduportal.dto.response.UserResponse;
import com.iicmr.eduportal.entity.FacultyProfile;
import com.iicmr.eduportal.entity.StudentProfile;
import com.iicmr.eduportal.entity.User;
import com.iicmr.eduportal.entity.enums.UserRole;
import com.iicmr.eduportal.exception.BadRequestException;
import com.iicmr.eduportal.exception.ResourceNotFoundException;
import com.iicmr.eduportal.repository.FacultyProfileRepository;
import com.iicmr.eduportal.repository.StudentProfileRepository;
import com.iicmr.eduportal.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final AppProperties appProperties;

    public UserResponse getProfile(User user) {
        return mapToUserResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(User user, UpdateProfileRequest request) {
        if (request.getFullName() != null) {
            user.setFullName(normalizeFullName(request.getFullName()));
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        if (user.getRole() == UserRole.STUDENT) {
            StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
            if (request.getAddress() != null) profile.setAddress(request.getAddress());
            if (request.getGuardianName() != null) profile.setGuardianName(request.getGuardianName());
            if (request.getGuardianPhone() != null) profile.setGuardianPhone(request.getGuardianPhone());
            studentProfileRepository.save(profile);
        } else if (user.getRole() == UserRole.FACULTY) {
            FacultyProfile profile = facultyProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found"));
            if (request.getDepartment() != null) profile.setDepartment(request.getDepartment());
            if (request.getDesignation() != null) profile.setDesignation(request.getDesignation());
            if (request.getQualification() != null) profile.setQualification(request.getQualification());
            if (request.getAddress() != null) profile.setAddress(request.getAddress());
            facultyProfileRepository.save(profile);
        }

        userRepository.save(user);
        // Re-fetch to get updated profile
        User refreshed = userRepository.findById(user.getId()).orElse(user);
        return mapToUserResponse(refreshed);
    }

    private String normalizeFullName(String fullName) {
        String normalized = fullName.trim().replaceAll("\\s+", " ");
        String[] parts = normalized.split(" ");
        if (parts.length < 2) {
            throw new BadRequestException("Please enter full name with name and surname");
        }
        return normalized;
    }

    @Transactional
    public String uploadAvatar(User user, MultipartFile file) throws IOException {
        // Validate
        String contentType = file.getContentType();
        if (contentType == null || !List.of("image/jpeg", "image/png", "image/webp").contains(contentType)) {
            throw new BadRequestException("Only JPG, PNG, WebP images are allowed");
        }
        if (file.getSize() > 2 * 1024 * 1024) {
            throw new BadRequestException("Avatar must be under 2MB");
        }

        // Delete old avatar if exists
        if (user.getAvatarUrl() != null) {
            Path oldPath = Paths.get(appProperties.getFile().getUploadDir(), "avatars",
                    user.getAvatarUrl().substring(user.getAvatarUrl().lastIndexOf("/") + 1));
            Files.deleteIfExists(oldPath);
        }

        // Save resized avatar
        String filename = user.getId().toString() + ".jpg";
        Path avatarDir = Paths.get(appProperties.getFile().getUploadDir(), "avatars");
        Files.createDirectories(avatarDir);
        Path targetPath = avatarDir.resolve(filename);

        Thumbnails.of(file.getInputStream())
                .size(256, 256)
                .outputFormat("jpg")
                .toFile(targetPath.toFile());

        String avatarUrl = "/uploads/avatars/" + filename;
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);
        return avatarUrl;
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .toList();
    }

    @Transactional
    public void deactivateUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setIsActive(false);
        userRepository.save(user);
    }

    public UserResponse mapToUserResponse(User user) {
        UserResponse.UserResponseBuilder builder = UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .isActive(user.getIsActive())
                .lastLogin(user.getLastLogin())
                .createdAt(user.getCreatedAt());

        // Load profile based on role
        if (user.getRole() == UserRole.STUDENT) {
            studentProfileRepository.findByUserId(user.getId()).ifPresent(p -> {
                builder.enrollmentNumber(p.getEnrollmentNumber());
                builder.currentSemester(p.getCurrentSemester());
                builder.academicYear(p.getAcademicYear());
                builder.studentAddress(p.getAddress());
            });
        } else if (user.getRole() == UserRole.FACULTY) {
            facultyProfileRepository.findByUserId(user.getId()).ifPresent(p -> {
                builder.department(p.getDepartment());
                builder.designation(p.getDesignation());
                builder.qualification(p.getQualification());
                builder.facultyAddress(p.getAddress());
            });
        }

        return builder.build();
    }
}
