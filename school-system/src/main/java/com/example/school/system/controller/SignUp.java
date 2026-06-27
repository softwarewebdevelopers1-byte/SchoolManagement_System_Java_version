package com.example.school.system.controller;

import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.CreateTeacherDTO;
import com.example.school.system.DTO.DTOResponse.TeacherResponse;
import com.example.school.system.error.SchoolNotFoundExceptionHandler;
import com.example.school.system.error.UserExistsExceptionHandler;
import com.example.school.system.models.School;
import com.example.school.system.models.Teacher;
import com.example.school.system.repository.SchoolRepository;
import com.example.school.system.repository.TeacherRepository;
import com.example.school.system.security.PasswordHashing;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
public class SignUp {
    private final TeacherRepository teacherRepository;
    private final SchoolRepository schoolRepository;
    private final TeacherResponse teacherResponse;
    private final PasswordHashing passwordHashing;

    public SignUp(TeacherRepository teacherRepository, SchoolRepository schoolRepository,
            TeacherResponse teacherResponse, PasswordHashing passwordHashing) {
        this.teacherRepository = teacherRepository;
        this.schoolRepository = schoolRepository;
        this.teacherResponse = teacherResponse;
        this.passwordHashing = passwordHashing;
    }

    @PostMapping("/api/create-account")
    public String createAccount(@Valid @RequestBody CreateTeacherDTO teacherDto) {
        teacherRepository.save(toTeacher(teacherDto));
        return teacherResponse.accountCreationResponse();
    }

    private Teacher toTeacher(CreateTeacherDTO teacherCreateTeacherDTO) {
        Teacher teacher = new Teacher();
        // check if teacher exists
        if (teacherRepository.existsByEmail(teacherCreateTeacherDTO.email())) {
            throw new UserExistsExceptionHandler("User already exists");
        }
        // check if school exists
        School findSchool = schoolRepository.findBySchoolName(teacherCreateTeacherDTO.schoolName())
                .orElseThrow(() -> new SchoolNotFoundExceptionHandler("School Not Found"));

        teacher.setFirstName(teacherCreateTeacherDTO.firstName());
        teacher.setLastName(teacherCreateTeacherDTO.lastName());
        teacher.setEmail(teacherCreateTeacherDTO.email());
        teacher.setPassword(passwordHashing.PasswordEncoder().encode(teacherCreateTeacherDTO.password()));
        teacher.setSchool(findSchool);
        return teacher;
    }
}
