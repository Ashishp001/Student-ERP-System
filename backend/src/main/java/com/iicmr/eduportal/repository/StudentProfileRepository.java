package com.iicmr.eduportal.repository;

import com.iicmr.eduportal.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, UUID> {
    Optional<StudentProfile> findByUserId(UUID userId);
    boolean existsByEnrollmentNumber(String enrollmentNumber);
    long countByCourseId(UUID courseId);
}
