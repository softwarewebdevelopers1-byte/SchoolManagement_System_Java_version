package com.example.school.system.services;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.school.system.DTO.SchoolClassCreateDTO;
import com.example.school.system.DTO.SchoolClassUpdate;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.error.SchoolResourceExistsExceptionHandler;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.error.jwt.SchoolResourceLockedExceptionHandler;
import com.example.school.system.models.School;
import com.example.school.system.models.SchoolClass;
import com.example.school.system.repository.SchoolClassRepository;
import com.example.school.system.repository.SchoolRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class SchoolClassService {
    private final SchoolClassRepository schoolClassRepository;
    private final SchoolRepository schoolRepository;

    @Transactional
    public SchoolApiResponse<?> updateSchoolClassCycle(UUID schoolId) {
        School schoolFound = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school not found"));

        List<SchoolClass> classes = schoolFound.getClasses();
        if (!classes.isEmpty()) {
            classes.stream().forEach(c -> {
                c.setClassGrade(c.getClassGrade() + 1);
                c.setUpdatedAt(LocalDate.now());

            });
        }
        schoolFound.setClasses(classes);
        return SchoolApiResponse.success("classes updated");
    }

    public SchoolApiResponse<?> createClass(SchoolClassCreateDTO classDTO) {
        Integer grade = classDTO.grade();
        String classStream = classDTO.classStream();
        School schoolFound = schoolRepository.findById(classDTO.schoolId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school not found"));

        if (schoolClassRepository.existsByClassGradeAndClassStreamAndSchool(grade, classStream, schoolFound)) {

            throw new SchoolResourceExistsExceptionHandler("class already exists");
        }
        schoolClassRepository.save(toClassCreate(grade, classStream, schoolFound));
        return SchoolApiResponse.success("class created");
    }

    private SchoolClass toClassCreate(Integer classGrade, String classStream, School school) {
        SchoolClass sClass = new SchoolClass();
        sClass.setClassGrade(classGrade);
        sClass.setClassStream(classStream);
        sClass.setSchool(school);
        return sClass;
    }

    public SchoolApiResponse<?> updateClass(SchoolClassUpdate schoolClassDTO) {
        SchoolClass schoolClass = schoolClassRepository.findById(schoolClassDTO.classId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("class not found"));
        if (!schoolClassDTO.schoolId().equals(schoolClass.getSchool().getId())) {
            throw new SchoolResourceLockedExceptionHandler("Restricted from updating this class");
        }
        Integer grade = schoolClassDTO.grade();
        String stream = schoolClassDTO.classStream();
        if (grade != null) {
            schoolClass.setClassGrade(schoolClassDTO.grade());
        }
        if (stream != null) {
            schoolClass.setClassStream(schoolClassDTO.classStream());
        }
        schoolClassRepository.save(schoolClass);
        return SchoolApiResponse.success("class updated");
    }
    public void deleteClass() {
    }
}
