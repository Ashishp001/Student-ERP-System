package com.iicmr.eduportal.service;

import com.iicmr.eduportal.dto.request.SubjectRequest;
import com.iicmr.eduportal.dto.response.SubjectResponse;
import com.iicmr.eduportal.entity.Course;
import com.iicmr.eduportal.entity.Subject;
import com.iicmr.eduportal.entity.User;
import com.iicmr.eduportal.entity.enums.SubjectType;
import com.iicmr.eduportal.exception.BadRequestException;
import com.iicmr.eduportal.exception.ResourceNotFoundException;
import com.iicmr.eduportal.repository.CourseRepository;
import com.iicmr.eduportal.repository.SubjectRepository;
import com.iicmr.eduportal.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Transactional
    public List<SubjectResponse> getAll() {
        return subjectRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<SubjectResponse> getByCourseId(UUID courseId) {
        return subjectRepository.findByCourseIdAndIsActiveTrueOrderByNameAsc(courseId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<SubjectResponse> getByFaculty(UUID facultyId) {
        return subjectRepository.findByFacultyIdAndIsActiveTrueOrderByNameAsc(facultyId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public SubjectResponse getById(UUID id) {
        return toResponse(findById(id));
    }

    @Transactional
    public SubjectResponse create(SubjectRequest request) {
        if (subjectRepository.existsByCode(request.getCode())) {
            throw new BadRequestException("Subject code already exists: " + request.getCode());
        }
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + request.getCourseId()));

        User faculty = null;
        if (request.getFacultyId() != null) {
            faculty = userRepository.findById(request.getFacultyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Faculty not found: " + request.getFacultyId()));
        }

        SubjectType subjectType = SubjectType.CORE;
        try {
            if (request.getType() != null) {
                subjectType = SubjectType.valueOf(request.getType().toUpperCase());
            }
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid subject type: " + request.getType());
        }

        Subject subject = Subject.builder()
                .course(course)
                .faculty(faculty)
                .name(request.getName())
                .code(request.getCode().toUpperCase())
                .semester(request.getSemester())
                .credits(request.getCredits())
                .type(subjectType)
                .maxInternalMarks(request.getMaxInternalMarks() != null ? request.getMaxInternalMarks() : 40.0)
                .maxExternalMarks(request.getMaxExternalMarks() != null ? request.getMaxExternalMarks() : 60.0)
                .build();
        return toResponse(subjectRepository.save(subject));
    }

    @Transactional
    public SubjectResponse update(UUID id, SubjectRequest request) {
        Subject subject = findById(id);
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        subject.setCourse(course);
        subject.setName(request.getName());
        subject.setSemester(request.getSemester());
        subject.setCredits(request.getCredits());

        if (request.getFacultyId() != null) {
            User faculty = userRepository.findById(request.getFacultyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));
            subject.setFaculty(faculty);
        } else {
            subject.setFaculty(null);
        }

        if (request.getMaxInternalMarks() != null) subject.setMaxInternalMarks(request.getMaxInternalMarks());
        if (request.getMaxExternalMarks() != null) subject.setMaxExternalMarks(request.getMaxExternalMarks());

        return toResponse(subjectRepository.save(subject));
    }

    @Transactional
    public void delete(UUID id) {
        Subject subject = findById(id);
        subject.setIsActive(false);
        subjectRepository.save(subject);
    }

    private Subject findById(UUID id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found: " + id));
    }

    public SubjectResponse toResponse(Subject s) {
        return SubjectResponse.builder()
                .id(s.getId())
                .courseId(s.getCourse().getId())
                .courseName(s.getCourse().getName())
                .courseCode(s.getCourse().getCode())
                .facultyId(s.getFaculty() != null ? s.getFaculty().getId() : null)
                .facultyName(s.getFaculty() != null ? s.getFaculty().getFullName() : null)
                .name(s.getName())
                .code(s.getCode())
                .semester(s.getSemester())
                .credits(s.getCredits())
                .type(s.getType().name().toLowerCase())
                .maxInternalMarks(s.getMaxInternalMarks())
                .maxExternalMarks(s.getMaxExternalMarks())
                .isActive(s.getIsActive())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
