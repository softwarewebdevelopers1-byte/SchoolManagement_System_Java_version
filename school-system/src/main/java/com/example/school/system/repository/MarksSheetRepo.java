package com.example.school.system.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.school.system.models.MarksSheet;

public interface MarksSheetRepo extends JpaRepository<MarksSheet, UUID> {
    Optional<MarksSheet> findBySubjectJointIdAndAcademicYearAndCurrentSchoolTermAndCurrentSubTerm(UUID subjectJointId,
            String academicYear, Integer currentSchoolTerm, String currentSubTerm);
}
