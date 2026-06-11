package com.iicmr.eduportal.service;

import com.iicmr.eduportal.dto.request.NoticeCreateRequest;
import com.iicmr.eduportal.dto.response.NoticeResponse;
import com.iicmr.eduportal.entity.Notice;
import com.iicmr.eduportal.entity.User;
import com.iicmr.eduportal.entity.enums.UserRole;
import com.iicmr.eduportal.exception.ForbiddenException;
import com.iicmr.eduportal.exception.ResourceNotFoundException;
import com.iicmr.eduportal.repository.NoticeRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final FileStorageService fileStorageService;

    /** Public notice feed — non-archived, pinned first */
    @Transactional
    public List<NoticeResponse> getFeed(User currentUser, int page, int size) {
        List<String> audiences = getAudiencesForUser(currentUser);
        Page<Notice> noticePage = noticeRepository
                .findActiveFeedByAudience(audiences, PageRequest.of(page, size));
        return noticePage.getContent().stream().map(this::toResponse).toList();
    }

    /** All notices by a specific faculty/admin */
    @Transactional
    public List<NoticeResponse> getMy(User user) {
        return noticeRepository.findByCreatedByIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public NoticeResponse getById(UUID id) {
        return toResponse(findById(id));
    }

    @Transactional
    public NoticeResponse create(User author, NoticeCreateRequest request, MultipartFile file) throws IOException {
        Notice notice = Notice.builder()
                .createdBy(author)
                .title(request.getTitle())
                .content(request.getContent())
                .category(normalizeOrDefault(request.getCategory(), "general"))
                .targetAudience(normalizeOrDefault(request.getTargetAudience(), "all"))
                .isPinned(request.getIsPinned() != null ? request.getIsPinned() : false)
                .build();

        if (file != null && !file.isEmpty()) {
            String fileUrl = fileStorageService.store(file, "notices", 10 * 1024 * 1024);
            notice.setFileUrl(fileUrl);
            notice.setFileName(file.getOriginalFilename());
        }

        return toResponse(noticeRepository.save(notice));
    }

    @Transactional
    public NoticeResponse update(UUID id, User user, NoticeCreateRequest request) {
        Notice notice = findById(id);
        if (!notice.getCreatedBy().getId().equals(user.getId())) {
            throw new ForbiddenException("You cannot edit this notice");
        }
        notice.setTitle(request.getTitle());
        notice.setContent(request.getContent());
        if (request.getCategory() != null) notice.setCategory(normalizeOrDefault(request.getCategory(), notice.getCategory()));
        if (request.getTargetAudience() != null) notice.setTargetAudience(normalizeOrDefault(request.getTargetAudience(), notice.getTargetAudience()));
        if (request.getIsPinned() != null) notice.setIsPinned(request.getIsPinned());
        return toResponse(noticeRepository.save(notice));
    }

    @Transactional
    public NoticeResponse pin(UUID id, User user) {
        Notice notice = findById(id);
        notice.setIsPinned(!notice.getIsPinned());
        return toResponse(noticeRepository.save(notice));
    }

    @Transactional
    public NoticeResponse archive(UUID id, User user) {
        Notice notice = findById(id);
        notice.setIsArchived(true);
        return toResponse(noticeRepository.save(notice));
    }

    @Transactional
    public void delete(UUID id, User user) {
        Notice notice = findById(id);
        if (!notice.getCreatedBy().getId().equals(user.getId())) {
            throw new ForbiddenException("You cannot delete this notice");
        }
        if (notice.getFileUrl() != null) fileStorageService.delete(notice.getFileUrl());
        noticeRepository.delete(notice);
    }

    private Notice findById(UUID id) {
        return noticeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notice not found: " + id));
    }

    public NoticeResponse toResponse(Notice n) {
        return NoticeResponse.builder()
                .id(n.getId())
                .createdById(n.getCreatedBy().getId())
                .createdByName(n.getCreatedBy().getFullName())
                .title(n.getTitle())
                .content(n.getContent())
                .category(n.getCategory())
                .targetAudience(n.getTargetAudience())
                .fileUrl(n.getFileUrl())
                .fileName(n.getFileName())
                .isPinned(n.getIsPinned())
                .isArchived(n.getIsArchived())
                .createdAt(n.getCreatedAt())
                .updatedAt(n.getUpdatedAt())
                .build();
    }

    private List<String> getAudiencesForUser(User currentUser) {
        if (currentUser == null || currentUser.getRole() == null) {
            return List.of("all");
        }
        UserRole role = currentUser.getRole();
        return switch (role) {
            case STUDENT -> List.of("all", "students", "student");
            case FACULTY -> List.of("all", "faculty");
            case ADMIN -> List.of("all", "students", "student", "faculty");
        };
    }

    private String normalizeOrDefault(String value, String defaultValue) {
        if (value == null || value.isBlank()) return defaultValue;
        return value.trim().toLowerCase();
    }
}
