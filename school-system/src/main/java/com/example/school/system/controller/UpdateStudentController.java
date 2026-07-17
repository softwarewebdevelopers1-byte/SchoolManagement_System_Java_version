package com.example.school.system.controller;

import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    @PostMapping("/id")
    public SchoolApiResponse<?> updateStudent(@RequestBody UpdateStudentDTO updateStudentDTO, @RequestParam UUID id) {
        UpdateStudentService.updateStudent(updateStudentDTO, id);
        return SchoolApiResponse.success("student updated");
    }

}
