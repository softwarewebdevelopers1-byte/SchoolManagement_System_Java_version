package com.example.school.system.DTO;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TeacherRemarkDTO(
        @NotNull(message = "school id is required") UUID schoolId,
        @NotNull(message = "subject id is required") UUID subjectId,
        @NotNull(message = "teacher id is required") UUID teacherId,
        @NotBlank(message = "grade band is required") String gradeBand,
        @NotBlank(message = "remark is required") String remark) {
}
