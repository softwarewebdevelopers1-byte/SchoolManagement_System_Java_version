package com.example.school.system.controller;

import org.springframework.web.bind.annotation.RestController;
import com.example.school.system.DTO.SubjectDTO;
import com.example.school.system.DTO.SubjectUpdateDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.SubjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;

@RestController
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@RequestMapping("/api")
public class SubjectController {
    private final SubjectService subjectService;

    @PostMapping("/create/subject")
    public ResponseEntity<?> CreateSingleSubject(
            @Valid @RequestBody SubjectDTO subjectCreationDTO) {
        var singleSubjectRes = subjectService.createSingleSubject(subjectCreationDTO);
        return ResponseEntity.status(201).body(singleSubjectRes);
    }

    @PostMapping("/create/multiple/subjects")
    public ResponseEntity<?> createMultipleSubjects(
            @Valid @RequestBody List<SubjectDTO> subjects) {
        SchoolApiResponse<?> multiSchoolResponse = subjectService.createMultipleSubject(subjects);
        return ResponseEntity.status(201).body(multiSchoolResponse);
    }

    @PatchMapping("/update/subject")
    public ResponseEntity<?> updateSubject(@Valid @RequestBody SubjectUpdateDTO subjectDTO) {
        var updateSubjectRes = subjectService.updateSubject(subjectDTO);
        return ResponseEntity.ok(updateSubjectRes);
    }

    @GetMapping("/getAll/subjects")
    public String getSubjects(@RequestBody String entity) {

        return entity;
    }

}

