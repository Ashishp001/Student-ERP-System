package com.iicmr.eduportal.controller;

import com.iicmr.eduportal.dto.request.AttendanceRequest;
import com.iicmr.eduportal.dto.response.ApiResponse;
import com.iicmr.eduportal.entity.User;
import com.iicmr.eduportal.service.AttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
@Tag(name = "Attendance", description = "Attendance mark and view endpoints")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping
    @PreAuthorize("hasRole('FACULTY')")
    @Operation(summary = "Mark or update attendance for a session (Faculty)")
    public ResponseEntity<?> markAttendance(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody AttendanceRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                attendanceService.markAttendance(currentUser, request),
                "Attendance saved"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FACULTY')")
    @Operation(summary = "Edit attendance session — only allowed within 3 days of the class date (Faculty)")
    public ResponseEntity<?> editAttendance(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody AttendanceRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                attendanceService.editAttendance(id, currentUser, request),
                "Attendance updated"));
    }

    @GetMapping("/subject/{subjectId}")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    @Operation(summary = "Get attendance history for a subject (Faculty/Admin)")
    public ResponseEntity<?> getBySubject(@PathVariable UUID subjectId) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getBySubject(subjectId)));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get attendance summary for current student (all subjects)")
    public ResponseEntity<?> getMyAttendance(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(
                attendanceService.getStudentAttendanceSummary(currentUser)));
    }

    @GetMapping("/my/{subjectId}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get attendance detail for current student for a specific subject")
    public ResponseEntity<?> getMyAttendanceForSubject(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID subjectId) {
        return ResponseEntity.ok(ApiResponse.success(
                attendanceService.getStudentAttendanceForSubject(currentUser, subjectId)));
    }

    @GetMapping("/my-sessions")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get attendance sessions for current student with date and subject")
    public ResponseEntity<?> getMyAttendanceSessions(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(
                attendanceService.getStudentAttendanceSessions(currentUser)));
    }
}
