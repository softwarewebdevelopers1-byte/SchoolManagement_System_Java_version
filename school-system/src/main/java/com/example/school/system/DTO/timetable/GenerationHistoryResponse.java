package com.example.school.system.DTO.timetable;

import java.time.Instant;
import java.util.UUID;

import com.example.school.system.types.GenerationStatus;

public record GenerationHistoryResponse(
        UUID id,
        UUID timetableId,
        GenerationStatus status,
        Instant startedAt,
        Instant finishedAt,
        Long durationMs,
        Integer lessonsRequired,
        Integer lessonsGenerated,
        Integer conflictsDetected,
        Integer remainingConflicts,
        String summary) {
}
