package com.example.school.system.DTO;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class GraduationSettingsDTO {
    @NotBlank(message = "final grade is required")
    private Integer finalGrade;
    @NotNull(message = "school id cannot be null")
    UUID schoolId;
}