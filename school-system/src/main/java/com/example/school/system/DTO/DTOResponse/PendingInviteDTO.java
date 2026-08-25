package com.example.school.system.DTO.DTOResponse;

import java.util.UUID;
import com.example.school.system.types.AccountStatus;
import lombok.Builder;

@Builder
public record PendingInviteDTO(
        UUID userId,
        String email,
        AccountStatus status
) {}
