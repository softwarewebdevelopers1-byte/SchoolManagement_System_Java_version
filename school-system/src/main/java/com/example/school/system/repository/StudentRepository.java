package com.example.school.system.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.school.system.models.StudentProfile;

public interface StudentRepository extends JpaRepository<StudentProfile, Long> {
    boolean existsByStudentAdm(String Adm);

    StudentProfile findByStudentAdm(String studentAdm);;
}
