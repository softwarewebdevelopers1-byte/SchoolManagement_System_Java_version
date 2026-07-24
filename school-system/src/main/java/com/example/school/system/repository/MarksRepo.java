package com.example.school.system.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.school.system.models.Marks;

public interface MarksRepo extends JpaRepository<Marks, UUID> {
        List<Marks> findAllBySubjectJointIdAndAcademicYearAndCurrentSchoolTermAndCurrentSubTerm(UUID subjectJointId,
                        String academicYear, Integer currentSchoolTerm, String currentSubTerm);

        @Query("""
                        SELECT m FROM Marks m WHERE m.StudentProfile.id = :studentId
                        AND m.subjectJoint.id = :subjectJointId
                        AND m.academicYear = :year
                        AND m.currentSchoolTerm = :currentSchoolTerm
                        AND m.currentSubTerm = :currentSubTerm

                                    """)
        Optional<Marks> findByStudentProfileIdAndSubjectJointIdAndAcademicYearAndCurrentSchoolTermAndCurrentSubTerm(
                        @Param("studentId") UUID studentProfileId, @Param("subjectJointId") UUID subjectJointId,
                        @Param("year") String academicYear, @Param("currentSchoolTerm") Integer currentSchoolTerm,
                        @Param("currentSubTerm") String currentSubTerm);
}

