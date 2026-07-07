package com.example.school.system.controller;

import org.springframework.web.bind.annotation.RestController;
import com.example.school.system.DTO.SingleSubjectCreationDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.SubjectService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
public class SubjectController {
    private SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @PostMapping("api/create/subject")
    public SchoolApiResponse<?> CreateSingleSubject(@RequestHeader("Authorization") String header,
            @Valid @RequestBody SingleSubjectCreationDTO subjectCreationDTO) {
        String authHeader = header;
        return subjectService.createSingleSubject(subjectCreationDTO, authHeader);
    }

    @PostMapping("api/create/multiple/subjects")
    public SchoolApiResponse<?> createMultipleSubjects(@RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody List<SingleSubjectCreationDTO> subjects) {
        return subjectService.createMultipleSubject(subjects, authHeader);
    }

    @GetMapping("/getAll/subjects")
    public String getSubjects(@RequestBody String entity) {

        return entity;
    }

}
