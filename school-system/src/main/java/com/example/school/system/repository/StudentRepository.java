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

import com.example.school.system.DTO.student.StudentEnrollmentDTO;
import com.example.school.system.DTO.student.StudentSummaryDTO;
import com.example.school.system.models.StudentProfile;

public interface StudentRepository extends JpaRepository<StudentProfile, UUID> {

    boolean existsByStudentAdm(String adm);

    @EntityGraph(attributePaths = { "schoolClass", "schoolClass.teacher", "schoolClass.teacher.teacher", "student" })
    Optional<StudentProfile> findByStudentAdm(String studentAdm);

    // Single projection query for paginated student summaries
    @Query("""
        SELECT new com.example.school.system.DTO.student.StudentSummaryDTO(
            sp.id,
            sp.studentFullName,
            sp.studentAdm,
            u.email,
            sp.phoneNumber,
            sp.guardianName,
            sp.gender,
            u.status,
            c.classId,
            c.classGrade,
            c.classStream
        )
        FROM StudentProfile sp
        JOIN sp.student u
        LEFT JOIN sp.schoolClass c
        WHERE c.classId = :classId
        ORDER BY sp.studentFullName ASC
    """)
    Page<StudentSummaryDTO> findSummariesByClassId(@Param("classId") UUID classId, Pageable pageable);

    // Optimized count without fetching entities
    @Query("SELECT COUNT(sp) FROM StudentProfile sp WHERE sp.schoolClass.classId = :classId")
    long countByClassId(@Param("classId") UUID classId);

    // Kept for backward compatibility with MarksEntryService and other callers
    @EntityGraph(attributePaths = { "studentSubjectSelections", "studentSubjectSelections.subjectJoint", "student", "schoolClass" })
    List<StudentProfile> findAllBySchoolClassClassId(UUID classId);
}
