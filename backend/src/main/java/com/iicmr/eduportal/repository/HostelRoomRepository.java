package com.iicmr.eduportal.repository;

import com.iicmr.eduportal.entity.HostelRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HostelRoomRepository extends JpaRepository<HostelRoom, UUID> {
    List<HostelRoom> findByHostelIdOrderByRoomNumberAsc(UUID hostelId);
}
