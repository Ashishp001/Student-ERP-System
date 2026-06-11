package com.iicmr.eduportal.service;

import com.iicmr.eduportal.dto.request.GrievanceCreateRequest;
import com.iicmr.eduportal.entity.Grievance;
import com.iicmr.eduportal.entity.User;
import com.iicmr.eduportal.entity.enums.UserRole;
import com.iicmr.eduportal.exception.ForbiddenException;
import com.iicmr.eduportal.exception.ResourceNotFoundException;
import com.iicmr.eduportal.repository.GrievanceRepository;
import com.iicmr.eduportal.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class GrievanceService {

    private final GrievanceRepository grievanceRepo;
    private final UserRepository       userRepo;
    private final NotificationService  notificationService;

    /** Student files a grievance */
    @Transactional
    public Map<String, Object> file(User student, GrievanceCreateRequest req) {
        Grievance g = Grievance.builder()
                .student(Boolean.TRUE.equals(req.getIsAnonymous()) ? null : student)
                .category(req.getCategory())
                .subject(req.getSubject())
                .description(req.getDescription())
                .isAnonymous(req.getIsAnonymous() != null && req.getIsAnonymous())
                .priority(req.getPriority() != null ? req.getPriority() : "medium")
                .status("OPEN")
                .build();

        Grievance saved = grievanceRepo.save(g);

        // Notify all admins
        userRepo.findAll().stream()
                .filter(u -> u.getRole() == UserRole.ADMIN && Boolean.TRUE.equals(u.getIsActive()))
                .forEach(admin -> notificationService.create(
                        admin.getId(),
                        "New Grievance Filed",
                        "Category: " + req.getCategory() + " — " + req.getSubject(),
                        "grievance",
                        "/admin/grievances"
                ));

        return toMap(saved);
    }

    /** Student: view their own grievances */
    public List<Map<String, Object>> getMy(User student) {
        return grievanceRepo.findByStudentIdOrderByCreatedAtDesc(student.getId())
                .stream().map(this::toMap).toList();
    }

    /** Admin: all grievances, with optional status filter, paginated */
    public Page<Map<String, Object>> getAll(String status, int page, int size) {
        PageRequest pr = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Grievance> result = (status != null && !status.isBlank())
                ? grievanceRepo.findByStatusOrderByCreatedAtDesc(status.toUpperCase(), pr)
                : grievanceRepo.findAllByOrderByCreatedAtDesc(pr);
        return result.map(this::toMap);
    }

    /** Detail view — student can only see own, admin sees all */
    public Map<String, Object> getById(UUID id, User user) {
        Grievance g = grievanceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance not found"));
        boolean isAdmin = user.getRole() == UserRole.ADMIN;
        boolean isOwner = g.getStudent() != null && g.getStudent().getId().equals(user.getId());
        if (!isAdmin && !isOwner)
            throw new ForbiddenException("Not authorized to view this grievance");
        return toMap(g);
    }

    /** Admin: assign grievance to a staff member */
    @Transactional
    public Map<String, Object> assign(UUID id, UUID assigneeId) {
        Grievance g = grievanceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance not found"));
        User assignee = userRepo.findById(assigneeId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignee user not found"));
        g.setAssignedTo(assignee);
        g.setStatus("IN_REVIEW");

        // Notify student
        if (g.getStudent() != null) {
            notificationService.create(g.getStudent().getId(),
                    "Grievance Under Review",
                    "Your complaint \"" + g.getSubject() + "\" is now being reviewed.",
                    "grievance", "/student/grievances");
        }
        return toMap(grievanceRepo.save(g));
    }

    /** Admin: resolve grievance with a note */
    @Transactional
    public Map<String, Object> resolve(UUID id, String resolutionNote) {
        Grievance g = grievanceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance not found"));
        g.setStatus("RESOLVED");
        g.setResolutionNote(resolutionNote);
        g.setResolvedAt(Instant.now());

        if (g.getStudent() != null) {
            notificationService.create(g.getStudent().getId(),
                    "Grievance Resolved ✓",
                    "Your complaint \"" + g.getSubject() + "\" has been resolved.",
                    "grievance", "/student/grievances");
        }
        return toMap(grievanceRepo.save(g));
    }

    /** Admin: reject grievance with a reason */
    @Transactional
    public Map<String, Object> reject(UUID id, String reason) {
        Grievance g = grievanceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance not found"));
        g.setStatus("REJECTED");
        g.setResolutionNote(reason);
        g.setResolvedAt(Instant.now());

        if (g.getStudent() != null) {
            notificationService.create(g.getStudent().getId(),
                    "Grievance Rejected",
                    "Your complaint \"" + g.getSubject() + "\" has been closed.",
                    "grievance", "/student/grievances");
        }
        return toMap(grievanceRepo.save(g));
    }

    /** Counts per status — used by admin dashboard */
    public Map<String, Long> getCounts() {
        Map<String, Long> counts = new LinkedHashMap<>();
        counts.put("open",      grievanceRepo.findByStatusOrderByCreatedAtDesc("OPEN",      PageRequest.of(0, 1)).getTotalElements());
        counts.put("in_review", grievanceRepo.findByStatusOrderByCreatedAtDesc("IN_REVIEW", PageRequest.of(0, 1)).getTotalElements());
        counts.put("resolved",  grievanceRepo.findByStatusOrderByCreatedAtDesc("RESOLVED",  PageRequest.of(0, 1)).getTotalElements());
        counts.put("rejected",  grievanceRepo.findByStatusOrderByCreatedAtDesc("REJECTED",  PageRequest.of(0, 1)).getTotalElements());
        counts.put("total",     grievanceRepo.count());
        return counts;
    }

    private Map<String, Object> toMap(Grievance g) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",             g.getId());
        m.put("studentId",      g.getStudent() != null ? g.getStudent().getId() : null);
        m.put("studentName",    g.getIsAnonymous() ? "Anonymous" : (g.getStudent() != null ? g.getStudent().getFullName() : "—"));
        m.put("category",       g.getCategory());
        m.put("subject",        g.getSubject());
        m.put("description",    g.getDescription());
        m.put("status",         g.getStatus());
        m.put("isAnonymous",    g.getIsAnonymous());
        m.put("priority",       g.getPriority());
        m.put("assignedTo",     g.getAssignedTo() != null ? g.getAssignedTo().getFullName() : null);
        m.put("resolutionNote", g.getResolutionNote());
        m.put("createdAt",      g.getCreatedAt());
        m.put("updatedAt",      g.getUpdatedAt());
        m.put("resolvedAt",     g.getResolvedAt());
        return m;
    }
}
