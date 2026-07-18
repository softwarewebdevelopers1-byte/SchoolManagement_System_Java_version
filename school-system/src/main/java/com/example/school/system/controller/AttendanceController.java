package com.example.school.system.controller;

import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
    public SchoolApiResponse<?> loadAttendanceSheet(@RequestParam UUID classId) {
        AttendanceSheetDTO sheet = attendanceService.getOrCreateSheet(classId);
        return SchoolApiResponse.success(sheet, "sheet loaded");
    }

    @PostMapping("/sheet")
    public SchoolApiResponse<?> updateStudentAttendance(@Valid @RequestBody StudentAttendanceDTO studentAttendanceDTO) {
        attendanceService.updateStudentAttendance(studentAttendanceDTO);
        return SchoolApiResponse.success("student attendance updated");
    }

}
