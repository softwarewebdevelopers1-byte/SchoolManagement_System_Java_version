package com.example.school.system.DTO;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record ResultPublicationRequest(
        @NotNull UUID classId) {
}
