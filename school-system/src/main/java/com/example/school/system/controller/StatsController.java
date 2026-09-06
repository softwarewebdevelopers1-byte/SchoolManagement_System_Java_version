package com.example.school.system.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.DTO.stats.AttendanceTrendDTO;
import com.example.school.system.DTO.stats.ClassAnalyticsDTO;
import com.example.school.system.DTO.stats.SchoolOverviewStatsDTO;
import com.example.school.system.DTO.stats.TeacherSummaryStatsDTO;
import com.example.school.system.services.StatsService;
import com.example.school.system.types.ExamType;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {
    private final StatsService statsService;

    @PreAuthorize("hasAnyRole('ADMIN','HEADTEACHER','DEPUTYTEACHER')")
    @GetMapping("/school/overview")
    public ResponseEntity<?> getSchoolOverview() {
        SchoolOverviewStatsDTO res = statsService.getSchoolOverview();
        return ResponseEntity.ok(SchoolApiResponse.success(res, "school overview loaded"));
    }

    @PreAuthorize("hasAnyRole('ADMIN','HEADTEACHER','DEPUTYTEACHER','CLASSTEACHER')")
    @GetMapping("/attendance/class/{classId}/trend")
    public ResponseEntity<?> getAttendanceTrend(
            @PathVariable UUID classId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        List<AttendanceTrendDTO> res = statsService.getAttendanceTrend(classId, startDate, endDate);
        return ResponseEntity.ok(SchoolApiResponse.success(res, "attendance trend loaded"));
    }

    @PreAuthorize("hasAnyRole('ADMIN','HEADTEACHER','DEPUTYTEACHER','CLASSTEACHER')")
    @GetMapping("/marks/class/{classId}/analytics")
    public ResponseEntity<?> getClassAnalytics(
            @PathVariable UUID classId,
            @RequestParam Integer term,
            @RequestParam String academicYear,
            @RequestParam ExamType examType) {
        List<ClassAnalyticsDTO> res = statsService.getClassAnalytics(classId, term, academicYear, examType);
        return ResponseEntity.ok(SchoolApiResponse.success(res, "class analytics loaded"));
    }

    @PreAuthorize("hasAnyRole('ADMIN','HEADTEACHER','DEPUTYTEACHER')")
    @GetMapping("/teachers/summary")
    public ResponseEntity<?> getTeacherSummary() {
        TeacherSummaryStatsDTO res = statsService.getTeacherSummary();
        return ResponseEntity.ok(SchoolApiResponse.success(res, "teacher summary loaded"));
    }
}
