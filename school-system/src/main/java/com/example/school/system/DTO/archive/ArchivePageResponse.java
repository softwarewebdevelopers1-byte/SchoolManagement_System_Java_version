package com.example.school.system.DTO.archive;

import java.util.List;

public record ArchivePageResponse(
        List<ArchiveRecordResponse> content,
        int page,
        int size,
        boolean hasNext) {
}
