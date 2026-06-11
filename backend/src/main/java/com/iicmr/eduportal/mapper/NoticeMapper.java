package com.iicmr.eduportal.mapper;

import com.iicmr.eduportal.dto.response.NoticeResponse;
import com.iicmr.eduportal.entity.Notice;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NoticeMapper {

    @Mapping(target = "createdById", source = "createdBy.id")
    @Mapping(target = "createdByName", source = "createdBy.fullName")
    NoticeResponse toResponse(Notice notice);
}
