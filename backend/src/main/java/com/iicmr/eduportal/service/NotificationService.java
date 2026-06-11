package com.iicmr.eduportal.service;

import com.iicmr.eduportal.dto.response.NotificationResponse;
import com.iicmr.eduportal.entity.Notification;
import com.iicmr.eduportal.entity.User;
import com.iicmr.eduportal.exception.ForbiddenException;
import com.iicmr.eduportal.exception.ResourceNotFoundException;
import com.iicmr.eduportal.repository.NotificationRepository;
import com.iicmr.eduportal.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notifRepo;
    private final UserRepository userRepo;

    /** Internal helper: create a notification for a user */
    @Transactional
    public void create(UUID recipientId, String title, String message, String type, String link) {
        userRepo.findById(recipientId).ifPresent(user -> {
            Notification n = Notification.builder()
                    .user(user)
                    .title(title)
                    .message(message)
                    .type(type)
                    .link(link)
                    .isRead(false)
                    .build();
            notifRepo.save(n);
        });
    }

    /** Get paginated notifications for the current user */
    public Page<NotificationResponse> getForUser(UUID userId, int page, int size) {
        PageRequest pr = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return notifRepo.findByUserIdOrderByCreatedAtDesc(userId, pr).map(this::toResponse);
    }

    /** Unread count — used by NotificationBell polling */
    public long getUnreadCount(UUID userId) {
        return notifRepo.countByUserIdAndIsReadFalse(userId);
    }

    /** Mark a single notification as read */
    @Transactional
    public void markRead(UUID id, UUID userId) {
        Notification n = notifRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!n.getUser().getId().equals(userId))
            throw new ForbiddenException("Not your notification");
        n.setIsRead(true);
        notifRepo.save(n);
    }

    /** Mark all notifications as read for a user */
    @Transactional
    public void markAllRead(UUID userId) {
        notifRepo.markAllReadForUser(userId);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .link(n.getLink())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
