package com.iicmr.eduportal.repository;

import com.iicmr.eduportal.entity.HostelApplication;
import com.iicmr.eduportal.entity.enums.HostelApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HostelApplicationRepository extends JpaRepository<HostelApplication, UUID> {
    List<HostelApplication> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
    List<HostelApplication> findByStatusOrderByCreatedAtDesc(HostelApplicationStatus status);
    Optional<HostelApplication> findFirstByStudentIdAndStatusOrderByCreatedAtDesc(UUID studentId, HostelApplicationStatus status);
    Optional<HostelApplication> findFirstByStudentIdOrderByCreatedAtDesc(UUID studentId);
}
