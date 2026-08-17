package com.example.school.system.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.school.system.models.ClassTermResults;
import com.example.school.system.types.ExamType;

@Repository
public interface ClassTermResultsRepo extends JpaRepository<ClassTermResults, UUID> {

    Optional<ClassTermResults> findByStudentProfile_IdAndAcademicYearAndCurrentSchoolTermAndExamType(
            UUID studentId, String academicYear, Integer term, ExamType examType);

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
