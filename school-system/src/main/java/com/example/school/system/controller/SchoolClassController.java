package com.example.school.system.controller;

import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.SchoolClassCreateDTO;
import com.example.school.system.DTO.SchoolClassUpdate;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.SchoolClassService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class SchoolClassController {
    private final SchoolClassService schoolClassService;

    @PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER')")
    @PostMapping("/create/school/class")
    public SchoolApiResponse<?> createClass(@Valid @RequestBody SchoolClassCreateDTO classCreateDTO) {
        return schoolClassService.createClass(classCreateDTO);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/update/{id}/school-cycle")
    public SchoolApiResponse<?> updateSchoolYearCycle(@PathVariable UUID id) {
        return schoolClassService.updateSchoolClassCycle(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER')")
    @PostMapping("/update/{id}/class")
    public SchoolApiResponse<?> updateClassDetails(@PathVariable UUID id, @RequestBody SchoolClassUpdate classUpdate) {
        return schoolClassService.updateClass(id, classUpdate);
    }

}
