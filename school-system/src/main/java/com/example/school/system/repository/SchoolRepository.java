package com.example.school.system.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.school.system.models.School;
import com.example.school.system.types.SchoolStatus;

public interface SchoolRepository extends JpaRepository<School, UUID> {
    boolean existsBySchoolName(String schoolName);

    boolean existsByEmail(String schoolEmail);

    Optional<School> findBySchoolName(String schoolName);

    Optional<School> findBySchoolCode(String code);

    Optional<School> findBySchoolCodeAndStatus(String code, SchoolStatus status);

    Optional<School> findByEmail(String schoolEmail);

}
