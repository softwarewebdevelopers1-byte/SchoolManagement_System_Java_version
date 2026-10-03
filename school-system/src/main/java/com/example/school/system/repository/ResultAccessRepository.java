package com.example.school.system.repository;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.EntityGraph;

import com.example.school.system.models.ResultAccess;
import com.example.school.system.types.ExamType;

public interface ResultAccessRepository extends JpaRepository<ResultAccess, UUID> {
    @EntityGraph(attributePaths = { "studentProfile" })
    Optional<ResultAccess> findByTokenHash(String tokenHash);

    Optional<ResultAccess> findByStudentProfileIdAndAcademicYearAndCurrentSchoolTermAndExamType(
            UUID studentId, String academicYear, Integer term, ExamType examType);

    List<ResultAccess> findAllByStudentProfileIdInAndAcademicYearAndCurrentSchoolTermAndExamType(
            List<UUID> studentIds, String academicYear, Integer term, ExamType examType);

    @Query(value = """
            SELECT access
            FROM ResultAccess access
            JOIN FETCH access.studentProfile student
            LEFT JOIN FETCH student.schoolClass schoolClass
            WHERE access.resultSchoolId = :schoolId
              AND (
                    :search IS NULL
                    OR LOWER(student.studentFullName) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(student.studentAdm) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(CONCAT('Grade ', schoolClass.classGrade, ' ', schoolClass.classStream))
                       LIKE LOWER(CONCAT('%', :search, '%'))
                  )
              AND (
                    :status IS NULL
                    OR (:status = 'REVOKED' AND access.revokedAt IS NOT NULL)
                    OR (:status = 'EXPIRED' AND access.revokedAt IS NULL
                        AND access.expiresAt IS NOT NULL AND access.expiresAt <= CURRENT_TIMESTAMP)
                    OR (:status = 'ACTIVE' AND access.revokedAt IS NULL
                        AND (access.expiresAt IS NULL OR access.expiresAt > CURRENT_TIMESTAMP))
                  )
            """,
            countQuery = """
            SELECT COUNT(access)
            FROM ResultAccess access
            JOIN access.studentProfile student
            LEFT JOIN student.schoolClass schoolClass
            WHERE access.resultSchoolId = :schoolId
              AND (
                    :search IS NULL
                    OR LOWER(student.studentFullName) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(student.studentAdm) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(CONCAT('Grade ', schoolClass.classGrade, ' ', schoolClass.classStream))
                       LIKE LOWER(CONCAT('%', :search, '%'))
                  )
              AND (
                    :status IS NULL
                    OR (:status = 'REVOKED' AND access.revokedAt IS NOT NULL)
                    OR (:status = 'EXPIRED' AND access.revokedAt IS NULL
                        AND access.expiresAt IS NOT NULL AND access.expiresAt <= CURRENT_TIMESTAMP)
                    OR (:status = 'ACTIVE' AND access.revokedAt IS NULL
                        AND (access.expiresAt IS NULL OR access.expiresAt > CURRENT_TIMESTAMP))
                  )
            """)
    Page<ResultAccess> findAllForSchool(
            @Param("schoolId") UUID schoolId,
            @Param("search") String search,
            @Param("status") String status,
            Pageable pageable);

    @Query("""
            SELECT access
            FROM ResultAccess access
            JOIN FETCH access.studentProfile student
            LEFT JOIN FETCH student.schoolClass schoolClass
            WHERE access.id = :accessId AND access.resultSchoolId = :schoolId
            """)
    Optional<ResultAccess> findByIdForSchool(@Param("accessId") UUID accessId, @Param("schoolId") UUID schoolId);
}
