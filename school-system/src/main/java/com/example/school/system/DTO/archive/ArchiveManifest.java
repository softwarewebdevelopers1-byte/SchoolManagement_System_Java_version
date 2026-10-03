package com.example.school.system.DTO.archive;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ArchiveManifest(
        String type,
        UUID archiveId,
        int version,
        UUID schoolId,
        UUID classId,
        String period,
        Instant generatedAt,
        List<StudentObject> students) {
    public record StudentObject(UUID studentId, String key, String sha256, long size) {
    }
}
