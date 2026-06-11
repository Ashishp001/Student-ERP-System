package com.iicmr.eduportal.controller;

import com.iicmr.eduportal.dto.response.ApiResponse;
import com.iicmr.eduportal.entity.User;
import com.iicmr.eduportal.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/student/dashboard")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Student analytics dashboard")
    public ResponseEntity<?> studentDashboard(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getStudentDashboard(user)));
    }

    @GetMapping("/faculty/dashboard")
    @PreAuthorize("hasRole('FACULTY')")
    @Operation(summary = "Faculty analytics dashboard")
    public ResponseEntity<?> facultyDashboard(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getFacultyDashboard(user)));
    }

    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin analytics dashboard")
    public ResponseEntity<?> adminDashboard() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getAdminDashboard()));
    }

    @GetMapping("/admin/enrollment")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Students enrolled per course — for chart (Admin)")
    public ResponseEntity<?> enrollmentData() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getEnrollmentData()));
    }
}
