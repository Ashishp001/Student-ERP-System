package com.iicmr.eduportal.repository;

import com.iicmr.eduportal.entity.Hostel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HostelRepository extends JpaRepository<Hostel, UUID> {
    List<Hostel> findByIsActiveTrueOrderByNameAsc();
}
