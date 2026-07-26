package com.example.school.system.DTO;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class GradeScaleInput {
    @NotNull(message = "grade scaler id is required")
    private UUID gradeScaleId;
    @NotNull(message = "school id is required")
    private UUID schoolId;
    private List<GradeBandInput> gradeBandDTOs;
}
