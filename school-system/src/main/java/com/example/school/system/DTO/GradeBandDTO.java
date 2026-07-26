package com.example.school.system.DTO;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Builder
@AllArgsConstructor
@Getter
public class GradeBandDTO {
    private String grade;

    private Integer minScore;

    private Integer maxScore;

    private Double points;

    private UUID bandId;
}
