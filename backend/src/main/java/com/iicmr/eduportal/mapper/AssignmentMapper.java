package com.iicmr.eduportal.mapper;

import com.iicmr.eduportal.dto.response.AssignmentResponse;
import com.iicmr.eduportal.entity.Assignment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AssignmentMapper {

    @Mapping(target = "subjectId", source = "subject.id")
    @Mapping(target = "subjectName", source = "subject.name")
    @Mapping(target = "subjectCode", source = "subject.code")
    @Mapping(target = "facultyId", source = "faculty.id")
    @Mapping(target = "facultyName", source = "faculty.fullName")
    @Mapping(target = "status", expression = "java(assignment.getStatus().name().toLowerCase())")
    @Mapping(target = "totalSubmissions", ignore = true)
    @Mapping(target = "gradedSubmissions", ignore = true)
    @Mapping(target = "pendingSubmissions", ignore = true)
    @Mapping(target = "submitted", ignore = true)
    @Mapping(target = "submissionStatus", ignore = true)
    @Mapping(target = "obtainedMarks", ignore = true)
    AssignmentResponse toResponse(Assignment assignment);
}
