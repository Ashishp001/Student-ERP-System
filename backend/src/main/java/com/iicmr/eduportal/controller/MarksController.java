package com.iicmr.eduportal.controller;

import com.iicmr.eduportal.dto.request.BulkMarkRequest;
import com.iicmr.eduportal.dto.request.MarkEntryRequest;
import com.iicmr.eduportal.dto.response.ApiResponse;
import com.iicmr.eduportal.entity.User;
import com.iicmr.eduportal.service.MarksService;
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
@RequestMapping("/api/v1/marks")
@RequiredArgsConstructor
@Tag(name = "Internal Marks")
public class MarksController {

    private final MarksService marksService;

    @PostMapping
    @PreAuthorize("hasRole('FACULTY')")
    @Operation(summary = "Enter or update a single mark (Faculty)")
    public ResponseEntity<?> enter(@AuthenticationPrincipal User user,
                                   @Valid @RequestBody MarkEntryRequest req) {
        return ResponseEntity.ok(ApiResponse.success(marksService.enter(user, req), "Mark saved"));
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasRole('FACULTY')")
    @Operation(summary = "Bulk mark entry for a component (Faculty)")
    public ResponseEntity<?> enterBulk(@AuthenticationPrincipal User user,
                                       @Valid @RequestBody BulkMarkRequest req) {
        return ResponseEntity.ok(ApiResponse.success(marksService.enterBulk(user, req), "Marks saved"));
    }

    @PatchMapping("/lock")
    @PreAuthorize("hasRole('FACULTY')")
    @Operation(summary = "Lock a component so marks cannot be changed (Faculty)")
    public ResponseEntity<?> lockComponent(@AuthenticationPrincipal User user,
                                           @RequestParam UUID subjectId,
                                           @RequestParam String component) {
        marksService.lockComponent(user, subjectId, component);
        return ResponseEntity.ok(ApiResponse.success(null, "Component locked"));
    }

    @GetMapping("/subject/{subjectId}")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    @Operation(summary = "Get all marks for a subject (Faculty/Admin)")
    public ResponseEntity<?> getBySubject(@PathVariable UUID subjectId) {
        return ResponseEntity.ok(ApiResponse.success(marksService.getBySubject(subjectId)));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get my internal marks grouped by subject (Student)")
    public ResponseEntity<?> getMyMarks(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(marksService.getMyMarks(user)));
    }
}
