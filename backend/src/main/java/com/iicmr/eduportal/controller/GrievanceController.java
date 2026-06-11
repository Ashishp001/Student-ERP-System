package com.iicmr.eduportal.controller;

import com.iicmr.eduportal.dto.request.GrievanceCreateRequest;
import com.iicmr.eduportal.dto.response.ApiResponse;
import com.iicmr.eduportal.entity.User;
import com.iicmr.eduportal.service.GrievanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/grievances")
@RequiredArgsConstructor
@Tag(name = "Grievances")
public class GrievanceController {

    private final GrievanceService grievanceService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "File a new grievance (Student)")
    public ResponseEntity<?> file(@AuthenticationPrincipal User student,
                                  @Valid @RequestBody GrievanceCreateRequest req) {
        return ResponseEntity.ok(ApiResponse.success(grievanceService.file(student, req), "Grievance filed"));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get my grievances (Student)")
    public ResponseEntity<?> getMy(@AuthenticationPrincipal User student) {
        return ResponseEntity.ok(ApiResponse.success(grievanceService.getMy(student)));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all grievances with optional status filter (Admin)")
    public ResponseEntity<?> getAll(@RequestParam(required = false) String status,
                                    @RequestParam(defaultValue = "0")  int page,
                                    @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(grievanceService.getAll(status, page, size)));
    }

    @GetMapping("/counts")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get counts per status for admin dashboard")
    public ResponseEntity<?> getCounts() {
        return ResponseEntity.ok(ApiResponse.success(grievanceService.getCounts()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get grievance detail (Student: own only, Admin: any)")
    public ResponseEntity<?> getById(@AuthenticationPrincipal User user,
                                     @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(grievanceService.getById(id, user)));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Assign grievance to a staff member (Admin)")
    public ResponseEntity<?> assign(@PathVariable UUID id,
                                    @RequestBody Map<String, String> body) {
        UUID assigneeId = UUID.fromString(body.get("assigneeId"));
        return ResponseEntity.ok(ApiResponse.success(grievanceService.assign(id, assigneeId), "Assigned"));
    }

    @PatchMapping("/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Resolve a grievance (Admin)")
    public ResponseEntity<?> resolve(@PathVariable UUID id,
                                     @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success(
                grievanceService.resolve(id, body.getOrDefault("resolutionNote", "")), "Resolved"));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reject a grievance (Admin)")
    public ResponseEntity<?> reject(@PathVariable UUID id,
                                    @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success(
                grievanceService.reject(id, body.getOrDefault("reason", "")), "Rejected"));
    }
}
