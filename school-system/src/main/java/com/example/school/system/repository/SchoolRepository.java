package com.example.school.system.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.school.system.models.School;

public interface SchoolRepository extends JpaRepository<School, Long> {
    boolean existsBySchoolId(Long schoolId);

    boolean existsBySchoolName(String schoolName);
}
