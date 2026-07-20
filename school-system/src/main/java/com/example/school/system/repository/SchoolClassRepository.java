package com.example.school.system.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.school.system.models.SchoolClass;

public interface SchoolClassRepository extends JpaRepository<SchoolClass, UUID> {
    boolean existsByClassId(Integer classId);

    SchoolClass findByClassStream(String classStream);

    SchoolClass findByClassGrade(Integer classGrade);

    SchoolClass findByClassGradeAndClassStream(Integer classGrade, String classStream);

    Optional<SchoolClass> findByClassIdAndSchoolId(UUID classId, UUID schoolId);

    Optional<SchoolClass> findByClassId(UUID classId);

    boolean existsByClassGradeAndClassStreamAndSchoolId(Integer classGrade, String classStream, UUID schoolId);
}
