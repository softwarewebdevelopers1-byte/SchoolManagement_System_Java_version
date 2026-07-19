package com.example.school.system.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.ClassAttendanceDTO;
import com.example.school.system.DTO.FetchSingleDayStudentAttendance;
import com.example.school.system.DTO.LoadAttendaceSheetSpecificDate;
import com.example.school.system.DTO.StudentAttendanceDTO;
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
    public ResponseEntity<?> loadAttendanceSheet(@Valid @RequestBody ClassAttendanceDTO classAttendanceDTO) {
        AttendanceSheetDTO sheet = attendanceService.getOrCreateSheet(classAttendanceDTO);
        return ResponseEntity.status(200).body(SchoolApiResponse.success(sheet, "sheet loaded"));
    }

    @GetMapping("/student/attendance/record")
    public ResponseEntity<?> getStudentAttendanceRecord(@Valid @RequestBody FetchSingleDayStudentAttendance record) {
        var studentRecord = attendanceService.getStudentSingleDayRecord(record);
        return ResponseEntity.status(200).body(studentRecord);
    }

    @PatchMapping("/sheet")
    public ResponseEntity<?> updateStudentAttendance(@Valid @RequestBody StudentAttendanceDTO studentAttendanceDTO) {
        attendanceService.updateStudentAttendance(studentAttendanceDTO);
        return ResponseEntity.status(200).body(SchoolApiResponse.success("student attendance updated"));
    }

    @GetMapping("/get/attendance-sheet")
    public ResponseEntity<?> getAttendanceSheet(
            @Valid @RequestBody LoadAttendaceSheetSpecificDate loadAttendaceSheetSpecificDate) {
        var response = attendanceService.getAttendaceSheetSPecificDate(loadAttendaceSheetSpecificDate);
        return ResponseEntity.status(200).body(response);
    }

}
