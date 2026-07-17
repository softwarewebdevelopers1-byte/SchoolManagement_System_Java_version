package com.example.school.system.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.school.system.models.ExpiryLinks;
import com.example.school.system.models.Users;

public interface ExpiryLinksRepository extends JpaRepository<ExpiryLinks, UUID> {
    Optional<ExpiryLinks> findByToken(String token);

    Optional<ExpiryLinks> findByTokenAndUsed(String token, boolean value);

    int deleteByUsers(Users user);
}
