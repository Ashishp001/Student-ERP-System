package com.iicmr.eduportal.mapper;

import com.iicmr.eduportal.dto.response.MaterialResponse;
import com.iicmr.eduportal.entity.StudyMaterial;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MaterialMapper {

    @Mapping(target = "facultyId", source = "faculty.id")
    @Mapping(target = "facultyName", source = "faculty.fullName")
    @Mapping(target = "subjectId", source = "subject.id")
    @Mapping(target = "subjectName", source = "subject.name")
    @Mapping(target = "subjectCode", source = "subject.code")
    MaterialResponse toResponse(StudyMaterial material);
}
