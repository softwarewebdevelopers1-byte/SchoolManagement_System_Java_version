package com.example.school.system.controller;

import org.springframework.web.bind.annotation.RestController;
import com.example.school.system.DTO.SingleSubjectCreationDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.SubjectService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
public class SubjectController {
    private SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @PostMapping("api/create/subject")
    public SchoolApiResponse<?> CreateSingleSubject(@RequestBody SingleSubjectCreationDTO subjectCreationDTO) {
        return subjectService.createSingleSubject(subjectCreationDTO);
    }

    @PostMapping("api/create/multiple/subjects")
    public String createMultipleSubjects(@RequestBody String entity) {

        return entity;
    }
    @GetMapping("api/getAll/subjects")
    public String getSubjects(@RequestBody String entity) {

        return entity;
    }

}
