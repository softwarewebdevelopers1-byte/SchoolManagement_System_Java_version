package com.example.school.system.DTO;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record MarksheetSaveRequest(
                @NotNull(message = "subject joint id is required") UUID subjectJointId,
                @NotNull(message = "school id is required") UUID schoolId,
                Integer maxCat1,
                Integer maxCat2,
                Integer maxCat3,
                Integer maxExam,
                Boolean cat1Entry,
                Boolean cat2Entry,
                Boolean cat3Entry,
                @NotNull(message = "marks input is required") List<MarkInputDTO> markInputDTOs,
                String enrollmentCode) {

}