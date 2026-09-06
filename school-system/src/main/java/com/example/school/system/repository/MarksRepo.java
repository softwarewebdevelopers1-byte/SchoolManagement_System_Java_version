package com.example.school.system.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.school.system.models.MarksRow;
import com.example.school.system.projection.SubjectAnalyticsProjection;
import com.example.school.system.projection.SubjectGradeDistributionProjection;

public interface MarksRepo extends JpaRepository<MarksRow, UUID> {
        @Query("""
                        SELECT m FROM MarksRow m WHERE m.StudentProfile.id = :studentId
                        AND m.marksSheet.id = :marksSheetId

                                    """)
        @EntityGraph(attributePaths = { "marksSheet", "marksSheet.subjectJoint", "marksSheet.subjectJoint.schoolClass", "marksSheet.subjectJoint.subject" })
        Optional<MarksRow> findByStudentProfileIdAndMarksSheetId(
                        @Param("studentId") UUID studentProfileId, @Param("marksSheetId") UUID marksSheetId);

        @EntityGraph(attributePaths = { "StudentProfile", "marksSheet", "marksSheet.subjectJoint", "marksSheet.subjectJoint.schoolClass", "marksSheet.subjectJoint.subject" })
        List<MarksRow> findAllByMarksSheetId(UUID sheetId);

        @EntityGraph(attributePaths = { "StudentProfile", "marksSheet", "marksSheet.subjectJoint", "marksSheet.subjectJoint.schoolClass", "marksSheet.subjectJoint.subject" })
        Page<MarksRow> findAllByMarksSheetId(UUID sheetId, Pageable pageable);

        @EntityGraph(attributePaths = { "marksSheet", "marksSheet.subjectJoint", "marksSheet.subjectJoint.schoolClass", "marksSheet.subjectJoint.subject" })
        List<MarksRow> findByStudentProfileId(UUID studentProfileId);

        @Query(value = """
                SELECT
                    s.id AS subjectId,
                    s.subject_name AS subjectName,
                    AVG(m.average_marks_percentage) AS avgPercentage,
                    AVG(m.points) AS avgPoints,
                    COUNT(m.id) AS studentCount
                FROM marks m
                JOIN marks_sheet ms ON m.marks_sheet_id = ms.id
                JOIN subject_joint sj ON ms.subject_joint_id = sj.id
                JOIN subjects s ON sj.subject_id = s.id
                WHERE sj.class_id = :classId
                  AND ms.academic_year = :academicYear
                  AND ms.current_school_term = :term
                  AND ms.exam_type = :examType
                  AND ms.status = 'SUBMITTED'
                GROUP BY s.id, s.subject_name
                """, nativeQuery = true)
        List<SubjectAnalyticsProjection> findSubjectAnalyticsByClass(
                @Param("classId") UUID classId,
                @Param("academicYear") String academicYear,
                @Param("term") Integer term,
                @Param("examType") String examType);

        @Query(value = """
                SELECT
                    s.id AS subjectId,
                    m.grade AS grade,
                    COUNT(m.id) AS count
                FROM marks m
                JOIN marks_sheet ms ON m.marks_sheet_id = ms.id
                JOIN subject_joint sj ON ms.subject_joint_id = sj.id
                JOIN subjects s ON sj.subject_id = s.id
                WHERE sj.class_id = :classId
                  AND ms.academic_year = :academicYear
                  AND ms.current_school_term = :term
                  AND ms.exam_type = :examType
                  AND ms.status = 'SUBMITTED'
                  AND m.grade IS NOT NULL
                GROUP BY s.id, m.grade
                """, nativeQuery = true)
        List<SubjectGradeDistributionProjection> findSubjectGradeDistributionByClass(
                @Param("classId") UUID classId,
                @Param("academicYear") String academicYear,
                @Param("term") Integer term,
                @Param("examType") String examType);

        @Query(value = """
                SELECT
                    s.id AS subjectId,
                    s.subject_name AS subjectName,
                    AVG(m.average_marks_percentage) AS avgPercentage,
                    AVG(m.points) AS avgPoints
                FROM marks m
                JOIN marks_sheet ms ON m.marks_sheet_id = ms.id
                JOIN subject_joint sj ON ms.subject_joint_id = sj.id
                JOIN subjects s ON sj.subject_id = s.id
                WHERE s.school_id = :schoolId
                  AND ms.academic_year = :academicYear
                  AND ms.current_school_term = :term
                  AND ms.exam_type = :examType
                  AND ms.status = 'SUBMITTED'
                GROUP BY s.id, s.subject_name
                """, nativeQuery = true)
        List<SubjectAnalyticsProjection> findSubjectPerformanceBySchool(
                @Param("schoolId") UUID schoolId,
                @Param("academicYear") String academicYear,
                @Param("term") Integer term,
                @Param("examType") String examType);
}


