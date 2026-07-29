package com.example.school.system.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.school.system.models.GenerationHistory;

public interface GenerationHistoryRepository extends JpaRepository<GenerationHistory, UUID> {
    List<GenerationHistory> findAllBySchoolIdOrderByStartedAtDesc(UUID schoolId);
}
