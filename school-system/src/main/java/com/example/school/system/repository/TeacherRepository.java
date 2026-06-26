package com.example.school.system.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.school.system.models.Teacher;


public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    boolean existsByEmail(String email);
    Teacher  findByEmail(String email);
}
