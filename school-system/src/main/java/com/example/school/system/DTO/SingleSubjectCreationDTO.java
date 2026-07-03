package com.example.school.system.DTO;

import jakarta.validation.constraints.NotBlank;

public record SingleSubjectCreationDTO(@NotBlank(message = "Subject should not be blank") String subjectName,
        String subjectType) {

}