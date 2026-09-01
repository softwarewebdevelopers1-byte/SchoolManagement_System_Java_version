package com.example.school.system.DTO.DTOResponse;

import java.util.UUID;

import lombok.Builder;

@Builder
public record PublicSchoolDTO(
        UUID id,
        String schoolName,
        String schoolMotto,
        String schoolAddress,
        String schoolEmail,
        String phoneNumber
) {}
