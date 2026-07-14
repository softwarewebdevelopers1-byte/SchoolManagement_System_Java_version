package com.example.school.system.controller;

import org.springframework.web.bind.annotation.RestController;
import com.example.school.system.DTO.SingleSubjectCreationDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.SubjectService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER','SUBJECTTEACHER')")
@RequestMapping("/api")
public class SubjectController {
    private SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @PostMapping("/create/subject")
    public SchoolApiResponse<?> CreateSingleSubject(
            @Valid @RequestBody SingleSubjectCreationDTO subjectCreationDTO) {
        return subjectService.createSingleSubject(subjectCreationDTO);
    }

    @PostMapping("/create/multiple/subjects")
    public SchoolApiResponse<?> createMultipleSubjects(
            @Valid @RequestBody List<SingleSubjectCreationDTO> subjects) {
        return subjectService.createMultipleSubject(subjects);
    }

    @GetMapping("/getAll/subjects")
    public String getSubjects(@RequestBody String entity) {

        return entity;
    }

}
