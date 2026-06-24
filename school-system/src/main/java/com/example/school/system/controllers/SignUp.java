package com.example.school.system.controllers;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.StudentDTO;
import com.example.school.system.error.DuplicateStudent;
import com.example.school.system.models.Student;
import com.example.school.system.repository.StudentRepository;

import jakarta.validation.Valid;

@RestController
public class SignUp {
    private final StudentRepository studentRepository;

    public SignUp(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @PostMapping("/create/account")
    public Student CreateAccount(@Valid @RequestBody StudentDTO studentDto) {
        Student studentSaved = toStudent(studentDto);
        studentRepository.save(studentSaved);
        return studentSaved;
    }

    public Student toStudent(StudentDTO studentDto) {
        Student studentSave = new Student();
        if (studentRepository.existsByStudentAdm(studentDto.adm())) {
            throw new DuplicateStudent("Student with this admission exists");
        }
        studentSave.setStudentAdm(studentDto.adm());
        studentSave.setFullName(studentDto.fullName());
        studentSave.setDate(studentDto.Registration());
        studentSave.setStatus(studentDto.status());
        studentSave.setPhoneNumber(studentDto.PhoneNumber());
        return studentSave;

    }
}
