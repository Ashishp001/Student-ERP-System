package com.iicmr.eduportal.repository;

import com.iicmr.eduportal.entity.HostelAllocation;
import com.iicmr.eduportal.entity.enums.HostelAllocationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HostelAllocationRepository extends JpaRepository<HostelAllocation, UUID> {
    Optional<HostelAllocation> findByStudentIdAndStatus(UUID studentId, HostelAllocationStatus status);
    List<HostelAllocation> findByStatusOrderByCreatedAtDesc(HostelAllocationStatus status);
}
