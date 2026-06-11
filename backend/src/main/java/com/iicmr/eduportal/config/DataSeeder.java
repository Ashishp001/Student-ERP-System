package com.iicmr.eduportal.config;

import com.iicmr.eduportal.entity.User;
import com.iicmr.eduportal.entity.enums.UserRole;
import com.iicmr.eduportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
    }

    private void seedAdmin() {
        String adminEmail = "admin@iicmr.edu.in";
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .email(adminEmail)
                    .username("admin")
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .fullName("System Administrator")
                    .role(UserRole.ADMIN)
                    .phone("0000000000")
                    .build();
            userRepository.save(admin);
            log.info("✅ Default admin seeded: {} / Admin@123", adminEmail);
        } else {
            log.info("ℹ️  Admin already exists, skipping seed.");
        }
    }
}
