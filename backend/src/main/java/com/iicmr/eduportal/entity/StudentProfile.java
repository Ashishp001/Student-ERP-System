package com.iicmr.eduportal.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "student_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    /** Optional FK to courses — added in V3 migration */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(name = "enrollment_number", unique = true, length = 50)
    private String enrollmentNumber;

    @Column(name = "current_semester")
    @Builder.Default
    private Integer currentSemester = 1;

    @Column(name = "academic_year", length = 20)
    private String academicYear;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "guardian_name", length = 255)
    private String guardianName;

    @Column(name = "guardian_phone", length = 20)
    private String guardianPhone;
}
