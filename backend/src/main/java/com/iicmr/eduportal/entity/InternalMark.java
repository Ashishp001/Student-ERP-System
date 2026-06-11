package com.iicmr.eduportal.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "internal_marks",
       uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "subject_id", "component"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InternalMark {

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

    /** e.g. "Assignment 1", "Mid-Sem", "Viva" */
    @Column(nullable = false, length = 100)
    private String component;

    @Column(nullable = false)
    private Double maxMarks;

    private Double obtainedMarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entered_by")
    private User enteredBy;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isLocked = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;
}
