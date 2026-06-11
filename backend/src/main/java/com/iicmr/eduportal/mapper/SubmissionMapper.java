package com.iicmr.eduportal.mapper;

import com.iicmr.eduportal.dto.response.SubmissionResponse;
import com.iicmr.eduportal.entity.Submission;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SubmissionMapper {

    @Mapping(target = "assignmentId", source = "assignment.id")
    @Mapping(target = "assignmentTitle", source = "assignment.title")
    @Mapping(target = "studentId", source = "student.id")
    @Mapping(target = "studentName", source = "student.fullName")
    @Mapping(target = "enrollmentNumber", ignore = true)
    @Mapping(target = "totalMarks", source = "assignment.totalMarks")
    @Mapping(target = "status", expression = "java(submission.getStatus().name().toLowerCase())")
    @Mapping(target = "gradedById", source = "gradedBy.id")
    @Mapping(target = "gradedByName", source = "gradedBy.fullName")
    SubmissionResponse toResponse(Submission submission);
}
