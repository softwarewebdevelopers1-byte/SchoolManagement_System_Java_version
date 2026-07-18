package com.example.school.system.controller;

import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.DTOResponse.AttendanceSheetDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.AttendanceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AttendanceController {
    private final AttendanceService attendanceService;

    @GetMapping("/attendance/sheet")
    public SchoolApiResponse<?> loadAttendanceSheet(@RequestParam UUID classId) {
        AttendanceSheetDTO sheet = attendanceService.getOrCreateSheet(classId);
        return SchoolApiResponse.success(sheet, "sheet loaded");
    }
}

