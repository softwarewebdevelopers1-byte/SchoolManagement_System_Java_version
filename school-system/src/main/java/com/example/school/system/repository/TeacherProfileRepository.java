package com.example.school.system.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.school.system.models.TeacherProfile;

public interface TeacherProfileRepository extends JpaRepository<TeacherProfile, UUID> {
    @EntityGraph(attributePaths = { "teacher", "schoolClass" })
    Optional<TeacherProfile> findByTeacher(UUID id);
}
