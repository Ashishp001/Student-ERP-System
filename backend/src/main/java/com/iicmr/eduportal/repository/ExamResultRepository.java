package com.iicmr.eduportal.repository;

import com.iicmr.eduportal.entity.ExamResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExamResultRepository extends JpaRepository<ExamResult, UUID> {

    List<ExamResult> findByStudentIdOrderBySemesterAsc(UUID studentId);

    List<ExamResult> findByStudentIdAndSemesterAndIsPublishedTrue(UUID studentId, Integer semester);

    List<ExamResult> findBySubjectIdOrderByStudentIdAsc(UUID subjectId);

    Optional<ExamResult> findByStudentIdAndSubjectIdAndExamTypeAndAcademicYear(
            UUID studentId, UUID subjectId, String examType, String academicYear);

    @Query("""
           SELECT r FROM ExamResult r
           WHERE r.student.id = :studentId AND r.semester = :semester AND r.isPublished = true
           """)
    List<ExamResult> findPublishedResultsForSemester(
            @Param("studentId") UUID studentId,
            @Param("semester")  Integer semester);
}
