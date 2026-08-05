package com.example.school.system.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.AttendanceSheetSubmit;
import com.example.school.system.DTO.ClassAttendanceDTO;
import com.example.school.system.DTO.FetchSingleDayStudentAttendance;
import com.example.school.system.DTO.LoadAttendaceSheetSpecificDate;
import com.example.school.system.DTO.DTOResponse.AttendanceSheetDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {
    private final AttendanceService attendanceService;

    @GetMapping("/sheet")
    public ResponseEntity<?> loadAttendanceSheet(@RequestParam(required = true) UUID classId,
            @RequestParam(required = true) UUID teacherId) {
        AttendanceSheetDTO sheet = attendanceService
                .getOrCreateSheet(ClassAttendanceDTO.builder().teacherId(teacherId).classId(classId).build());
        return ResponseEntity.status(200).body(SchoolApiResponse.success(sheet, "sheet loaded"));
    }

    @GetMapping("/student/attendance/record")
    public ResponseEntity<?> getStudentAttendanceRecord(@RequestParam String studentAdm, @RequestParam UUID teacherId,
            @RequestParam LocalDate date) {
        FetchSingleDayStudentAttendance record = new FetchSingleDayStudentAttendance(date, studentAdm, teacherId);
        var studentRecord = attendanceService.getStudentSingleDayRecord(record);
        return ResponseEntity.status(200).body(studentRecord);
    }

    // @PatchMapping("/sheet")
    // public ResponseEntity<?> updateStudentAttendance(@Valid @RequestBody
    // StudentAttendanceDTO studentAttendanceDTO) {
    // attendanceService.updateStudentAttendance(studentAttendanceDTO);
    // return ResponseEntity.status(200).body(SchoolApiResponse.success("student
    // attendance updated"));
    // }
    @PatchMapping("/update/sheet")
    public ResponseEntity<?> updateSheet(@Valid @RequestBody AttendanceSheetSubmit sheetDTO) {
        attendanceService.updateSheet(sheetDTO);
        return ResponseEntity.status(200).body(SchoolApiResponse.success("sheet updated"));
    }

    @GetMapping("/get/attendance-sheet")
    public ResponseEntity<?> getAttendanceSheet(
            @RequestParam UUID classId, @RequestParam UUID teacherId, @RequestParam LocalDate date) {
        LoadAttendaceSheetSpecificDate loadAttendaceSheetSpecificDate = new LoadAttendaceSheetSpecificDate(classId,
                date, teacherId);
        var response = attendanceService.getAttendaceSheetSPecificDate(loadAttendaceSheetSpecificDate);
        return ResponseEntity.status(200).body(response);
    }

    @GetMapping("/attendance/class-teacher/today")
    public ResponseEntity<?> getClassTeacherTodayAttendance() {
        return ResponseEntity.ok(SchoolApiResponse.success(null, "no attendance sheet yet"));
    }

    @GetMapping("/attendance/class-teacher/history")
    public ResponseEntity<?> getClassTeacherAttendanceHistory(
            @RequestParam(required = false) UUID classId,
            @RequestParam(required = false) LocalDate date,
            @RequestParam(required = false) String studentId) {
        return ResponseEntity.ok(SchoolApiResponse.success(List.of(), "attendance history loaded"));
    }

    @GetMapping("/attendance/class-teacher/summary")
    public ResponseEntity<?> getClassTeacherAttendanceSummary(
            @RequestParam(required = false) UUID classId,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        return ResponseEntity.ok(SchoolApiResponse.success(Map.of(), "attendance summary loaded"));
    }
}
