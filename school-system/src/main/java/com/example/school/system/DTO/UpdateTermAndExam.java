package com.example.school.system.DTO;

import java.util.UUID;

import com.example.school.system.types.ExamType;

import jakarta.validation.constraints.NotNull;

public record UpdateTermAndExam(Integer term, String finalGrade, ExamType examType,
                @NotNull(message = "school id is required") UUID schoolId) {
}
