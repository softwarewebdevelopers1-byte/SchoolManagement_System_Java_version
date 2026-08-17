package com.example.school.system.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.school.system.models.MarksSheet;
import com.example.school.system.types.ExamType;
import com.example.school.system.types.MarksSheetStatus;

public interface MarksSheetRepo extends JpaRepository<MarksSheet, UUID> {
        Optional<MarksSheet> findBySubjectJointIdAndAcademicYearAndCurrentSchoolTermAndExamType(UUID subjectJointId,
                        String academicYear, Integer currentSchoolTerm, ExamType examType);

        Integer countByClassIdAndAcademicYearAndCurrentSchoolTermAndExamTypeAndStatus(UUID classId,
                        String academicYear, Integer currentSchoolTerm, ExamType examType, MarksSheetStatus status);

        List<MarksSheet> findAllByClassIdAndAcademicYearAndCurrentSchoolTermAndExamTypeAndStatus(UUID classId,
                        String academicYear, Integer currentSchoolTerm, ExamType examType, MarksSheetStatus status);

        List<MarksSheet> findAllBySchoolIdAndAcademicYearAndCurrentSchoolTermAndExamTypeAndStatus(UUID schoolId,
                        String academicYear, Integer currentSchoolTerm, ExamType examType,MarksSheetStatus status);

}
