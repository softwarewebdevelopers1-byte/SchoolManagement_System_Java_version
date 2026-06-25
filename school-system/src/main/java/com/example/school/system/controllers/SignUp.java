package com.example.school.system.controllers;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.RegisterStudentDTO;
import com.example.school.system.configs.PasswordHashing;
import com.example.school.system.error.DuplicateStudent;
import com.example.school.system.models.Student;
import com.example.school.system.repository.StudentRepository;

import jakarta.validation.Valid;

@RestController
public class SignUp {
    private final StudentRepository studentRepository;
    private final PasswordHashing passwordHashing;

    public SignUp(StudentRepository studentRepository, PasswordHashing passwordHashing) {
        this.studentRepository = studentRepository;
        this.passwordHashing = passwordHashing;
    }

    @PostMapping("/create/account")
    public Student CreateAccount(@Valid @RequestBody RegisterStudentDTO studentDto) {
        if (studentRepository.existsByStudentAdm(studentDto.adm())) {
            throw new DuplicateStudent("Student with this admission exists");
        }
        Student studentSaved = toStudent(studentDto);
        studentRepository.save(studentSaved);
        return studentSaved;
    }

    public Student toStudent(RegisterStudentDTO studentDto) {
        Student studentSave = new Student();
        studentSave.setStudentAdm(studentDto.adm());
        studentSave.setPassword(passwordHashing.passwordEncoder().encode(studentDto.password()));
        studentSave.setFullName(studentDto.fullName());
        studentSave.setStatus(studentDto.status());
        studentSave.setPhoneNumber(studentDto.PhoneNumber());
        return studentSave;

    }
}
