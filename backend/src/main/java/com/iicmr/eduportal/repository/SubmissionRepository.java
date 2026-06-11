package com.iicmr.eduportal.repository;

import com.iicmr.eduportal.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubmissionRepository extends JpaRepository<Submission, UUID> {

    Optional<Submission> findByAssignmentIdAndStudentId(UUID assignmentId, UUID studentId);

    List<Submission> findByAssignmentIdOrderBySubmittedAtDesc(UUID assignmentId);

    List<Submission> findByStudentIdOrderBySubmittedAtDesc(UUID studentId);

    long countByAssignmentId(UUID assignmentId);

    long countByAssignmentIdAndObtainedMarksIsNotNull(UUID assignmentId);

    @Query("SELECT AVG(s.obtainedMarks) FROM Submission s WHERE s.assignment.id = :assignmentId AND s.obtainedMarks IS NOT NULL")
    Double findAverageMarksByAssignmentId(@Param("assignmentId") UUID assignmentId);
}
