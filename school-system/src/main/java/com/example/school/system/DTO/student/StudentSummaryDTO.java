package com.example.school.system.DTO.student;

import java.util.UUID;
import com.example.school.system.types.AccountStatus;
import com.example.school.system.types.Gender;

public record StudentSummaryDTO(
        UUID studentId,
        String fullName,
        String adm,
        String email,
        String phoneNumber,
        String guardianName,
        Gender gender,
        AccountStatus status,
        UUID classId,      // <--- Field 9 is classId (UUID), NOT a List<UUID>!
        Integer grade,
        String stream
) {}