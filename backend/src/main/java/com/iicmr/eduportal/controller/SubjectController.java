package com.iicmr.eduportal.controller;

import com.iicmr.eduportal.dto.request.SubjectRequest;
import com.iicmr.eduportal.dto.response.ApiResponse;
import com.iicmr.eduportal.service.SubjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/subjects")
@RequiredArgsConstructor
@Tag(name = "Subjects", description = "Subject management endpoints")
public class SubjectController {

    private final SubjectService subjectService;

    @GetMapping
    @Operation(summary = "Get all subjects")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(ApiResponse.success(subjectService.getAll()));
    }

    @GetMapping("/course/{courseId}")
    @Operation(summary = "Get subjects by course")
    public ResponseEntity<?> getByCourse(@PathVariable UUID courseId) {
        return ResponseEntity.ok(ApiResponse.success(subjectService.getByCourseId(courseId)));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('FACULTY')")
    @Operation(summary = "Get subjects assigned to me (Faculty)")
    public ResponseEntity<?> getMy(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.iicmr.eduportal.entity.User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(subjectService.getByFaculty(currentUser.getId())));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get subject by ID")
    public ResponseEntity<?> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(subjectService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new subject (Admin only)")
    public ResponseEntity<?> create(@Valid @RequestBody SubjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(subjectService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a subject (Admin only)")
    public ResponseEntity<?> update(@PathVariable UUID id, @Valid @RequestBody SubjectRequest request) {
        return ResponseEntity.ok(ApiResponse.success(subjectService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate a subject (Admin only)")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        subjectService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Subject deactivated"));
    }
}
