package com.example.school.system.controller.admin;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.DTO.attendanceInsights.AttendanceDailyDTO;
import com.example.school.system.DTO.attendanceInsights.AttendanceMonthlySummaryDTO;
import com.example.school.system.DTO.attendanceInsights.AttendanceTermlySummaryDTO;
import com.example.school.system.services.AdminAttendanceInsightsService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/attendance-insights")
@PreAuthorize("hasAnyRole('ADMIN','HEADTEACHER')")
public class AdminAttendanceController {
    private final AdminAttendanceInsightsService adminAttendanceInsightsService;

    @GetMapping("/classes/{classId}/attendance/daily")
    public ResponseEntity<?> getDailyAttendance(@PathVariable UUID classId, @RequestParam LocalDate date) {
        List<AttendanceDailyDTO> res = adminAttendanceInsightsService.getDailyAttendance(classId, date);
        return ResponseEntity.status(200).body(SchoolApiResponse.success(res, "daily attendance loaded"));
    }

    @GetMapping("/classes/{classId}/attendance/monthly")
    public ResponseEntity<?> getMonthlyAttendance(@PathVariable UUID classId, @RequestParam LocalDate startDate, @RequestParam LocalDate endDate, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "50") int size) {
        Page<AttendanceMonthlySummaryDTO> res = adminAttendanceInsightsService.getMonthlyAttendance(classId, startDate, endDate, page, size);
        return ResponseEntity.status(200).body(SchoolApiResponse.success(res, "monthly attendance loaded"));
    }

    @GetMapping("/classes/{classId}/attendance/termly")
    public ResponseEntity<?> getTermlyAttendance(@PathVariable UUID classId, @RequestParam LocalDate startDate, @RequestParam LocalDate endDate, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "50") int size) {
        Page<AttendanceTermlySummaryDTO> res = adminAttendanceInsightsService.getTermlyAttendance(classId, startDate, endDate, page, size);
        return ResponseEntity.status(200).body(SchoolApiResponse.success(res, "termly attendance loaded"));
    }
}
