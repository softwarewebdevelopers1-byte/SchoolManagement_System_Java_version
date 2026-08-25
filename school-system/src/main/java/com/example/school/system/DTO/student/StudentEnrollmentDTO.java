package com.example.school.system.DTO.student;

import java.util.List;
import java.util.UUID;

public record StudentEnrollmentDTO(
        UUID studentId,
        List<UUID> enrolledSubjectJointIds
) {}
