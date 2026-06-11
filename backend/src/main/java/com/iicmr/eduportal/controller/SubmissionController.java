package com.iicmr.eduportal.controller;

import com.iicmr.eduportal.dto.request.GradeRequest;
import com.iicmr.eduportal.dto.response.ApiResponse;
import com.iicmr.eduportal.entity.User;
import com.iicmr.eduportal.service.SubmissionService;
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
@RequestMapping("/api/v1/submissions")
@RequiredArgsConstructor
@Tag(name = "Submissions", description = "Assignment submission endpoints")
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping(value = "/assignments/{assignmentId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Submit or re-submit an assignment (Student)")
    public ResponseEntity<?> submit(
            @PathVariable UUID assignmentId,
            @AuthenticationPrincipal User currentUser,
            @RequestPart("file") MultipartFile file) throws IOException {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(submissionService.submit(assignmentId, currentUser, file),
                        "Assignment submitted successfully"));
    }

    @GetMapping("/assignments/{assignmentId}")
    @PreAuthorize("hasRole('FACULTY')")
    @Operation(summary = "List all submissions for an assignment (Faculty)")
    public ResponseEntity<?> getByAssignment(
            @PathVariable UUID assignmentId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(
                submissionService.getByAssignment(assignmentId, currentUser)));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get my submissions (Student)")
    public ResponseEntity<?> getMySubmissions(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(submissionService.getMySubmissions(currentUser)));
    }

    @GetMapping("/assignments/{assignmentId}/mine")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get student's submission for a specific assignment")
    public ResponseEntity<?> getMySubmission(
            @PathVariable UUID assignmentId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(
                submissionService.getMySubmission(assignmentId, currentUser)));
    }

    @PostMapping("/{submissionId}/grade")
    @PreAuthorize("hasRole('FACULTY')")
    @Operation(summary = "Grade a submission (Faculty)")
    public ResponseEntity<?> grade(
            @PathVariable UUID submissionId,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody GradeRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                submissionService.grade(submissionId, currentUser, request),
                "Submission graded"));
    }
}
