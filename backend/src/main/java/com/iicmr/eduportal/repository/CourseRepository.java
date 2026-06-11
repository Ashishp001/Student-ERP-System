package com.iicmr.eduportal.repository;

import com.iicmr.eduportal.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CourseRepository extends JpaRepository<Course, UUID> {
    List<Course> findByIsActiveTrueOrderByNameAsc();
    boolean existsByCode(String code);
}
