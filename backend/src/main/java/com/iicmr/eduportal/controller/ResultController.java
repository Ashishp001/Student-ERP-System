package com.iicmr.eduportal.controller;

import com.iicmr.eduportal.dto.request.ResultEntryRequest;
import com.iicmr.eduportal.dto.response.ApiResponse;
import com.iicmr.eduportal.entity.User;
import com.iicmr.eduportal.service.ResultService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/results")
@RequiredArgsConstructor
@Tag(name = "Exam Results")
public class ResultController {

    private final ResultService resultService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Enter single exam result (Admin)")
    public ResponseEntity<?> enter(@AuthenticationPrincipal User admin,
                                   @Valid @RequestBody ResultEntryRequest req) {
        return ResponseEntity.ok(ApiResponse.success(resultService.enter(admin, req), "Result saved"));
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bulk result entry (Admin)")
    public ResponseEntity<?> enterBulk(@AuthenticationPrincipal User admin,
                                       @Valid @RequestBody List<ResultEntryRequest> reqs) {
        return ResponseEntity.ok(ApiResponse.success(resultService.enterBulk(admin, reqs), "Results saved"));
    }

    @PatchMapping("/publish")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Publish results for subject + examType + academicYear (Admin)")
    public ResponseEntity<?> publish(@RequestParam UUID subjectId,
                                     @RequestParam String examType,
                                     @RequestParam String academicYear) {
        int count = resultService.publish(subjectId, examType, academicYear);
        return ResponseEntity.ok(ApiResponse.success(count, count + " results published"));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get my exam results grouped by semester (Student)")
    public ResponseEntity<?> getMyResults(@AuthenticationPrincipal User student) {
        return ResponseEntity.ok(ApiResponse.success(resultService.getMyResults(student)));
    }

    @GetMapping("/my/gpa")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get my SGPA per semester and CGPA (Student)")
    public ResponseEntity<?> getGpa(@AuthenticationPrincipal User student) {
        return ResponseEntity.ok(ApiResponse.success(resultService.getGpa(student)));
    }

    @GetMapping("/subject/{subjectId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @Operation(summary = "Get all results for a subject (Admin/Faculty)")
    public ResponseEntity<?> getBySubject(@PathVariable UUID subjectId) {
        return ResponseEntity.ok(ApiResponse.success(resultService.getBySubject(subjectId)));
    }
}
