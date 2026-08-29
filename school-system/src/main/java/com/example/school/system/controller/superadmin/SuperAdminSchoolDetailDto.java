package com.example.school.system.controller.superadmin;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record SuperAdminSchoolDetailDto(
        UUID schoolId,
        String schoolName,
        String schoolCode,
        String email,
        String phoneNumber,
        String address,
        String status,
        LocalDate registeredDate,
        String adminName,
        Long totalStaff,
        Long activeStaff,
        Long suspendedStaff,
        Long pendingStaff,
        Long totalStudents,
        List<?> studentsByClass,
        List<?> classes,
        List<?> staffMembers,
        List<?> adminList) {
}
