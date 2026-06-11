package com.iicmr.eduportal.service;

import com.iicmr.eduportal.dto.request.*;
import com.iicmr.eduportal.dto.response.*;
import com.iicmr.eduportal.entity.*;
import com.iicmr.eduportal.entity.enums.*;
import com.iicmr.eduportal.exception.BadRequestException;
import com.iicmr.eduportal.exception.ResourceNotFoundException;
import com.iicmr.eduportal.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HostelService {

    private final HostelRepository hostelRepository;
    private final HostelRoomRepository hostelRoomRepository;
    private final HostelApplicationRepository hostelApplicationRepository;
    private final HostelAllocationRepository hostelAllocationRepository;
    private final HostelComplaintRepository hostelComplaintRepository;
    private final UserRepository userRepository;

    @Transactional
    public HostelResponse createHostel(HostelCreateRequest request) {
        Hostel hostel = Hostel.builder()
                .name(request.getName().trim())
                .type(parseHostelType(request.getType()))
                .address(request.getAddress())
                .wardenName(request.getWardenName())
                .wardenPhone(request.getWardenPhone())
                .totalRooms(Math.max(request.getTotalRooms(), 0))
                .floors(Math.max(request.getFloors(), 1))
                .build();
        return toHostelResponse(hostelRepository.save(hostel));
    }

    @Transactional
    public List<HostelResponse> getHostels() {
        return hostelRepository.findAll().stream().map(this::toHostelResponse).toList();
    }

    @Transactional
    public HostelResponse updateHostelName(UUID hostelId, String name) {
        Hostel hostel = findHostel(hostelId);
        hostel.setName(name.trim());
        return toHostelResponse(hostelRepository.save(hostel));
    }

    @Transactional
    public List<HostelResponse> getActiveHostels() {
        return hostelRepository.findByIsActiveTrueOrderByNameAsc().stream().map(this::toHostelResponse).toList();
    }

    @Transactional
    public HostelRoomResponse addRoom(UUID hostelId, HostelRoomCreateRequest request) {
        Hostel hostel = findHostel(hostelId);
        HostelRoom room = HostelRoom.builder()
                .hostel(hostel)
                .roomNumber(request.getRoomNumber().trim())
                .floorNo(request.getFloorNo())
                .capacity(request.getCapacity())
                .occupiedCount(0)
                .build();
        HostelRoom saved = hostelRoomRepository.save(room);
        return toRoomResponse(saved);
    }

    @Transactional
    public List<HostelRoomResponse> getRooms(UUID hostelId) {
        return hostelRoomRepository.findByHostelIdOrderByRoomNumberAsc(hostelId)
                .stream()
                .map(this::toRoomResponse)
                .toList();
    }

    @Transactional
    public HostelApplicationResponse applyForHostel(User student, HostelApplicationCreateRequest request) {
        validateStudentRole(student);
        hostelAllocationRepository.findByStudentIdAndStatus(student.getId(), HostelAllocationStatus.ACTIVE)
                .ifPresent(a -> {
                    throw new BadRequestException("You already have an active hostel allocation");
                });
        hostelApplicationRepository.findFirstByStudentIdAndStatusOrderByCreatedAtDesc(student.getId(), HostelApplicationStatus.PENDING)
                .ifPresent(a -> {
                    throw new BadRequestException("You already have a pending hostel application");
                });

        Hostel preferredHostel = null;
        if (request.getPreferredHostelId() != null) {
            preferredHostel = findHostel(request.getPreferredHostelId());
        }

        HostelApplication app = HostelApplication.builder()
                .student(student)
                .preferredHostel(preferredHostel)
                .preferredRoomType(request.getPreferredRoomType())
                .reason(request.getReason().trim())
                .status(HostelApplicationStatus.PENDING)
                .build();
        return toApplicationResponse(hostelApplicationRepository.save(app));
    }

    @Transactional
    public List<HostelApplicationResponse> getMyApplications(User student) {
        validateStudentRole(student);
        return hostelApplicationRepository.findByStudentIdOrderByCreatedAtDesc(student.getId())
                .stream().map(this::toApplicationResponse).toList();
    }

    @Transactional
    public List<HostelApplicationResponse> getApplications(String status) {
        if (status == null || status.isBlank()) {
            return hostelApplicationRepository.findAll().stream()
                    .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                    .map(this::toApplicationResponse).toList();
        }
        HostelApplicationStatus parsed = parseApplicationStatus(status);
        return hostelApplicationRepository.findByStatusOrderByCreatedAtDesc(parsed)
                .stream().map(this::toApplicationResponse).toList();
    }

    @Transactional
    public HostelApplicationResponse reviewApplication(UUID id, HostelApplicationReviewRequest request, User admin) {
        HostelApplication app = findApplication(id);
        HostelApplicationStatus nextStatus = parseApplicationStatus(request.getStatus());
        if (nextStatus == HostelApplicationStatus.PENDING) {
            throw new BadRequestException("Application cannot be set back to PENDING");
        }
        app.setStatus(nextStatus);
        app.setAdminNote(request.getAdminNote());
        app.setReviewedBy(admin);
        app.setReviewedAt(Instant.now());
        return toApplicationResponse(hostelApplicationRepository.save(app));
    }

    @Transactional
    public HostelAllocationResponse allocateRoom(HostelAllocationCreateRequest request, User admin) {
        User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        validateStudentRole(student);

        HostelApplication latestApplication = hostelApplicationRepository.findFirstByStudentIdOrderByCreatedAtDesc(student.getId())
                .orElseThrow(() -> new BadRequestException("Student has no hostel application"));
        if (latestApplication.getStatus() != HostelApplicationStatus.APPROVED) {
            throw new BadRequestException("Latest hostel application is not approved");
        }

        hostelAllocationRepository.findByStudentIdAndStatus(student.getId(), HostelAllocationStatus.ACTIVE)
                .ifPresent(a -> {
                    throw new BadRequestException("Student already has an active hostel allocation");
                });

        HostelRoom room = hostelRoomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        if (!room.getIsActive()) {
            throw new BadRequestException("Room is inactive");
        }
        if (room.getOccupiedCount() >= room.getCapacity()) {
            throw new BadRequestException("Room is full");
        }

        HostelAllocation allocation = HostelAllocation.builder()
                .student(student)
                .room(room)
                .allocatedBy(admin)
                .startDate(request.getStartDate())
                .academicYear(request.getAcademicYear())
                .status(HostelAllocationStatus.ACTIVE)
                .notes(request.getNotes())
                .build();
        HostelAllocation saved = hostelAllocationRepository.save(allocation);

        room.setOccupiedCount(room.getOccupiedCount() + 1);
        hostelRoomRepository.save(room);

        return toAllocationResponse(saved);
    }

    @Transactional
    public HostelAllocationResponse checkout(UUID allocationId, LocalDate endDate) {
        HostelAllocation allocation = hostelAllocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResourceNotFoundException("Allocation not found"));
        if (allocation.getStatus() != HostelAllocationStatus.ACTIVE) {
            throw new BadRequestException("Only active allocations can be checked out");
        }

        allocation.setStatus(HostelAllocationStatus.CHECKED_OUT);
        allocation.setEndDate(endDate != null ? endDate : LocalDate.now());
        HostelAllocation saved = hostelAllocationRepository.save(allocation);

        HostelRoom room = allocation.getRoom();
        room.setOccupiedCount(Math.max(0, room.getOccupiedCount() - 1));
        hostelRoomRepository.save(room);
        return toAllocationResponse(saved);
    }

    @Transactional
    public HostelAllocationResponse getMyActiveAllocation(User student) {
        validateStudentRole(student);
        return hostelAllocationRepository.findByStudentIdAndStatus(student.getId(), HostelAllocationStatus.ACTIVE)
                .map(this::toAllocationResponse)
                .orElse(null);
    }

    @Transactional
    public List<HostelAllocationResponse> getActiveAllocations() {
        return hostelAllocationRepository.findByStatusOrderByCreatedAtDesc(HostelAllocationStatus.ACTIVE)
                .stream().map(this::toAllocationResponse).toList();
    }

    @Transactional
    public HostelComplaintResponse createComplaint(User student, HostelComplaintCreateRequest request) {
        validateStudentRole(student);
        HostelAllocation allocation = hostelAllocationRepository.findByStudentIdAndStatus(student.getId(), HostelAllocationStatus.ACTIVE)
                .orElseThrow(() -> new BadRequestException("No active hostel allocation found"));

        HostelComplaint complaint = HostelComplaint.builder()
                .student(student)
                .allocation(allocation)
                .category(request.getCategory().trim())
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .status(HostelComplaintStatus.OPEN)
                .build();
        return toComplaintResponse(hostelComplaintRepository.save(complaint));
    }

    @Transactional
    public List<HostelComplaintResponse> getMyComplaints(User student) {
        validateStudentRole(student);
        return hostelComplaintRepository.findByStudentIdOrderByCreatedAtDesc(student.getId())
                .stream().map(this::toComplaintResponse).toList();
    }

    @Transactional
    public List<HostelComplaintResponse> getComplaints(String status) {
        if (status == null || status.isBlank()) {
            return hostelComplaintRepository.findAllByOrderByCreatedAtDesc()
                    .stream().map(this::toComplaintResponse).toList();
        }
        return hostelComplaintRepository.findByStatusOrderByCreatedAtDesc(parseComplaintStatus(status))
                .stream().map(this::toComplaintResponse).toList();
    }

    @Transactional
    public HostelComplaintResponse updateComplaint(UUID complaintId, HostelComplaintUpdateRequest request, User admin) {
        HostelComplaint complaint = hostelComplaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
        HostelComplaintStatus status = parseComplaintStatus(request.getStatus());
        complaint.setStatus(status);
        complaint.setAdminNote(request.getAdminNote());
        if (status == HostelComplaintStatus.RESOLVED || status == HostelComplaintStatus.REJECTED) {
            complaint.setResolvedBy(admin);
            complaint.setResolvedAt(Instant.now());
        }
        return toComplaintResponse(hostelComplaintRepository.save(complaint));
    }

    private Hostel findHostel(UUID id) {
        return hostelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel not found"));
    }

    private HostelApplication findApplication(UUID id) {
        return hostelApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
    }

    private void validateStudentRole(User user) {
        if (user.getRole() != UserRole.STUDENT) {
            throw new BadRequestException("Only students can perform this action");
        }
    }

    private HostelType parseHostelType(String value) {
        try {
            return HostelType.valueOf(value.trim().toUpperCase());
        } catch (Exception e) {
            throw new BadRequestException("Invalid hostel type");
        }
    }

    private HostelApplicationStatus parseApplicationStatus(String value) {
        try {
            return HostelApplicationStatus.valueOf(value.trim().toUpperCase());
        } catch (Exception e) {
            throw new BadRequestException("Invalid application status");
        }
    }

    private HostelComplaintStatus parseComplaintStatus(String value) {
        try {
            return HostelComplaintStatus.valueOf(value.trim().toUpperCase());
        } catch (Exception e) {
            throw new BadRequestException("Invalid complaint status");
        }
    }

    private HostelResponse toHostelResponse(Hostel h) {
        return HostelResponse.builder()
                .id(h.getId())
                .name(h.getName())
                .type(h.getType().name())
                .address(h.getAddress())
                .wardenName(h.getWardenName())
                .wardenPhone(h.getWardenPhone())
                .totalRooms(h.getTotalRooms())
                .floors(h.getFloors())
                .isActive(h.getIsActive())
                .createdAt(h.getCreatedAt())
                .build();
    }

    private HostelRoomResponse toRoomResponse(HostelRoom r) {
        int available = Math.max(0, r.getCapacity() - r.getOccupiedCount());
        return HostelRoomResponse.builder()
                .id(r.getId())
                .hostelId(r.getHostel().getId())
                .hostelName(r.getHostel().getName())
                .roomNumber(r.getRoomNumber())
                .floorNo(r.getFloorNo())
                .capacity(r.getCapacity())
                .occupiedCount(r.getOccupiedCount())
                .availableCount(available)
                .isActive(r.getIsActive())
                .createdAt(r.getCreatedAt())
                .build();
    }

    private HostelApplicationResponse toApplicationResponse(HostelApplication a) {
        return HostelApplicationResponse.builder()
                .id(a.getId())
                .studentId(a.getStudent().getId())
                .studentName(a.getStudent().getFullName())
                .preferredHostelId(a.getPreferredHostel() != null ? a.getPreferredHostel().getId() : null)
                .preferredHostelName(a.getPreferredHostel() != null ? a.getPreferredHostel().getName() : null)
                .preferredRoomType(a.getPreferredRoomType())
                .reason(a.getReason())
                .status(a.getStatus().name())
                .adminNote(a.getAdminNote())
                .reviewedByName(a.getReviewedBy() != null ? a.getReviewedBy().getFullName() : null)
                .reviewedAt(a.getReviewedAt())
                .createdAt(a.getCreatedAt())
                .build();
    }

    private HostelAllocationResponse toAllocationResponse(HostelAllocation a) {
        return HostelAllocationResponse.builder()
                .id(a.getId())
                .studentId(a.getStudent().getId())
                .studentName(a.getStudent().getFullName())
                .roomId(a.getRoom().getId())
                .roomNumber(a.getRoom().getRoomNumber())
                .hostelId(a.getRoom().getHostel().getId())
                .hostelName(a.getRoom().getHostel().getName())
                .hostelAddress(a.getRoom().getHostel().getAddress())
                .wardenName(a.getRoom().getHostel().getWardenName())
                .wardenPhone(a.getRoom().getHostel().getWardenPhone())
                .startDate(a.getStartDate())
                .endDate(a.getEndDate())
                .academicYear(a.getAcademicYear())
                .status(a.getStatus().name())
                .notes(a.getNotes())
                .createdAt(a.getCreatedAt())
                .build();
    }

    private HostelComplaintResponse toComplaintResponse(HostelComplaint c) {
        return HostelComplaintResponse.builder()
                .id(c.getId())
                .studentId(c.getStudent().getId())
                .studentName(c.getStudent().getFullName())
                .allocationId(c.getAllocation() != null ? c.getAllocation().getId() : null)
                .category(c.getCategory())
                .title(c.getTitle())
                .description(c.getDescription())
                .status(c.getStatus().name())
                .adminNote(c.getAdminNote())
                .resolvedByName(c.getResolvedBy() != null ? c.getResolvedBy().getFullName() : null)
                .resolvedAt(c.getResolvedAt())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
