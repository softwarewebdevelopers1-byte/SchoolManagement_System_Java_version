package com.example.school.system.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.school.system.models.School;

public interface SchoolRepository extends JpaRepository<School, Long> {
    boolean existsBySchoolName(String schoolId);

    Optional<School> findBySchoolName(String schoolName);

    Optional<School> findBySchoolCode(String code);
}
