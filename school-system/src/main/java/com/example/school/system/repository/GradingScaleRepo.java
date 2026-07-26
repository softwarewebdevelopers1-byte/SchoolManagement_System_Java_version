package com.example.school.system.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.school.system.models.GradingScale;

public interface GradingScaleRepo extends JpaRepository<GradingScale, UUID> {
    Optional<GradingScale> findBySchoolId(UUID schoolId);

    Optional<GradingScale> findByIdAndSchoolId(UUID id, UUID schoolId);

}
