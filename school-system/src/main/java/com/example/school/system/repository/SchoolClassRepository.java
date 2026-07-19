package com.example.school.system.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.school.system.models.School;
import com.example.school.system.models.SchoolClass;

public interface SchoolClassRepository extends JpaRepository<SchoolClass, UUID> {
    boolean existsByClassId(Integer classId);

    SchoolClass findByClassStream(String classStream);

    SchoolClass findByClassGrade(Integer classGrade);

    SchoolClass findByClassGradeAndClassStream(Integer classGrade, String classStream);

    
    boolean existsByClassGradeAndClassStreamAndSchool(Integer classGrade, String classStream,School school);
}
