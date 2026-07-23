package com.example.school.system.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.school.system.models.Marks;

public interface MarksRepo extends JpaRepository<Marks, UUID> {
    List<Marks> findAllBySubjectJointIdAndAcademicYearAndCurrentSchoolTermAndCurrentSubTerm(UUID subjectJointId,
            String academicYear, Integer currentSchoolTerm, String currentSubTerm);
}
