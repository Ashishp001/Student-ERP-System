package com.iicmr.eduportal.controller;

import com.iicmr.eduportal.dto.request.AssignmentCreateRequest;
import com.iicmr.eduportal.dto.response.ApiResponse;
import com.iicmr.eduportal.entity.User;
import com.iicmr.eduportal.service.AssignmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/assignments")
@RequiredArgsConstructor
@Tag(name = "Assignments", description = "Assignment lifecycle endpoints")
public class AssignmentController {

    private final AssignmentService assignmentService;

    @GetMapping("/my")
    @PreAuthorize("hasRole('FACULTY')")
    @Operation(summary = "Get my assignments (Faculty)")
    public ResponseEntity<?> getMyAssignments(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getByFaculty(currentUser.getId())));
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get published assignments for student's course+semester")
    public ResponseEntity<?> getForStudent(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getForStudent(currentUser)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get assignment by ID")
    public ResponseEntity<?> getById(@PathVariable UUID id, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getById(id, currentUser)));
    }

    @GetMapping("/{id}/stats")
    @PreAuthorize("hasRole('FACULTY')")
    @Operation(summary = "Get submission statistics for an assignment (Faculty)")
    public ResponseEntity<?> getStats(@PathVariable UUID id, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getStats(id, currentUser)));
    }

    @GetMapping("/{id}/submissions")
    @PreAuthorize("hasRole('FACULTY')")
    @Operation(summary = "List all submissions for an assignment (Faculty)")
    public ResponseEntity<?> getSubmissions(@PathVariable UUID id, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getSubmissionsForAssignment(id, currentUser)));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('FACULTY')")
    @Operation(summary = "Create a new assignment (Faculty)")
    public ResponseEntity<?> create(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestPart("data") AssignmentCreateRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(assignmentService.create(currentUser, request, file)));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('FACULTY')")
    @Operation(summary = "Update an assignment (Faculty)")
    public ResponseEntity<?> update(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestPart("data") AssignmentCreateRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.update(id, currentUser, request, file)));
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasRole('FACULTY')")
    @Operation(summary = "Publish a draft assignment (Faculty)")
    public ResponseEntity<?> publish(@PathVariable UUID id, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.publish(id, currentUser)));
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasRole('FACULTY')")
    @Operation(summary = "Close an assignment for submissions (Faculty)")
    public ResponseEntity<?> close(@PathVariable UUID id, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.close(id, currentUser)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('FACULTY')")
    @Operation(summary = "Delete an assignment (Faculty)")
    public ResponseEntity<?> delete(@PathVariable UUID id, @AuthenticationPrincipal User currentUser) {
        assignmentService.delete(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success(null, "Assignment deleted"));
    }
}
