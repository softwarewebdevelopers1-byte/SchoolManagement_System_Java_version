package com.example.school.system.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.GetAllStudentsDTO;
import com.example.school.system.DTO.GetStudentsOfSpecificClass;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.DTO.pagination.PageResponse;
import com.example.school.system.DTO.student.StudentSummaryDTO;
import com.example.school.system.services.GetStudentsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/get")
@RequiredArgsConstructor
public class GetStudentsController {
    private final GetStudentsService getStudentsService;

    @GetMapping("/students")
    public ResponseEntity<?> getStudentsOfSpecificClass(
            @RequestParam UUID classId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<StudentSummaryDTO> res = getStudentsService.getStudentByClass(
                new GetStudentsOfSpecificClass(classId), page, size);
        return ResponseEntity.ok(SchoolApiResponse.success(res, "Students loaded"));
    }

    @GetMapping("/all/students")
    public ResponseEntity<?> getAllStudents(@RequestParam UUID schoolId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        PageResponse<StudentSummaryDTO> res = getStudentsService.getAllStudents(
                new GetAllStudentsDTO(schoolId), page, size);
        return ResponseEntity.ok(SchoolApiResponse.success(res, "Students loaded"));
    }

    @GetMapping("/exited/students")
    public ResponseEntity<?> getAllExitedStudents(@RequestParam UUID schoolId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<StudentSummaryDTO> res = getStudentsService.getAllExitedStudents(
                new GetAllStudentsDTO(schoolId), page, size);
        return ResponseEntity.ok(SchoolApiResponse.success(res, "Exited students loaded"));
    }
}
