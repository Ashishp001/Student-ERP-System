package com.iicmr.eduportal.mapper;

import com.iicmr.eduportal.dto.response.NotificationResponse;
import com.iicmr.eduportal.entity.Notification;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    NotificationResponse toResponse(Notification notification);
}
