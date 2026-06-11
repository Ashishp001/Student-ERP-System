package com.iicmr.eduportal.repository;

import com.iicmr.eduportal.entity.Assignment;
import com.iicmr.eduportal.entity.enums.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface AssignmentRepository extends JpaRepository<Assignment, UUID> {

    List<Assignment> findByFacultyIdOrderByCreatedAtDesc(UUID facultyId);

    List<Assignment> findBySubjectIdAndStatusOrderByDeadlineAsc(UUID subjectId, AssignmentStatus status);

    /** All published assignments for students of a given course+semester */
    @Query("""
           SELECT a FROM Assignment a
           WHERE a.subject.course.id = :courseId
             AND a.subject.semester  = :semester
             AND a.status = :status
           ORDER BY a.deadline ASC
           """)
    List<Assignment> findPublishedForStudents(
            @Param("courseId")  UUID courseId,
            @Param("semester")  Integer semester,
            @Param("status")   AssignmentStatus status);

    long countBySubjectId(UUID subjectId);

    /** All published assignments (fallback when student has no course/semester) */
    List<Assignment> findByStatusOrderByDeadlineAsc(AssignmentStatus status);

    /** Published assignments for a course (any semester) */
    @Query("""
           SELECT a FROM Assignment a
           WHERE a.subject.course.id = :courseId
             AND a.status = :status
           ORDER BY a.deadline ASC
           """)
    List<Assignment> findPublishedForCourse(
            @Param("courseId") UUID courseId,
            @Param("status")  AssignmentStatus status);
}
