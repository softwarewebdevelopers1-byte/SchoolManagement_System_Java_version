package com.example.school.system.services;

import org.springframework.stereotype.Service;

import com.example.school.system.DTO.SingleSubjectCreationDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.error.SchoolResourceExistsExceptionHandler;
import com.example.school.system.repository.SubjectRepository;
import com.example.school.system.security.jwt.JwtValidation;
import com.example.school.system.models.Subject;
// import lombok.AllArgsConstructor;

@Service
// @AllArgsConstructor
public class SubjectService {
    private SubjectRepository subjectRepository;
    private JwtValidation jwtValidation;

    public SubjectService(SubjectRepository subjectRepository, JwtValidation jwtValidation) {
        this.subjectRepository = subjectRepository;
        this.jwtValidation = jwtValidation;
    }

    public SchoolApiResponse<?> createSingleSubject(SingleSubjectCreationDTO subjectCreationDTO, String token) {
        subjectValidation(subjectCreationDTO, token);
        subjectRepository.save(toSubject(subjectCreationDTO));
        return SchoolApiResponse.success(subjectCreationDTO, "Subject created successfully");
    }

    public void createMultipleSubject(SingleSubjectCreationDTO subjectCreationDTO) {
        // subjectValidation(subjectCreationDTO);
        subjectRepository.save(toSubject(subjectCreationDTO));
        SchoolApiResponse.success(subjectCreationDTO, "Subjects created successfully");
    }

    private Subject toSubject(SingleSubjectCreationDTO subjectCreationDTO) {
        Subject subject = new Subject();
        subject.setSubjectName(subjectCreationDTO.subjectName());
        return subject;
    }

    private void subjectValidation(SingleSubjectCreationDTO subjectCreationDTO, String token) {
        jwtValidation.validateTokenIssued(token);
        if (subjectRepository.existsBySubjectName(subjectCreationDTO.subjectName())) {
            throw new SchoolResourceExistsExceptionHandler("Subject with this name already exists");
        }
    }
}
