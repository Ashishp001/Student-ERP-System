package com.iicmr.eduportal.service;

import com.iicmr.eduportal.dto.request.CourseRequest;
import com.iicmr.eduportal.dto.response.CourseResponse;
import com.iicmr.eduportal.entity.Course;
import com.iicmr.eduportal.exception.BadRequestException;
import com.iicmr.eduportal.exception.ResourceNotFoundException;
import com.iicmr.eduportal.repository.CourseRepository;
import com.iicmr.eduportal.repository.StudentProfileRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final StudentProfileRepository studentProfileRepository;

    public List<CourseResponse> getAll() {
        return courseRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public List<CourseResponse> getActive() {
        return courseRepository.findAll().stream()
                .filter(Course::getIsActive)
                .map(this::toResponse)
                .toList();
    }

    public CourseResponse getById(UUID id) {
        return toResponse(findById(id));
    }

    @Transactional
    public CourseResponse create(CourseRequest request) {
        if (courseRepository.existsByCode(request.getCode())) {
            throw new BadRequestException("Course code already exists: " + request.getCode());
        }
        Course course = Course.builder()
                .name(request.getName())
                .code(request.getCode().toUpperCase())
                .totalSemesters(request.getTotalSemesters())
                .totalCredits(request.getTotalCredits())
                .build();
        return toResponse(courseRepository.save(course));
    }

    @Transactional
    public CourseResponse update(UUID id, CourseRequest request) {
        Course course = findById(id);
        course.setName(request.getName());
        course.setCode(request.getCode().toUpperCase());
        course.setTotalSemesters(request.getTotalSemesters());
        if (request.getTotalCredits() != null) course.setTotalCredits(request.getTotalCredits());
        return toResponse(courseRepository.save(course));
    }

    @Transactional
    public String delete(UUID id) {
        Course course = findById(id);

        // First delete action: soft-delete (deactivate)
        if (Boolean.TRUE.equals(course.getIsActive())) {
            course.setIsActive(false);
            courseRepository.save(course);
            return "Course deactivated";
        }

        // Second delete action: permanent delete
        long linkedStudents = studentProfileRepository.countByCourseId(id);
        if (linkedStudents > 0) {
            throw new BadRequestException("Cannot permanently delete course because students are linked to it");
        }
        courseRepository.delete(course);
        return "Course permanently deleted";
    }

    private Course findById(UUID id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + id));
    }

    public CourseResponse toResponse(Course c) {
        return CourseResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .code(c.getCode())
                .totalSemesters(c.getTotalSemesters())
                .totalCredits(c.getTotalCredits())
                .isActive(c.getIsActive())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
