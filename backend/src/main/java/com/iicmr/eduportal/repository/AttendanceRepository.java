package com.iicmr.eduportal.repository;

import com.iicmr.eduportal.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AttendanceRepository extends JpaRepository<Attendance, UUID> {

    Optional<Attendance> findBySubjectIdAndDate(UUID subjectId, LocalDate date);

    List<Attendance> findBySubjectIdOrderByDateDesc(UUID subjectId);

    long countBySubjectId(UUID subjectId);

    /** Total sessions for a subject within a date range */
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.subject.id = :subjectId AND a.date BETWEEN :from AND :to")
    long countSessionsBetween(
            @Param("subjectId") UUID subjectId,
            @Param("from")      LocalDate from,
            @Param("to")        LocalDate to);
}
