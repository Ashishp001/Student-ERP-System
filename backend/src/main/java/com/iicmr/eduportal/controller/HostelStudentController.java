package com.iicmr.eduportal.controller;

import com.iicmr.eduportal.dto.request.HostelApplicationCreateRequest;
import com.iicmr.eduportal.dto.request.HostelComplaintCreateRequest;
import com.iicmr.eduportal.dto.response.ApiResponse;
import com.iicmr.eduportal.entity.User;
import com.iicmr.eduportal.service.HostelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/hostels/student")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
@Tag(name = "Hostel Student", description = "Hostel endpoints for students")
public class HostelStudentController {

    private final HostelService hostelService;

    @GetMapping("/hostels")
    @Operation(summary = "Get active hostels")
    public ResponseEntity<?> hostels() {
        return ResponseEntity.ok(ApiResponse.success(hostelService.getActiveHostels()));
    }

    @PostMapping("/applications")
    @Operation(summary = "Apply for hostel")
    public ResponseEntity<?> apply(
            @AuthenticationPrincipal User student,
            @Valid @RequestBody HostelApplicationCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(hostelService.applyForHostel(student, request), "Application submitted"));
    }

    @GetMapping("/applications")
    @Operation(summary = "Get my hostel applications")
    public ResponseEntity<?> myApplications(@AuthenticationPrincipal User student) {
        return ResponseEntity.ok(ApiResponse.success(hostelService.getMyApplications(student)));
    }

    @GetMapping("/allocation")
    @Operation(summary = "Get my active hostel allocation")
    public ResponseEntity<?> myAllocation(@AuthenticationPrincipal User student) {
        return ResponseEntity.ok(ApiResponse.success(hostelService.getMyActiveAllocation(student)));
    }

    @PostMapping("/complaints")
    @Operation(summary = "Create hostel complaint")
    public ResponseEntity<?> createComplaint(
            @AuthenticationPrincipal User student,
            @Valid @RequestBody HostelComplaintCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(hostelService.createComplaint(student, request), "Complaint created"));
    }

    @GetMapping("/complaints")
    @Operation(summary = "Get my hostel complaints")
    public ResponseEntity<?> myComplaints(@AuthenticationPrincipal User student) {
        return ResponseEntity.ok(ApiResponse.success(hostelService.getMyComplaints(student)));
    }
}
