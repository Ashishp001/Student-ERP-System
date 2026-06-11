package com.iicmr.eduportal.controller;

import com.iicmr.eduportal.dto.request.MaterialCreateRequest;
import com.iicmr.eduportal.dto.response.ApiResponse;
import com.iicmr.eduportal.entity.User;
import com.iicmr.eduportal.service.MaterialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/materials")
@RequiredArgsConstructor
@Tag(name = "Study Materials")
public class MaterialController {

    private final MaterialService materialService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('FACULTY')")
    @Operation(summary = "Upload a study material (Faculty)")
    public ResponseEntity<?> upload(@AuthenticationPrincipal User user,
                                    @RequestPart("data") MaterialCreateRequest req,
                                    @RequestPart("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(ApiResponse.success(materialService.upload(user, req, file), "Material uploaded"));
    }

    @GetMapping
    @Operation(summary = "Get all materials (optionally filter by subjectId)")
    public ResponseEntity<?> getAll(@RequestParam(required = false) UUID subjectId) {
        if (subjectId != null)
            return ResponseEntity.ok(ApiResponse.success(materialService.getBySubject(subjectId)));
        return ResponseEntity.ok(ApiResponse.success(materialService.getAll()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('FACULTY')")
    @Operation(summary = "Get my uploaded materials (Faculty)")
    public ResponseEntity<?> getMy(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(materialService.getMy(user)));
    }

    @PostMapping("/{id}/download")
    @Operation(summary = "Increment download counter")
    public ResponseEntity<?> download(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(materialService.incrementDownload(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    @Operation(summary = "Delete a material (owner or Admin)")
    public ResponseEntity<?> delete(@AuthenticationPrincipal User user, @PathVariable UUID id) {
        materialService.delete(id, user);
        return ResponseEntity.ok(ApiResponse.success(null, "Material deleted"));
    }
}
