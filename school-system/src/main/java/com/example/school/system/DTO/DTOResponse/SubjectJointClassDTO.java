package com.example.school.system.DTO.DTOResponse;

import java.util.UUID;
import com.example.school.system.types.SubjectType;
import lombok.Builder;

@Builder
public record SubjectJointClassDTO(
        UUID id,
        String name,
        SubjectType enrollmentMode,
        String sharedSlotId
) {}
