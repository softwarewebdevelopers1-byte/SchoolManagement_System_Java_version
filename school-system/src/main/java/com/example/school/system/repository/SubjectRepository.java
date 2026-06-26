package com.example.school.system.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.school.system.models.Subject;

public interface SubjectRepository extends JpaRepository<Subject, Integer> {
    boolean existsBySubjectName(String subjectName);

    Subject findBySubjectName(String subjectName);
}
