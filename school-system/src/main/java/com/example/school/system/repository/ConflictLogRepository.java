package com.example.school.system.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.school.system.models.ConflictLog;

public interface ConflictLogRepository extends JpaRepository<ConflictLog, UUID> {
    List<ConflictLog> findAllByGenerationHistoryId(UUID generationHistoryId);
}
