package com.iicmr.eduportal.mapper;

import com.iicmr.eduportal.dto.response.UserResponse;
import com.iicmr.eduportal.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * MapStruct mapper for User entity → UserResponse DTO.
 * Note: Student/Faculty profile fields require manual post-mapping
 * since they come from separate tables (1:1 relationships).
 */
@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "role", expression = "java(user.getRole().name())")
    @Mapping(target = "enrollmentNumber", ignore = true)
    @Mapping(target = "currentSemester", ignore = true)
    @Mapping(target = "academicYear", ignore = true)
    @Mapping(target = "studentAddress", ignore = true)
    @Mapping(target = "department", ignore = true)
    @Mapping(target = "designation", ignore = true)
    @Mapping(target = "qualification", ignore = true)
    @Mapping(target = "facultyAddress", ignore = true)
    UserResponse toResponse(User user);
}
