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
        String status,
        List<Artifact> artifacts) {
    public record Artifact(
            String type,
            UUID studentId,
            String objectKey,
            String contentType,
            String sha256,
            long size) {
    }
}
