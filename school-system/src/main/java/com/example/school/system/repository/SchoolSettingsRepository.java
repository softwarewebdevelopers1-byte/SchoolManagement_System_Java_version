package com.example.school.system.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.school.system.models.SchoolSettings;

public interface SchoolSettingsRepository extends JpaRepository<SchoolSettings, UUID> {
    Optional<SchoolSettings> findBySchoolId(UUID schoolId);
}
