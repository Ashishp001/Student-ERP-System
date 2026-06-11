package com.iicmr.eduportal.repository;

import com.iicmr.eduportal.entity.FacultyProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FacultyProfileRepository extends JpaRepository<FacultyProfile, UUID> {
    Optional<FacultyProfile> findByUserId(UUID userId);
}
