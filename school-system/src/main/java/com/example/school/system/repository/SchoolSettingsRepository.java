package com.example.school.system.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.school.system.models.School;
import com.example.school.system.models.SchoolSettings;

public interface SchoolSettingsRepository extends JpaRepository<SchoolSettings, Integer> {
    Optional<SchoolSettings> findBySchool(School school);
}
