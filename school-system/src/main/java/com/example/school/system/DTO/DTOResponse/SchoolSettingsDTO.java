package com.example.school.system.DTO.DTOResponse;

import com.example.school.system.types.SchoolVisibility;
import lombok.Builder;

@Builder
public record SchoolSettingsDTO(
        String schoolName,
        String schoolCode,
        String schoolEmail,
        String motto,
        String schoolAddress,
        String phoneNumber,
        SchoolVisibility visibility
) {}
