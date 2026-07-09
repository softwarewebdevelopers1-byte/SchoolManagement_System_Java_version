package com.example.school.system.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.school.system.models.UserProfile;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    boolean existsByEmail(String email);

    UserProfile findByEmail(String email);
}
