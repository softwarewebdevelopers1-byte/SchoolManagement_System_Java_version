package com.example.school.system.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.school.system.models.Users;

public interface UserRepository extends JpaRepository<Users, Long> {
    boolean existsByEmail(String email);

    Users findByEmail(String email);
}
