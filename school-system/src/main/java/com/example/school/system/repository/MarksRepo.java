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
import com.example.school.system.projection.AtRiskStudentProjection;
import com.example.school.system.projection.GradeBandCountProjection;
import com.example.school.system.projection.SubjectAnalyticsGradeProjection;
import com.example.school.system.projection.SubjectAnalyticsProjection;
import com.example.school.system.projection.SubjectGradeDistributionProjection;
import com.example.school.system.projection.TermlyTrendProjection;
import com.example.school.system.projection.StudentPerformanceProjection;

public interface MarksRepo extends JpaRepository<MarksRow, UUID> {
        @Query(value = """
                SELECT sp.student_id AS studentId,
                       sp.student_name AS studentName,
                       sp.student_adm AS admissionNo,
                       c.stream AS stream,
                       SUM(m.`average_marks%`) AS totalMarks,
                       SUM(m.points) AS points,
                       COUNT(m.id) AS scoredSubjects,
                       AVG(m.`average_marks%`) AS average
                FROM marks m
                JOIN marks_sheet ms ON m.marks_sheet_id = ms.id
                JOIN subject_joint sj ON ms.subject_joint_id = sj.id
                JOIN students_profile sp ON m.student_id = sp.student_id
                JOIN classes c ON sp.class_id = c.class_id
                WHERE sj.class_id = :classId
                  AND ms.academic_year = :academicYear
                  AND ms.current_school_term = :term
                  AND ms.exam_type = :examType
                  AND ms.status = 'SUBMITTED'
                GROUP BY sp.student_id, sp.student_name, sp.student_adm, c.stream
                ORDER BY sp.student_name ASC
                """, nativeQuery = true)
        List<StudentPerformanceProjection> findStudentPerformanceByClass(
                @Param("classId") UUID classId,
                @Param("academicYear") String academicYear,
                @Param("term") Integer term,
                @Param("examType") String examType);

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
                    AVG(m.`average_marks%`) AS avgPercentage,
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
                    AVG(m.`average_marks%`) AS avgPercentage,
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

        @Query(value = """
                SELECT
                    s.id AS subjectId,
                    s.subject_name AS subjectName,
                    c.stream AS stream,
                    AVG(m.`average_marks%`) AS avgPercentage,
                    AVG(m.points) AS avgPoints,
                    COUNT(m.id) AS studentCount
                FROM marks m
                JOIN marks_sheet ms ON m.marks_sheet_id = ms.id
                JOIN subject_joint sj ON ms.subject_joint_id = sj.id
                JOIN subjects s ON sj.subject_id = s.id
                JOIN classes c ON sj.class_id = c.class_id
                WHERE c.grade = :grade
                  AND c.stream IS NOT NULL
                  AND ms.academic_year = :academicYear
                  AND ms.current_school_term = :term
                  AND ms.exam_type = :examType
                  AND ms.status = 'SUBMITTED'
                GROUP BY s.id, s.subject_name, c.stream
                """, nativeQuery = true)
        List<SubjectAnalyticsGradeProjection> findSubjectAnalyticsByGrade(
                @Param("grade") String grade,
                @Param("academicYear") String academicYear,
                @Param("term") Integer term,
                @Param("examType") String examType);

        @Query(value = """
                SELECT
                    s.id AS subjectId,
                    s.subject_name AS subjectName,
                    AVG(m.`average_marks%`) AS avgPercentage,
                    AVG(m.points) AS avgPoints,
                    COUNT(m.id) AS studentCount,
                    m.grade AS grade,
                    COUNT(m.id) AS count
                FROM marks m
                JOIN marks_sheet ms ON m.marks_sheet_id = ms.id
                JOIN subject_joint sj ON ms.subject_joint_id = sj.id
                JOIN subjects s ON sj.subject_id = s.id
                JOIN classes c ON sj.class_id = c.class_id
                WHERE c.grade = :grade
                  AND c.stream IS NOT NULL
                  AND ms.academic_year = :academicYear
                  AND ms.current_school_term = :term
                  AND ms.exam_type = :examType
                  AND ms.status = 'SUBMITTED'
                  AND m.grade IS NOT NULL
                GROUP BY s.id, s.subject_name, m.grade
                """, nativeQuery = true)
        List<SubjectGradeDistributionProjection> findSubjectGradeDistributionByGrade(
                @Param("grade") String grade,
                @Param("academicYear") String academicYear,
                @Param("term") Integer term,
                @Param("examType") String examType);

        @Query(value = """
                SELECT
                    s.id AS subjectId,
                    s.subject_name AS subjectName,
                    AVG(m.`average_marks%`) AS avgPercentage,
                    AVG(m.points) AS avgPoints,
                    COUNT(m.id) AS studentCount,
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
                GROUP BY s.id, s.subject_name, m.grade
                """, nativeQuery = true)
        List<SubjectGradeDistributionProjection> findSubjectGradeDistributionByClassDetailed(
                @Param("classId") UUID classId,
                @Param("academicYear") String academicYear,
                @Param("term") Integer term,
                @Param("examType") String examType);

        @Query(value = """
                SELECT
                    m.grade AS grade,
                    COUNT(m.id) AS count
                FROM marks m
                JOIN marks_sheet ms ON m.marks_sheet_id = ms.id
                JOIN subject_joint sj ON ms.subject_joint_id = sj.id
                WHERE sj.class_id = :classId
                  AND ms.academic_year = :academicYear
                  AND ms.current_school_term = :term
                  AND ms.exam_type = :examType
                  AND ms.status = 'SUBMITTED'
                  AND m.grade IS NOT NULL
                GROUP BY m.grade
                """, nativeQuery = true)
        List<GradeBandCountProjection> findGradeBandCountsByClass(
                @Param("classId") UUID classId,
                @Param("academicYear") String academicYear,
                @Param("term") Integer term,
                @Param("examType") String examType);

        @Query(value = """
                SELECT
                    m.grade AS grade,
                    COUNT(m.id) AS count
                FROM marks m
                JOIN marks_sheet ms ON m.marks_sheet_id = ms.id
                JOIN subject_joint sj ON ms.subject_joint_id = sj.id
                JOIN classes c ON sj.class_id = c.class_id
                WHERE c.grade = :grade
                  AND c.stream IS NOT NULL
                  AND ms.academic_year = :academicYear
                  AND ms.current_school_term = :term
                  AND ms.exam_type = :examType
                  AND ms.status = 'SUBMITTED'
                  AND m.grade IS NOT NULL
                GROUP BY m.grade
                """, nativeQuery = true)
        List<GradeBandCountProjection> findGradeBandCountsByGrade(
                @Param("grade") String grade,
                @Param("academicYear") String academicYear,
                @Param("term") Integer term,
                @Param("examType") String examType);

        @Query(value = """
                SELECT
                    ms.current_school_term AS term,
                    AVG(m.`average_marks%`) AS avgPercentage,
                    AVG(m.points) AS avgPoints,
                    COUNT(DISTINCT m.student_id) AS studentCount
                FROM marks m
                JOIN marks_sheet ms ON m.marks_sheet_id = ms.id
                JOIN subject_joint sj ON ms.subject_joint_id = sj.id
                WHERE sj.class_id = :classId
                  AND ms.academic_year = :academicYear
                  AND ms.status = 'SUBMITTED'
                GROUP BY ms.current_school_term
                ORDER BY ms.current_school_term ASC
                """, nativeQuery = true)
        List<TermlyTrendProjection> findTermlyTrendByClass(
                @Param("classId") UUID classId,
                @Param("academicYear") String academicYear);

        @Query(value = """
                SELECT
                    ms.current_school_term AS term,
                    AVG(m.`average_marks%`) AS avgPercentage,
                    AVG(m.points) AS avgPoints,
                    COUNT(DISTINCT m.student_id) AS studentCount
                FROM marks m
                JOIN marks_sheet ms ON m.marks_sheet_id = ms.id
                JOIN subject_joint sj ON ms.subject_joint_id = sj.id
                JOIN classes c ON sj.class_id = c.class_id
                WHERE c.grade = :grade
                  AND ms.academic_year = :academicYear
                  AND ms.status = 'SUBMITTED'
                GROUP BY ms.current_school_term
                ORDER BY ms.current_school_term ASC
                """, nativeQuery = true)
        List<TermlyTrendProjection> findTermlyTrendByGrade(
                @Param("grade") String grade,
                @Param("academicYear") String academicYear);

        @Query(value = """
                SELECT
                    sp.student_id AS studentId,
                    sp.student_name AS studentName,
                    sp.student_adm AS admissionNo,
                    AVG(m.`average_marks%`) AS avgPercentage
                FROM marks m
                JOIN marks_sheet ms ON m.marks_sheet_id = ms.id
                JOIN students_profile sp ON m.student_id = sp.student_id
                WHERE sp.class_id = :classId
                  AND ms.academic_year = :academicYear
                  AND ms.status = 'SUBMITTED'
                  AND m.`average_marks%` IS NOT NULL
                GROUP BY sp.student_id, sp.student_name, sp.student_adm
                HAVING AVG(m.`average_marks%`) < :threshold
                ORDER BY avgPercentage ASC
                """, nativeQuery = true)
        List<AtRiskStudentProjection> findAtRiskStudentsByClass(
                @Param("classId") UUID classId,
                @Param("academicYear") String academicYear,
                @Param("threshold") double threshold);

        @Query(value = """
                SELECT
                    sp.student_id AS studentId,
                    sp.student_name AS studentName,
                    sp.student_adm AS admissionNo,
                    AVG(m.`average_marks%`) AS avgPercentage
                FROM marks m
                JOIN marks_sheet ms ON m.marks_sheet_id = ms.id
                JOIN students_profile sp ON m.student_id = sp.student_id
                WHERE sp.class_id IN (
                    SELECT c.class_id FROM classes c WHERE c.school = :schoolId AND c.grade = :grade
                )
                  AND ms.academic_year = :academicYear
                  AND ms.status = 'SUBMITTED'
                  AND m.`average_marks%` IS NOT NULL
                GROUP BY sp.student_id, sp.student_name, sp.student_adm
                HAVING AVG(m.`average_marks%`) < :threshold
                ORDER BY avgPercentage ASC
                """, nativeQuery = true)
        List<AtRiskStudentProjection> findAtRiskStudentsByGrade(
                @Param("schoolId") UUID schoolId,
                @Param("grade") String grade,
                @Param("academicYear") String academicYear,
                @Param("threshold") double threshold);
}


