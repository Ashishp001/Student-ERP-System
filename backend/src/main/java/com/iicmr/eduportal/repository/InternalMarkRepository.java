package com.iicmr.eduportal.repository;

import com.iicmr.eduportal.entity.InternalMark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InternalMarkRepository extends JpaRepository<InternalMark, UUID> {
    List<InternalMark> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
    List<InternalMark> findBySubjectIdOrderByStudentIdAscComponentAsc(UUID subjectId);
    Optional<InternalMark> findByStudentIdAndSubjectIdAndComponent(UUID studentId, UUID subjectId, String component);
}
