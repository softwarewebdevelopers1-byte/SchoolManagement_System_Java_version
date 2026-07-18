package com.example.school.system.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.UpdateStudentDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.UpdateStudentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/update")
public class UpdateStudentController {
    private final UpdateStudentService UpdateStudentService;

    @PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER')")
    @PatchMapping("/id")
    public ResponseEntity<?> updateStudent(@RequestBody UpdateStudentDTO updateStudentDTO) {
        UpdateStudentService.updateStudent(updateStudentDTO);
        return ResponseEntity.status(200).body(SchoolApiResponse.success("student updated"));
    }

}
