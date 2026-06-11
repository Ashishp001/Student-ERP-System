package com.iicmr.eduportal.repository;

import com.iicmr.eduportal.entity.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface NoticeRepository extends JpaRepository<Notice, UUID> {

    /** Active (non-archived) notices — pinned first, then newest */
    Page<Notice> findByIsArchivedFalseOrderByIsPinnedDescCreatedAtDesc(Pageable pageable);

    /** Active notices filtered by audience (case-insensitive) */
    @Query("""
            SELECT n
            FROM Notice n
            WHERE n.isArchived = false
              AND LOWER(n.targetAudience) IN :targetAudiences
            ORDER BY n.isPinned DESC, n.createdAt DESC
            """)
    Page<Notice> findActiveFeedByAudience(
            @Param("targetAudiences") List<String> targetAudiences,
            Pageable pageable
    );

    /** Notices authored by a specific user */
    List<Notice> findByCreatedByIdOrderByCreatedAtDesc(UUID userId);
}
