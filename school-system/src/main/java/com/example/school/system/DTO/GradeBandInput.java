package com.example.school.system.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class GradeBandInput {
    @NotBlank(message = "grade is required")
    private String grade;
    @NotNull(message = "min score is required")
    private Integer minScore;
    @NotNull(message = "max score is required")
    private Integer maxScore;
    @NotNull(message = "point is required")
    private Double points;
}
