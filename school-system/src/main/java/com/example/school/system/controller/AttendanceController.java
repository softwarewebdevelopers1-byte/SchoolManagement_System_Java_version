package com.example.school.system.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
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

    @PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER')")
    @GetMapping("/sheet")
    public ResponseEntity<?> loadAttendanceSheet(@RequestParam(required = true) UUID classId,
            @RequestParam(required = true) UUID teacherId) {
        AttendanceSheetDTO sheet = attendanceService
                .getOrCreateSheet(ClassAttendanceDTO.builder().teacherId(teacherId).classId(classId).build());
        return ResponseEntity.status(200).body(SchoolApiResponse.success(sheet, "sheet loaded"));
    }

    @PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER')")
    @GetMapping("/student/attendance/record")
    public ResponseEntity<?> getStudentAttendanceRecord(FetchSingleDayStudentAttendance record) {
        var studentRecord = attendanceService.getStudentSingleDayRecord(record);
        return ResponseEntity.status(200).body(studentRecord);
    }

    @PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER')")
    @PatchMapping("/update/sheet")
    public ResponseEntity<?> updateSheet(@Valid @RequestBody AttendanceSheetSubmit sheetDTO) {
        attendanceService.updateSheet(sheetDTO);
        return ResponseEntity.status(200).body(SchoolApiResponse.success("sheet updated"));
    }

    @PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER')")
    @GetMapping("/get/attendance-sheet")
    public ResponseEntity<?> getAttendanceSheet(
            @RequestBody LoadAttendaceSheetSpecificDate loadAttendaceSheetSpecificDate) {
        // pass class teacher id if loading for a specifc class
        var response = attendanceService.getAttendaceSheetSPecificDate(loadAttendaceSheetSpecificDate);
        return ResponseEntity.status(200).body(response);
    }
}
