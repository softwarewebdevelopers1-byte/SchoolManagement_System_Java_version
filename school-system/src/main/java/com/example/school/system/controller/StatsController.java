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
import com.example.school.system.DTO.stats.AtRiskSummaryDTO;
import com.example.school.system.DTO.stats.AttendanceTrendDTO;
import com.example.school.system.DTO.stats.ClassAnalyticsDTO;
import com.example.school.system.DTO.stats.GradeDistributionDTO;
import com.example.school.system.DTO.stats.SchoolOverviewStatsDTO;
import com.example.school.system.DTO.stats.TeacherSummaryStatsDTO;
import com.example.school.system.DTO.stats.TermlyTrendDTO;
import com.example.school.system.projection.StudentPerformanceProjection;
import com.example.school.system.services.StatsService;
import com.example.school.system.types.ExamType;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping({"/api/stats", "/api/v1/stats"})
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
            @RequestParam String examType) {
        ExamType parsedExamType;
        try {
            parsedExamType = ExamType.valueOf(examType.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(SchoolApiResponse.error("Invalid exam type: " + examType));
        }
        List<ClassAnalyticsDTO> res = statsService.getClassAnalytics(classId, term, academicYear, parsedExamType);
        return ResponseEntity.ok(SchoolApiResponse.success(res, "class analytics loaded"));
    }

    @PreAuthorize("hasAnyRole('ADMIN','HEADTEACHER','DEPUTYTEACHER')")
    @GetMapping("/marks/grade/{grade}/analytics")
    public ResponseEntity<?> getGradeAnalytics(
            @PathVariable String grade,
            @RequestParam Integer term,
            @RequestParam String academicYear,
            @RequestParam String examType) {
        ExamType parsedExamType;
        try {
            parsedExamType = ExamType.valueOf(examType.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(SchoolApiResponse.error("Invalid exam type: " + examType));
        }
        List<ClassAnalyticsDTO> res = statsService.getGradeAnalytics(grade, term, academicYear, parsedExamType);
        return ResponseEntity.ok(SchoolApiResponse.success(res, "grade analytics loaded"));
    }

    @PreAuthorize("hasAnyRole('ADMIN','HEADTEACHER','DEPUTYTEACHER')")
    @GetMapping("/teachers/summary")
    public ResponseEntity<?> getTeacherSummary() {
        TeacherSummaryStatsDTO res = statsService.getTeacherSummary();
        return ResponseEntity.ok(SchoolApiResponse.success(res, "teacher summary loaded"));
    }

    @PreAuthorize("hasAnyRole('ADMIN','HEADTEACHER','DEPUTYTEACHER','CLASSTEACHER')")
    @GetMapping("/marks/grade/{grade}/distribution")
    public ResponseEntity<?> getGradeDistribution(
            @PathVariable String grade,
            @RequestParam Integer term,
            @RequestParam String academicYear,
            @RequestParam String examType) {
        ExamType parsedExamType;
        try {
            parsedExamType = ExamType.valueOf(examType.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(SchoolApiResponse.error("Invalid exam type: " + examType));
        }
        GradeDistributionDTO res = statsService.getGradeDistributionByGrade(grade, term, academicYear, parsedExamType);
        return ResponseEntity.ok(SchoolApiResponse.success(res, "grade distribution loaded"));
    }

    @PreAuthorize("hasAnyRole('ADMIN','HEADTEACHER','DEPUTYTEACHER','CLASSTEACHER')")
    @GetMapping("/marks/class/{classId}/distribution")
    public ResponseEntity<?> getClassDistribution(
            @PathVariable UUID classId,
            @RequestParam Integer term,
            @RequestParam String academicYear,
            @RequestParam String examType) {
        ExamType parsedExamType;
        try {
            parsedExamType = ExamType.valueOf(examType.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(SchoolApiResponse.error("Invalid exam type: " + examType));
        }
        GradeDistributionDTO res = statsService.getGradeDistribution(classId, term, academicYear, parsedExamType);
        return ResponseEntity.ok(SchoolApiResponse.success(res, "class distribution loaded"));
    }

    @PreAuthorize("hasAnyRole('ADMIN','HEADTEACHER','DEPUTYTEACHER','CLASSTEACHER')")
    @GetMapping("/marks/class/{classId}/dashboard")
    public ResponseEntity<?> getClassPerformanceDashboard(
            @PathVariable UUID classId,
            @RequestParam Integer term,
            @RequestParam String academicYear,
            @RequestParam String examType) {
        try {
            ExamType parsedExamType = ExamType.valueOf(examType.trim().toUpperCase());
            List<StudentPerformanceProjection> res = statsService.getStudentPerformance(
                    classId, term, academicYear, parsedExamType);
            return ResponseEntity.ok(SchoolApiResponse.success(res, "class performance loaded"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(SchoolApiResponse.error("Invalid exam type: " + examType));
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN','HEADTEACHER','DEPUTYTEACHER','CLASSTEACHER')")
    @GetMapping("/marks/grade/{grade}/termly-trend")
    public ResponseEntity<?> getTermlyTrend(
            @PathVariable String grade,
            @RequestParam String academicYear) {
        List<TermlyTrendDTO> res = statsService.getTermlyTrendByGrade(grade, academicYear);
        return ResponseEntity.ok(SchoolApiResponse.success(res, "termly trend loaded"));
    }

    @PreAuthorize("hasAnyRole('ADMIN','HEADTEACHER','DEPUTYTEACHER','CLASSTEACHER')")
    @GetMapping("/marks/class/{classId}/termly-trend")
    public ResponseEntity<?> getClassTermlyTrend(
            @PathVariable UUID classId,
            @RequestParam String academicYear) {
        List<TermlyTrendDTO> res = statsService.getTermlyTrend(classId, academicYear);
        return ResponseEntity.ok(SchoolApiResponse.success(res, "class termly trend loaded"));
    }

    @PreAuthorize("hasAnyRole('ADMIN','HEADTEACHER','DEPUTYTEACHER')")
    @GetMapping("/students/at-risk")
    public ResponseEntity<?> getAtRiskStudents(
            @RequestParam(required = false) UUID classId,
            @RequestParam(required = false) String grade,
            @RequestParam String academicYear,
            @RequestParam(defaultValue = "50.0") double threshold) {
        if (classId != null) {
            AtRiskSummaryDTO res = statsService.getAtRiskStudents(classId, academicYear, threshold);
            return ResponseEntity.ok(SchoolApiResponse.success(res, "at-risk students loaded"));
        } else if (grade != null && !grade.isBlank()) {
            AtRiskSummaryDTO res = statsService.getAtRiskStudentsByGrade(grade, academicYear, threshold);
            return ResponseEntity.ok(SchoolApiResponse.success(res, "at-risk students loaded"));
        } else {
            return ResponseEntity.badRequest().body(SchoolApiResponse.error("Either classId or grade is required"));
        }
    }
}
