package com.iicmr.eduportal.repository;

import com.iicmr.eduportal.entity.Grievance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GrievanceRepository extends JpaRepository<Grievance, UUID> {
    List<Grievance> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
    Page<Grievance> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    Page<Grievance> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
