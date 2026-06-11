package com.iicmr.eduportal.repository;

import com.iicmr.eduportal.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface SubjectRepository extends JpaRepository<Subject, UUID> {

    List<Subject> findByCourseIdAndIsActiveTrueOrderByNameAsc(UUID courseId);

    List<Subject> findByCourseIdAndSemesterAndIsActiveTrueOrderByNameAsc(UUID courseId, Integer semester);

    List<Subject> findByFacultyIdAndIsActiveTrueOrderByNameAsc(UUID facultyId);

    /** Returns all subjects (incl. inactive) for a faculty — used by analytics */
    List<Subject> findByFacultyId(UUID facultyId);

    boolean existsByCode(String code);

    @Query("SELECT s FROM Subject s WHERE s.course.id = :courseId AND s.semester = :semester AND s.isActive = true")
    List<Subject> findActiveByCourseAndSemester(@Param("courseId") UUID courseId, @Param("semester") Integer semester);
}
