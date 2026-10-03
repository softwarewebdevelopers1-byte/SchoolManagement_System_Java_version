package com.example.school.system.repository;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.school.system.models.ClassTermResults;
import com.example.school.system.types.ExamType;

@Repository
public interface ClassTermResultsRepo extends JpaRepository<ClassTermResults, UUID> {

    Optional<ClassTermResults> findByStudentProfile_IdAndAcademicYearAndCurrentSchoolTermAndExamType(
            UUID studentId, String academicYear, Integer term, ExamType examType);

    @EntityGraph(attributePaths = "studentProfile")
    List<ClassTermResults> findAllByClassIdAndAcademicYearAndCurrentSchoolTermAndExamType(
            UUID classId, String academicYear, Integer term, ExamType examType);

    @Query("""
            SELECT r.classId, COUNT(r), SUM(CASE WHEN r.published = true THEN 1 ELSE 0 END)
            FROM ClassTermResults r
            WHERE r.classId IN :classIds
              AND r.academicYear = :academicYear
              AND r.currentSchoolTerm = :term
              AND r.examType = :examType
            GROUP BY r.classId
            """)
    List<Object[]> findPublicationCounts(
            @Param("classIds") List<UUID> classIds,
            @Param("academicYear") String academicYear,
            @Param("term") Integer term,
            @Param("examType") ExamType examType);

    List<ClassTermResults> findAllByStudentProfile_IdAndAcademicYearAndCurrentSchoolTermAndPublishedTrue(
            UUID studentId, String academicYear, Integer term);

    List<ClassTermResults> findAllByStudentProfile_IdInAndAcademicYearAndCurrentSchoolTermAndPublishedTrue(
            List<UUID> studentIds, String academicYear, Integer term);

    @Modifying
    @Query(value = """
            UPDATE class_term_results r
            JOIN (
                SELECT id,
                       RANK() OVER (PARTITION BY class_id ORDER BY total_marks DESC) as c_rank,
                       RANK() OVER (PARTITION BY class_id, academic_year, current_school_term, exam_type ORDER BY total_marks DESC) as s_rank
                FROM class_term_results
                WHERE class_id = :classId AND academic_year = :academicYear
                  AND current_school_term = :term AND exam_type = :examType
            ) ranked ON r.id = ranked.id
            SET r.class_position = ranked.c_rank,
                r.stream_position = ranked.s_rank
            """, nativeQuery = true)
    void rankStudentsForClassTerm(UUID classId, String academicYear, Integer term, ExamType examType);
}
