package com.iicmr.eduportal.repository;

import com.iicmr.eduportal.entity.HostelComplaint;
import com.iicmr.eduportal.entity.enums.HostelComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HostelComplaintRepository extends JpaRepository<HostelComplaint, UUID> {
    List<HostelComplaint> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
    List<HostelComplaint> findByStatusOrderByCreatedAtDesc(HostelComplaintStatus status);
    List<HostelComplaint> findAllByOrderByCreatedAtDesc();
}
