package com.example.school.system.DTO;

import java.util.Set;
import java.util.UUID;

import com.example.school.system.types.ExamType;

public record ResultPublicationStatusResponse(
        String academicYear,
        Integer term,
        ExamType examType,
        Set<UUID> publishedClassIds) {
}
