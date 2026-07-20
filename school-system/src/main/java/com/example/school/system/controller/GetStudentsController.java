package com.example.school.system.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.GetAllStudentsDTO;
import com.example.school.system.DTO.GetStudentsOfSpecificClass;
import com.example.school.system.services.GetStudentsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/get")
@RequiredArgsConstructor
public class GetStudentsController {
    private final GetStudentsService getStudentsService;

    @GetMapping("/students")
    public ResponseEntity<?> getStudentsOfSpecificClass(
            @Valid @RequestBody GetStudentsOfSpecificClass getStudentsOfSpecificClass,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        List<?> res = getStudentsService.getStudentByClass(getStudentsOfSpecificClass, page, size);
        return ResponseEntity.status(200).body(res);
    }

    @GetMapping("/all/students")
    public ResponseEntity<?> getAllStudents(@Valid @RequestBody GetAllStudentsDTO getAllStudentsDTO,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<?> res = getStudentsService.getAllStudents(getAllStudentsDTO, page, size);
        return ResponseEntity.status(200).body(res);
    }
}
