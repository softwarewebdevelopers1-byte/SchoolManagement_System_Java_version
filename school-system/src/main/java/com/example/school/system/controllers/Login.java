package com.example.school.system.controllers;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.LoggingUserDTO;
import com.example.school.system.DTO.StudentResponse;
import com.example.school.system.configs.PasswordHashing;
import com.example.school.system.error.UnauthorizedUser;
import com.example.school.system.models.Student;
import com.example.school.system.repository.StudentRepository;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PostMapping;

@RestController
public class Login {
    public final StudentRepository studentRepository;
    private final PasswordHashing passwordHashing;

    public Login(StudentRepository studentRepository, PasswordHashing passwordHashing) {
        this.studentRepository = studentRepository;
        this.passwordHashing = passwordHashing;
    }

    @PostMapping("/login/user")
    private StudentResponse LoginUser(@Valid @RequestBody LoggingUserDTO loggingUserDTO) {
        String errorMessage = "Invalid credentials";
        Student student = studentRepository.findByStudentAdm(loggingUserDTO.adm())
                .orElseThrow(() -> new UnauthorizedUser("User not found !"));

        boolean passwordMatching = passwordHashing.passwordEncoder().matches(loggingUserDTO.password(),
                student.getPassword());
        if (!passwordMatching) {
            throw new UnauthorizedUser(errorMessage);
        }
        return new StudentResponse(student.getFullName(), student.getStudentAdm());
    }
}
