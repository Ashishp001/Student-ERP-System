package com.iicmr.eduportal.mapper;

import com.iicmr.eduportal.dto.response.GrievanceResponse;
import com.iicmr.eduportal.entity.Grievance;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface GrievanceMapper {

    @Mapping(target = "studentId", source = "student.id")
    @Mapping(target = "studentName", source = "student.fullName")
    @Mapping(target = "status", expression = "java(grievance.getStatus().toLowerCase())")
    @Mapping(target = "assignedTo", source = "assignedTo.id")
    @Mapping(target = "assignedToName", source = "assignedTo.fullName")
    GrievanceResponse toResponse(Grievance grievance);
}
