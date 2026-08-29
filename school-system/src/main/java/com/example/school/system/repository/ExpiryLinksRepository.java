package com.example.school.system.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import com.example.school.system.models.ExpiryLinks;
import com.example.school.system.projection.LoginView;

public interface ExpiryLinksRepository extends JpaRepository<ExpiryLinks, UUID> {
    Optional<ExpiryLinks> findByToken(String token);

    Optional<ExpiryLinks> findByTokenAndUsed(String token, boolean value);

    Optional<ExpiryLinks> findByTokenAndUsedAndExpirationTimeAfter(String token, boolean used,
            LocalDateTime now);

    List<ExpiryLinks> findAllByOrderByCreatedAtDesc();

    List<ExpiryLinks> findAllBySchoolIdOrderByCreatedAtDesc(UUID schoolId);

    int deleteByUsers(LoginView user);

    @Modifying
    int deleteAllByExpirationTimeBeforeOrUsedTrue(LocalDateTime expTime);
}
