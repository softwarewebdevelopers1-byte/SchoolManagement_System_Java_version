package com.example.school.system.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.school.system.models.SchoolClass;

public interface GradeRepository extends JpaRepository<SchoolClass, Integer> {
    boolean existsByClassId(Integer classId);

    SchoolClass findByClassStream(String classStream);

    SchoolClass findByClassGrade(Integer classGrade);
}
