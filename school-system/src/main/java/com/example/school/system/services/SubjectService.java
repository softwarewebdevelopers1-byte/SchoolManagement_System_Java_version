package com.example.school.system.services;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import org.springframework.stereotype.Service;
import com.example.school.system.DTO.SingleSubjectCreationDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.error.SchoolResourceExistsExceptionHandler;
import com.example.school.system.repository.SubjectRepository;
import com.example.school.system.models.Subject;
// import lombok.AllArgsConstructor;

@Service
// @AllArgsConstructor
public class SubjectService {
    private SubjectRepository subjectRepository;

    public SubjectService(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    public SchoolApiResponse<?> createSingleSubject(SingleSubjectCreationDTO subjectCreationDTO) {
        subjectValidation(subjectCreationDTO);
        subjectRepository.save(toSubject(subjectCreationDTO));
        return SchoolApiResponse.success(subjectCreationDTO, "Subject created successfully");
    }

    public SchoolApiResponse<?> createMultipleSubject(List<SingleSubjectCreationDTO> multipleSubjectCreation) {
        return multipleSubjectValidation(multipleSubjectCreation);
    }

    private Subject toSubject(SingleSubjectCreationDTO subjectCreationDTO) {
        Subject subject = new Subject();
        subject.setSubjectName(subjectCreationDTO.subjectName());
        subject.setSubjectType(subjectCreationDTO.subjectType());
        return subject;
    }

    private void subjectValidation(SingleSubjectCreationDTO subjectCreationDTO) {
        if (subjectRepository.existsBySubjectName(subjectCreationDTO.subjectName())) {
            throw new SchoolResourceExistsExceptionHandler("Subject with this name already exists");
        }
    }

    private SchoolApiResponse<?> multipleSubjectValidation(List<SingleSubjectCreationDTO> subjects) {
        HashSet<String> seenInRequest = new HashSet<>();
        List<String> skipped = new ArrayList<>();
        List<Subject> savedSubjects = new ArrayList<>();

        for (int i = 0; i < subjects.size(); i++) {
            String key = subjects.get(i).subjectName().toLowerCase();
            SingleSubjectCreationDTO subjectCreationDTO = subjects.get(i);
            if (!seenInRequest.add(key)) {
                skipped.add(key);
                continue;
            }
            if (subjectRepository.existsBySubjectName(subjects.get(i).subjectName())) {
                skipped.add(key);
                continue;
            }
            savedSubjects.add(toSubject(subjectCreationDTO));
        }
        subjectRepository.saveAll(savedSubjects);
        return SchoolApiResponse.success(skipped, "checkout the skipped subjects in data object above");
    }
}