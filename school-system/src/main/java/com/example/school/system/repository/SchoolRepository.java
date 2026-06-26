package com.example.school.system.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.school.system.models.School;

public interface SchoolRepository extends JpaRepository<School, Long> {
    boolean existsBySchoolName(String schoolId);

    School findBySchoolName(String schoolName);
}
