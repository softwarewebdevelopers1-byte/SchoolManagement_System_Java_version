package com.example.school.system.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class UnenrollMultipleStudents {
    @NotBlank(message = "enrollment code is required")
    private String enrollmentCode;
    @NotNull(message = "student id cannot be null")
    private List<UUID> studentIds;
}
