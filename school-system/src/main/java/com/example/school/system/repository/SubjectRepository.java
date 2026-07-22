package com.example.school.system.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.school.system.models.Subject;

public interface SubjectRepository extends JpaRepository<Subject, UUID> {
    boolean existsBySubjectNameAndSchoolId(String subjectName, UUID schoolId);

    Optional<Subject> findBySubjectNameAndSchoolId(String subjectName, UUID schoolId);

    List<Subject> findAllBySchoolId(UUID schoolId);

    Optional<Subject> findByIdAndSchoolId(UUID id, UUID schoolId);

}
