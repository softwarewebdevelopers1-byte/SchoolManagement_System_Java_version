package com.example.school.system.DTO.archive;

import java.util.List;

public record ArchiveStudentsPageResponse(
        List<ArchiveStudentArtifact> content,
        int page,
        int size,
        boolean hasNext) {
}
