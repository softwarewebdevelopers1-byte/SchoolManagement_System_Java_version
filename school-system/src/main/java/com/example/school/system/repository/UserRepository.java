package com.example.school.system.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.school.system.models.Users;

public interface UserRepository extends JpaRepository<Users, UUID> {
    boolean existsByEmail(String email);

    Optional<Users> findByEmail(String email);

    Optional<Users> findByEmailAndStatus(String email, String status);

    Optional<Users> findByIdAndEmail(UUID id, String email);

    List<Users> findAllBySchool(UUID id);
}
