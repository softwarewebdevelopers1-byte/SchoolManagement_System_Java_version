package com.example.school.system.DTO;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record MarkInputDTO(
                @NotNull(message = "student id is required") UUID studentId,
                Integer cat1,
                Integer cat2,
                Integer cat3,
                Integer exam) {

}
