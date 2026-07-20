package com.example.school.system.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.RegisterStudentDTO;

import com.example.school.system.services.StudentRegistrationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@PreAuthorize("hasAnyRole('ADMIN')")
public class RegisterStudentController {
    private final StudentRegistrationService studentRegistrationService;

    @PostMapping("/register/students")
    public ResponseEntity<?> SchoolReg(@Valid @RequestBody RegisterStudentDTO registerStudentDTO) {
        var res = studentRegistrationService.registerStudent(registerStudentDTO);
        return ResponseEntity.status(201).body(res);
    }
}
