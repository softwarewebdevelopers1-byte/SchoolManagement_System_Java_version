package com.example.school.system.controller.superadmin;

import java.util.List;

public record PlatformStatisticsDto(
        Long totalSchools,
        Long activeSchools,
        Long pendingSchools,
        Long rejectedSchools,
        Long suspendedSchools,
        Long totalStaff,
        Long activeStaff,
        Long pendingStaff,
        Long suspendedStaff,
        Long totalStudents,
        Long recentEnrollments,
        Long recentRegistrations,
        List<?> recentActivity,
        List<?> recentInvitations) {
}
