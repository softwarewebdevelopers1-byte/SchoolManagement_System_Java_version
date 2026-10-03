package com.example.school.system.services.archive;

import java.util.List;
import java.util.UUID;

public record ArchivePayload(
        byte[] manifest,
        byte[] document,
        List<StudentFile> studentFiles,
        String manifestKey,
        String documentKey) {
    public record StudentFile(UUID studentId, String key, byte[] content, String sha256) {
    }
}
