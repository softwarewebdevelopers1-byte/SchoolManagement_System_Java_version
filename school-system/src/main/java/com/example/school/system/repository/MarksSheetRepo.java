package com.example.school.system.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.school.system.models.MarksSheet;
import com.example.school.system.types.ExamType;

public interface MarksSheetRepo extends JpaRepository<MarksSheet, UUID> {
    Optional<MarksSheet> findBySubjectJointIdAndAcademicYearAndCurrentSchoolTermAndExamSettingsExamType(UUID subjectJointId,
            String academicYear, Integer currentSchoolTerm, ExamType examType);
}
