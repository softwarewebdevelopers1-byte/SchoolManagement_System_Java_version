package com.example.school.system.DTO.DTOResponse;

import java.util.UUID;
import lombok.Builder;

@Builder
public record ClassHistorySnapshotDTO(
        UUID classHistoryId,
        String className,
        String classTeacherName,
        int studentsCount
) {}
