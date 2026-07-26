package com.example.school.system.DTO;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Builder
@AllArgsConstructor
@Getter
public class GradeScaleDTO {
    private UUID gradeScaleId;
    private List<GradeBandDTO> gradeBandDTOs;
}
