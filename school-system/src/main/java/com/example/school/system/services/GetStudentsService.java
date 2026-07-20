package com.example.school.system.services;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.DTO.GetAllStudentsDTO;
import com.example.school.system.DTO.GetStudentsOfSpecificClass;
import com.example.school.system.DTO.DTOResponse.GetAllStudentsDTORes;
import com.example.school.system.DTO.DTOResponse.GetStudentByClassDTO;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.StudentProfile;
import com.example.school.system.models.Users;
import com.example.school.system.repository.SchoolClassRepository;
import com.example.school.system.repository.SchoolRepository;
import com.example.school.system.repository.StudentRepository;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.types.UserRoles;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GetStudentsService {
    private final SchoolClassRepository schoolClassRepository;
    private final StudentRepository studentProfileRepo;
    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;

    @Transactional
    public List<?> getStudentByClass(GetStudentsOfSpecificClass schoolClassDTO, int page, int size) {

        schoolClassRepository.findById(schoolClassDTO.classId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("class not found"));
        size = Math.min(size, 100);
        Pageable pageable = PageRequest.of(page, size);
        Page<StudentProfile> studentProfiles = studentProfileRepo.findBySchoolClassClassId(schoolClassDTO.classId(),
                pageable);
        List<?> students = studentProfiles.stream().map(s -> {
            return GetStudentByClassDTO.builder().fullName(s.getStudentFullName()).adm(s.getStudentAdm())
                   .build();
        }).toList();
        return students;
    }

    public List<?> getAllStudents(GetAllStudentsDTO getAllStudentsDTO, int page, int size) {
        if (!schoolRepository.existsById(getAllStudentsDTO.schoolId())) {
            throw new SchoolResourceNotFoundExceptionHandler("school not found");
        }
        Pageable pageable = PageRequest.of(page, size);
        Page<Users> allStudents = userRepository.findUsersBySchoolIdWithRole(getAllStudentsDTO.schoolId(),
                UserRoles.STUDENT,
                pageable);

        return allStudents.stream().map(s -> {
            StudentProfile studentProfile = s.getStudentProfile();
            return GetAllStudentsDTORes.builder().fullName(studentProfile.getStudentFullName())
                    .adm(studentProfile.getStudentAdm()).status(s.getStatus()).userId(s.getId())
                    .email(s.getEmail())
                    .build();
        }).toList();
    }

}
