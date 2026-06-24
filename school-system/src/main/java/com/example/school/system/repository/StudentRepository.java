package com.example.school.system.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.school.system.models.Student;

public interface StudentRepository extends JpaRepository<Student, Long> {
}
