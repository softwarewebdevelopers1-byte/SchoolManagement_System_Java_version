package com.example.school.system.DTO;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class ParentConcernDTO {
    @NotNull(message = "student id is required")
    private UUID studentId;
    @NotBlank(message = "message is required")
    private String message;
}