package com.example.school.system.DTO.archive;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResultArchiveCorrectionRequest(
        @NotBlank @Size(max = 500) String reason) {
}
