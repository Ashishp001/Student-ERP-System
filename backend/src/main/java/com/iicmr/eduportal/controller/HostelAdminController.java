package com.iicmr.eduportal.controller;

import com.iicmr.eduportal.dto.request.*;
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

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hostels/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Hostel Admin", description = "Hostel management endpoints for admin")
public class HostelAdminController {

    private final HostelService hostelService;

    @PostMapping
    @Operation(summary = "Create hostel")
    public ResponseEntity<?> createHostel(@Valid @RequestBody HostelCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(hostelService.createHostel(request), "Hostel created"));
    }

    @GetMapping
    @Operation(summary = "Get all hostels")
    public ResponseEntity<?> getHostels() {
        return ResponseEntity.ok(ApiResponse.success(hostelService.getHostels()));
    }

    @PatchMapping("/{hostelId}/name")
    @Operation(summary = "Update hostel name")
    public ResponseEntity<?> updateHostelName(
            @PathVariable UUID hostelId,
            @Valid @RequestBody HostelNameUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                hostelService.updateHostelName(hostelId, request.getName()),
                "Hostel name updated"));
    }

    @PostMapping("/{hostelId}/rooms")
    @Operation(summary = "Add room to hostel")
    public ResponseEntity<?> addRoom(@PathVariable UUID hostelId, @Valid @RequestBody HostelRoomCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(hostelService.addRoom(hostelId, request), "Room added"));
    }

    @GetMapping("/{hostelId}/rooms")
    @Operation(summary = "Get rooms of hostel")
    public ResponseEntity<?> getRooms(@PathVariable UUID hostelId) {
        return ResponseEntity.ok(ApiResponse.success(hostelService.getRooms(hostelId)));
    }

    @GetMapping("/applications")
    @Operation(summary = "Get hostel applications")
    public ResponseEntity<?> getApplications(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(hostelService.getApplications(status)));
    }

    @PatchMapping("/applications/{id}")
    @Operation(summary = "Review hostel application")
    public ResponseEntity<?> reviewApplication(
            @PathVariable UUID id,
            @Valid @RequestBody HostelApplicationReviewRequest request,
            @AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(ApiResponse.success(hostelService.reviewApplication(id, request, admin), "Application reviewed"));
    }

    @PostMapping("/allocations")
    @Operation(summary = "Allocate room to student")
    public ResponseEntity<?> allocateRoom(
            @Valid @RequestBody HostelAllocationCreateRequest request,
            @AuthenticationPrincipal User admin) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(hostelService.allocateRoom(request, admin), "Room allocated"));
    }

    @GetMapping("/allocations/active")
    @Operation(summary = "Get active allocations")
    public ResponseEntity<?> getActiveAllocations() {
        return ResponseEntity.ok(ApiResponse.success(hostelService.getActiveAllocations()));
    }

    @PatchMapping("/allocations/{id}/checkout")
    @Operation(summary = "Checkout student from room")
    public ResponseEntity<?> checkout(@PathVariable UUID id, @RequestParam(required = false) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.success(hostelService.checkout(id, endDate), "Checkout completed"));
    }

    @GetMapping("/complaints")
    @Operation(summary = "Get hostel complaints")
    public ResponseEntity<?> getComplaints(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(hostelService.getComplaints(status)));
    }

    @PatchMapping("/complaints/{id}")
    @Operation(summary = "Update complaint status")
    public ResponseEntity<?> updateComplaint(
            @PathVariable UUID id,
            @Valid @RequestBody HostelComplaintUpdateRequest request,
            @AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(ApiResponse.success(hostelService.updateComplaint(id, request, admin), "Complaint updated"));
    }
}
