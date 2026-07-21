package com.example.school.system.services;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import org.springframework.stereotype.Service;
import com.example.school.system.DTO.SubjectDTO;
import com.example.school.system.DTO.SubjectUpdateDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.error.SchoolResourceExistsExceptionHandler;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.repository.SchoolRepository;
import com.example.school.system.repository.SubjectRepository;

import lombok.RequiredArgsConstructor;

import com.example.school.system.models.School;
import com.example.school.system.models.Subject;
// import lombok.AllArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubjectService {
    private final SubjectRepository subjectRepository;
    private final SchoolRepository schoolRepository;

    public SchoolApiResponse<?> createSingleSubject(SubjectDTO subjectCreationDTO) {
        subjectRepository.save(toSubject(subjectCreationDTO));
        return SchoolApiResponse.success(subjectCreationDTO, "Subject created successfully");
    }

    public SchoolApiResponse<?> createMultipleSubject(List<SubjectDTO> multipleSubjectCreation) {
        return multipleSubjectValidation(multipleSubjectCreation);
    }

    private Subject toSubject(SubjectDTO subjectCreationDTO) {
        School school = subjectValidation(subjectCreationDTO);
        Subject subject = new Subject();
        subject.setSubjectName(subjectCreationDTO.subjectName());
        subject.setSchool(school);
        return subject;
    }

    private School subjectValidation(SubjectDTO subjectCreationDTO) {
        if (subjectRepository.existsBySubjectNameAndSchoolId(subjectCreationDTO.subjectName(),
                subjectCreationDTO.schoolId())) {
            throw new SchoolResourceExistsExceptionHandler("subject already exists");
        }
        return schoolRepository.findById(subjectCreationDTO.schoolId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school not found"));
    }

    public SchoolApiResponse<?> updateSubject(SubjectUpdateDTO subjectDTO) {
        String subjectName = subjectDTO.subjectName().trim().toLowerCase();
        Subject subjectToUpdate = subjectRepository.findByIdAndSchoolId(subjectDTO.subjectId(),
                subjectDTO.schoolId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("subject not found"));
        if (!subjectName.equals(subjectToUpdate.getSubjectName()) && subjectName != null
                && subjectRepository.existsBySubjectNameAndSchoolId(subjectName, subjectDTO.schoolId())) {
            throw new SchoolResourceExistsExceptionHandler("subject already exists");
        }
        subjectToUpdate.setSubjectName(subjectName);
        subjectRepository.save(subjectToUpdate);
        return SchoolApiResponse.success("subject updated");
    }

    // public SchoolApiResponse<?> deleteSubject(SubjectUpdateDTO subjectDTO) {
    // String subjectName = subjectDTO.subjectName().trim().toLowerCase();
    // Subject subjectToUpdate =
    // subjectRepository.findByIdAndSchoolId(subjectDTO.subjectId(),
    // subjectDTO.schoolId())
    // .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("subject not
    // found"));
    // if (!subjectName.equals(subjectToUpdate.getSubjectName()) && subjectName !=
    // null
    // && subjectRepository.existsBySubjectNameAndSchoolId(subjectName,
    // subjectDTO.schoolId())) {
    // throw new SchoolResourceExistsExceptionHandler("subject already exists");
    // }
    // subjectToUpdate.setSubjectName(subjectName);
    // subjectRepository.save(subjectToUpdate);
    // return SchoolApiResponse.success("subject updated");
    // }

    private SchoolApiResponse<?> multipleSubjectValidation(List<SubjectDTO> subjects) {
        HashSet<String> seenInRequest = new HashSet<>();
        List<String> skipped = new ArrayList<>();
        List<Subject> savedSubjects = new ArrayList<>();

        for (int i = 0; i < subjects.size(); i++) {
            String key = subjects.get(i).subjectName().toLowerCase();
            SubjectDTO subjectCreationDTO = subjects.get(i);
            if (!seenInRequest.add(key)) {
                skipped.add(key);
                continue;
            }
            if (subjectRepository.existsBySubjectNameAndSchoolId(subjects.get(i).subjectName(),
                    subjects.get(i).schoolId())) {
                skipped.add(key);
                continue;
            }
            savedSubjects.add(toSubject(subjectCreationDTO));
        }
        subjectRepository.saveAll(savedSubjects);
        return SchoolApiResponse.success(skipped, "checkout the skipped subjects in data object above");
    }
}