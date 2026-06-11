package com.iicmr.eduportal.controller;

import com.iicmr.eduportal.dto.request.CourseRequest;
import com.iicmr.eduportal.dto.response.ApiResponse;
import com.iicmr.eduportal.service.CourseService;
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
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
@Tag(name = "Courses", description = "Course management endpoints")
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    @Operation(summary = "Get all courses")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(ApiResponse.success(courseService.getAll()));
    }

    @GetMapping("/active")
    @Operation(summary = "Get all active courses")
    public ResponseEntity<?> getActive() {
        return ResponseEntity.ok(ApiResponse.success(courseService.getActive()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get course by ID")
    public ResponseEntity<?> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(courseService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new course (Admin only)")
    public ResponseEntity<?> create(@Valid @RequestBody CourseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(courseService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a course (Admin only)")
    public ResponseEntity<?> update(@PathVariable UUID id, @Valid @RequestBody CourseRequest request) {
        return ResponseEntity.ok(ApiResponse.success(courseService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate course on first delete, permanently remove on second delete (Admin only)")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        String message = courseService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, message));
    }
}
