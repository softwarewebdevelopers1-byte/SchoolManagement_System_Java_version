package com.example.school.system.controller;

import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.CreateTeacherDTO;
import com.example.school.system.error.SchoolNotFoundExceptionHandler;
import com.example.school.system.error.UserExistsExceptionHandler;
import com.example.school.system.models.School;
import com.example.school.system.models.Teacher;
import com.example.school.system.repository.SchoolRepository;
import com.example.school.system.repository.TeacherRepository;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
public class SignUp {
    private final TeacherRepository teacherRepository;
    private final SchoolRepository schoolRepository;

    public SignUp(TeacherRepository teacherRepository, SchoolRepository schoolRepository) {
        this.teacherRepository = teacherRepository;
        this.schoolRepository = schoolRepository;
    }

    @PostMapping("/api/create-account")
    public CreateTeacherDTO createAccount(@Valid @RequestBody CreateTeacherDTO teacherDto) {
        teacherRepository.save(toTeacher(teacherDto));
        return teacherDto;
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
        teacher.setPassword(teacherCreateTeacherDTO.password());
        teacher.setSchool(findSchool);
        return teacher;
    }

}
