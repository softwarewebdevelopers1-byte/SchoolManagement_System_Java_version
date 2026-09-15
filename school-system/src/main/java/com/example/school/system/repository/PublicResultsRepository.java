package com.example.school.system.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import com.example.school.system.projection.PublicResultRow;

public interface PublicResultsRepository extends Repository<com.example.school.system.models.MarksRow, UUID> {
    @Query(value = """
            SELECT
                sp.student_id AS studentId,
                sp.student_name AS studentName,
                sp.student_adm AS studentAdm,
                c.grade AS classGrade,
                c.stream AS classStream,
                s.school_name AS schoolName,
                s.email AS schoolEmail,
                s.motto AS schoolMotto,
                s.phone AS schoolPhone,
                ctr.academic_year AS academicYear,
                ctr.current_school_term AS term,
                CASE ctr.exam_type
                    WHEN 0 THEN 'OPENER'
                    WHEN 1 THEN 'MIDTERM'
                    WHEN 2 THEN 'ENDTERM'
                END AS examType,
                ctr.grade AS overallGrade,
                ctr.total_marks AS overallTotalMarks,
                ctr.class_position AS position,
                (SELECT COUNT(*) FROM students_profile classmates WHERE classmates.class_id = c.class_id) AS totalStudents,
                subject.id AS subjectId,
                subject.subject_name AS subjectName,
                m.`average_marks%` AS score,
                m.grade AS subjectGrade,
                m.points AS points,
                CONCAT(COALESCE(tp.first_name, ''), ' ', COALESCE(tp.last_name, '')) AS teacherName
            FROM class_term_result ctr
            JOIN students_profile sp ON sp.student_id = ctr.student_profile_student_id
            LEFT JOIN classes c ON c.class_id = sp.class_id
            LEFT JOIN schools s ON s.id = c.school
            LEFT JOIN marks m ON m.student_id = sp.student_id
            LEFT JOIN marks_sheet ms ON ms.id = m.marks_sheet_id
                AND ms.academic_year = ctr.academic_year
                AND ms.current_school_term = ctr.current_school_term
                AND ms.exam_type = ctr.exam_type
                AND ms.status = 'SUBMITTED'
            LEFT JOIN subject_joint sj ON sj.id = ms.subject_joint_id
            LEFT JOIN subjects subject ON subject.id = sj.subject_id
            LEFT JOIN teachers_profile tp ON tp.id = COALESCE(sj.teacher_profile_id, subject.main_teacher_id)
            WHERE ctr.student_profile_student_id = :studentId
              AND ctr.academic_year = :academicYear
              AND ctr.current_school_term = :term
              AND ctr.exam_type = :examType
              AND ctr.published = true
              AND (ms.id IS NOT NULL OR m.id IS NULL)
            ORDER BY subject.subject_name ASC
            """, nativeQuery = true)
    List<PublicResultRow> findPublishedResults(
            @Param("studentId") UUID studentId,
            @Param("academicYear") String academicYear,
            @Param("term") Integer term,
            @Param("examType") Integer examType);
}
