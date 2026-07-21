package com.example.school.system.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.school.system.models.Subject;

public interface SubjectRepository extends JpaRepository<Subject, Integer> {
    boolean existsBySubjectNameAndSchoolId(String subjectName, UUID schoolId);

    Optional<Subject> findBySubjectNameAndSchoolId(String subjectName, UUID schoolId);

    Optional<Subject> findByIdAndSchoolId(UUID id, UUID schoolId);
}
