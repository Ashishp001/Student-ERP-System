package com.iicmr.eduportal.repository;

import com.iicmr.eduportal.entity.User;
import com.iicmr.eduportal.entity.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    long countByRole(UserRole role);
    long countByRoleAndIsActive(UserRole role, Boolean isActive);
}
