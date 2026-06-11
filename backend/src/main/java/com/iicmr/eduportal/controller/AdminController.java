package com.iicmr.eduportal.controller;

import com.iicmr.eduportal.dto.response.ApiResponse;
import com.iicmr.eduportal.dto.response.UserResponse;
import com.iicmr.eduportal.entity.User;
import com.iicmr.eduportal.entity.enums.UserRole;
import com.iicmr.eduportal.exception.ResourceNotFoundException;
import com.iicmr.eduportal.repository.UserRepository;
import com.iicmr.eduportal.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Administrative management operations")
public class AdminController {

    private final UserService userService;
    private final UserRepository userRepository;

    @GetMapping("/users")
    @Operation(summary = "List all users with optional filters")
    public ResponseEntity<ApiResponse<List<UserResponse>>> listUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search) {
        List<UserResponse> users = userService.getAllUsers();

        // Filter by role if specified
        if (role != null && !role.isBlank()) {
            String upperRole = role.toUpperCase();
            users = users.stream()
                    .filter(u -> u.getRole().equalsIgnoreCase(upperRole))
                    .toList();
        }

        // Filter by search (name or email) if specified
        if (search != null && !search.isBlank()) {
            String query = search.toLowerCase();
            users = users.stream()
                    .filter(u -> u.getFullName().toLowerCase().contains(query)
                            || u.getEmail().toLowerCase().contains(query))
                    .toList();
        }

        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Get any user's profile by ID")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(ApiResponse.success(userService.mapToUserResponse(user)));
    }

    @PatchMapping("/users/{id}/activate")
    @Operation(summary = "Re-activate a deactivated user")
    public ResponseEntity<ApiResponse<String>> activateUser(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setIsActive(true);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("User activated", "User activated successfully"));
    }

    @PatchMapping("/users/{id}/deactivate")
    @Operation(summary = "Deactivate (soft-delete) a user")
    public ResponseEntity<ApiResponse<String>> deactivateUser(@PathVariable UUID id) {
        userService.deactivateUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deactivated", "User deactivated successfully"));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Soft-delete a user (set is_active = false)")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable UUID id) {
        userService.deactivateUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted", "User has been deactivated"));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get admin overview statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        long totalStudents = userRepository.findAll().stream()
                .filter(u -> u.getRole() == UserRole.STUDENT && u.getIsActive()).count();
        long totalFaculty = userRepository.findAll().stream()
                .filter(u -> u.getRole() == UserRole.FACULTY && u.getIsActive()).count();
        long totalUsers = userRepository.findAll().stream()
                .filter(User::getIsActive).count();

        Map<String, Object> stats = Map.of(
                "totalStudents", totalStudents,
                "totalFaculty", totalFaculty,
                "totalUsers", totalUsers
        );
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
