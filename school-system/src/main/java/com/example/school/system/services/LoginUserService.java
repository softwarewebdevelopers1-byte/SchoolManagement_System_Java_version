package com.example.school.system.services;

import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import com.example.school.system.DTO.LoginTeacherDTO;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.Teacher;
import com.example.school.system.repository.TeacherRepository;
import com.example.school.system.security.PasswordHashing;
import jakarta.validation.Valid;

@Service
@Validated
public class LoginUserService {
    private final TeacherRepository teacherRepository;
    private final PasswordHashing passwordHashing;

    public LoginUserService(TeacherRepository teacherRepo, PasswordHashing passwordHashing) {
        this.teacherRepository = teacherRepo;
        this.passwordHashing = passwordHashing;
    }

    public String LoginUser(@Valid LoginTeacherDTO teacherDTO) {
        var message = "Invalid email or password";
        if (!teacherRepository.existsByEmail(teacherDTO.email())) {
            throw new SchoolResourceNotFoundExceptionHandler(message);
        }
        Teacher teacherFound = teacherRepository.findByEmail(teacherDTO.email());
        if (!passwordHashing.PasswordEncoder().matches( teacherDTO.password(),teacherFound.getPassword())) {
            throw new SchoolResourceNotFoundExceptionHandler(message);

        }
        return teacherDTO.email();

    }
}
