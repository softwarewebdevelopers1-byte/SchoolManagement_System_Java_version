package com.example.school.system.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class ParentConcernStatusDTO {
    @NotBlank(message = "status is required")
    private String status;
}