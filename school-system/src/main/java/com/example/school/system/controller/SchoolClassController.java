package com.example.school.system.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
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
    public ResponseEntity<?> createClass(@Valid @RequestBody SchoolClassCreateDTO classCreateDTO) {
        var createClassRes = schoolClassService.createClass(classCreateDTO);
        return ResponseEntity.status(201).body(createClassRes);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/update/{id}/school-cycle")
    public ResponseEntity<?> updateSchoolYearCycle(@PathVariable UUID id) {
        SchoolApiResponse<?> updateCycleRes = schoolClassService.updateSchoolClassCycle(id);
        return ResponseEntity.status(200).body(updateCycleRes);
    }

    @PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER')")
    @PatchMapping("/update/class")
    public ResponseEntity<?> updateClassDetails(@RequestBody SchoolClassUpdate classUpdate) {
        SchoolApiResponse<?> res = schoolClassService.updateClass(classUpdate);
        return ResponseEntity.status(200).body(res);
    }

}
