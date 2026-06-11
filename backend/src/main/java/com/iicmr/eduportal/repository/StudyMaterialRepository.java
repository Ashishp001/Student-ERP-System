package com.iicmr.eduportal.repository;

import com.iicmr.eduportal.entity.StudyMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StudyMaterialRepository extends JpaRepository<StudyMaterial, UUID> {
    List<StudyMaterial> findBySubjectIdOrderByCreatedAtDesc(UUID subjectId);
    List<StudyMaterial> findByFacultyIdOrderByCreatedAtDesc(UUID facultyId);
}
