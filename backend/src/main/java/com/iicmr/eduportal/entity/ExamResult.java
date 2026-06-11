package com.iicmr.eduportal.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "exam_results",
       uniqueConstraints = @UniqueConstraint(
               columnNames = {"student_id", "subject_id", "exam_type", "academic_year"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamResult {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    /** "mid_sem", "end_sem", "supplementary" */
    @Column(nullable = false, length = 50)
    private String examType;

    @Column(nullable = false)
    private Double maxMarks;

    private Double obtainedMarks;

    /** "O", "A+", "A", "B+", "B", "C", "F" */
    @Column(length = 5)
    private String grade;

    private Double gradePoints;

    @Column(nullable = false)
    private Integer semester;

    @Column(nullable = false, length = 20)
    private String academicYear;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isPublished = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entered_by")
    private User enteredBy;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
