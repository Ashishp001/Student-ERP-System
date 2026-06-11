package com.iicmr.eduportal.controller;

import com.iicmr.eduportal.dto.request.NoticeCreateRequest;
import com.iicmr.eduportal.dto.response.ApiResponse;
import com.iicmr.eduportal.entity.User;
import com.iicmr.eduportal.service.NoticeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@RequestMapping("/api/v1/notices")
@RequiredArgsConstructor
@Tag(name = "Notices", description = "Notice board endpoints")
public class NoticeController {

    private final NoticeService noticeService;

    /** Public notice feed — all authenticated users */
    @GetMapping
    @Operation(summary = "Get notice feed (paginated, pinned first)")
    public ResponseEntity<?> getFeed(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(noticeService.getFeed(currentUser, page, size)));
    }

    /** My notices (Faculty/Admin) */
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    @Operation(summary = "Get notices created by me")
    public ResponseEntity<?> getMy(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(noticeService.getMy(currentUser)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a notice by ID")
    public ResponseEntity<?> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(noticeService.getById(id)));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    @Operation(summary = "Create a notice (Faculty/Admin)")
    public ResponseEntity<?> create(
            @AuthenticationPrincipal User currentUser,
            @RequestPart("data") NoticeCreateRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(noticeService.create(currentUser, request, file),
                        "Notice created"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    @Operation(summary = "Update a notice (owner only)")
    public ResponseEntity<?> update(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser,
            @RequestBody NoticeCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(noticeService.update(id, currentUser, request)));
    }

    @PostMapping("/{id}/pin")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    @Operation(summary = "Toggle pin status of a notice")
    public ResponseEntity<?> pin(@PathVariable UUID id, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(noticeService.pin(id, currentUser)));
    }

    @PostMapping("/{id}/archive")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    @Operation(summary = "Archive a notice (hides from feed)")
    public ResponseEntity<?> archive(@PathVariable UUID id, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(noticeService.archive(id, currentUser)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    @Operation(summary = "Delete a notice (owner only)")
    public ResponseEntity<?> delete(@PathVariable UUID id, @AuthenticationPrincipal User currentUser) {
        noticeService.delete(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success(null, "Notice deleted"));
    }
}
