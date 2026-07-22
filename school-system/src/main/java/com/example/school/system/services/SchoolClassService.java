package com.example.school.system.services;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;

import com.example.school.system.DTO.SchoolClassCreateDTO;
import com.example.school.system.DTO.SchoolClassUpdate;
import com.example.school.system.DTO.UnassignClassTeacherDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.error.SchoolResourceExistsExceptionHandler;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.School;
import com.example.school.system.models.SchoolClass;
import com.example.school.system.models.TeacherProfile;
import com.example.school.system.models.Users;
import com.example.school.system.repository.SchoolClassRepository;
import com.example.school.system.repository.SchoolRepository;
import com.example.school.system.repository.TeacherProfileRepository;
import com.example.school.system.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class SchoolClassService {
    private final SchoolClassRepository schoolClassRepository;
    private final SchoolRepository schoolRepository;
    private final UserRepository userRepository;
    private final TeacherProfileRepository teacherProfileRepository;

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
        classExistenceChecker(grade, classStream, classDTO.schoolId());

        schoolClassRepository.save(toClassCreate(grade, classStream, schoolFound));
        return SchoolApiResponse.success("class created");
    }

    private void classExistenceChecker(Integer grade, String classStream, UUID schoolFound) {
        if (schoolClassRepository.existsByClassGradeAndClassStreamAndSchoolId(grade, classStream, schoolFound)) {

            throw new SchoolResourceExistsExceptionHandler("class already exists");
        }
    }

    private SchoolClass toClassCreate(Integer classGrade, String classStream, School school) {
        SchoolClass sClass = new SchoolClass();
        sClass.setClassGrade(classGrade);
        sClass.setClassStream(classStream);
        sClass.setSchool(school);
        return sClass;
    }

    @Transactional
    public SchoolApiResponse<?> updateClass(@RequestBody SchoolClassUpdate schoolClassDTO) {
        Integer grade = schoolClassDTO.grade();
        String stream = schoolClassDTO.classStream();
        UUID teacherId = schoolClassDTO.classTeacherId();

        SchoolClass schoolClass = schoolClassRepository
                .findByClassIdAndSchoolId(schoolClassDTO.classId(), schoolClassDTO.schoolId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("class not found"));
        if (!schoolClass.getClassGrade().equals(grade)
                && !schoolClass.getClassStream().equals(stream)
                && schoolClassRepository.existsByClassGradeAndClassStreamAndSchoolId(grade,
                        stream, schoolClassDTO.schoolId())) {
            throw new SchoolResourceExistsExceptionHandler("class already exists");
        }

        if (teacherId != null && schoolClass.getTeacher() != null) {
            throw new SchoolResourceExistsExceptionHandler("unassign class teacher first");
        }
        Users user = userRepository.findById(teacherId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("teacher not found"));
        TeacherProfile teacherProfile = user.getTeacherProfile();
        if (teacherProfile == null) {
            throw new SchoolResourceNotFoundExceptionHandler("teacher profile not found");
        }
        schoolClass.setTeacher(teacherProfile);
        teacherProfile.setSchoolClass(schoolClass);
        if (grade != null) {
            schoolClass.setClassGrade(schoolClassDTO.grade());
        }
        if (stream != null) {
            schoolClass.setClassStream(schoolClassDTO.classStream());
        }

        schoolClassRepository.save(schoolClass);
        teacherProfileRepository.save(teacherProfile);
        return SchoolApiResponse.success("class updated");
    }

    public SchoolApiResponse<?> unAssignClassTeacher(UnassignClassTeacherDTO unassignClassTeacherDTO) {
        SchoolClass classFound = schoolClassRepository.findByClassIdAndSchoolId(unassignClassTeacherDTO.classId(),
                unassignClassTeacherDTO.schoolId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("class not found"));
        TeacherProfile currenTeacher = classFound.getTeacher();
        if (currenTeacher == null) {
            throw new SchoolResourceNotFoundExceptionHandler("class has no assigned teacher");
        }
        currenTeacher.setSchoolClass(null);
        classFound.setTeacher(null);
        schoolClassRepository.save(classFound);
        teacherProfileRepository.save(currenTeacher);
        return SchoolApiResponse.success("class teacher unassigned");
    }
}
