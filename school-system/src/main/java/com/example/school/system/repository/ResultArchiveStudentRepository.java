package com.example.school.system.repository;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Collection;
import com.example.school.system.models.ResultArchiveStudent;
import com.example.school.system.types.ArchiveStatus;
import com.example.school.system.types.ExamType;

public interface ResultArchiveStudentRepository extends JpaRepository<ResultArchiveStudent, UUID> {
    List<ResultArchiveStudent> findAllByArchiveId(UUID archiveId);

    @Query("""
            SELECT student
            FROM ResultArchiveStudent student
            WHERE student.studentId = :studentId
              AND student.archive.classId = :classId
              AND student.archive.schoolId = :schoolId
              AND student.archive.academicYear = :academicYear
              AND student.archive.term = :term
              AND student.archive.examType = :examType
              AND student.archive.status = :status
            ORDER BY student.archive.version DESC
            """)
    List<ResultArchiveStudent> findAuthorizedSnapshot(
            @Param("studentId") UUID studentId,
            @Param("classId") UUID classId,
            @Param("schoolId") UUID schoolId,
            @Param("academicYear") String academicYear,
            @Param("term") Integer term,
            @Param("examType") ExamType examType,
            @Param("status") ArchiveStatus status);

    @Query("""
            SELECT CASE WHEN COUNT(student) > 0 THEN true ELSE false END
            FROM ResultArchiveStudent student
            WHERE student.studentId = :studentId
              AND student.archive.schoolId = :schoolId
              AND student.archive.classId = :classId
              AND student.archive.academicYear = :academicYear
              AND student.archive.term = :term
              AND student.archive.examType = :examType
              AND student.archive.status IN :statuses
            """)
    boolean existsForHistoricalAccess(
            @Param("studentId") UUID studentId,
            @Param("schoolId") UUID schoolId,
            @Param("classId") UUID classId,
            @Param("academicYear") String academicYear,
            @Param("term") Integer term,
            @Param("examType") ExamType examType,
            @Param("statuses") Collection<ArchiveStatus> statuses);

    List<ResultArchiveStudent> findAllByStudentIdAndArchive_AcademicYearAndArchive_TermAndArchive_ExamTypeAndArchive_StatusOrderByArchive_VersionDesc(
            UUID studentId, String academicYear, Integer term, ExamType examType, ArchiveStatus status);

    Optional<ResultArchiveStudent> findByArchiveIdAndStudentId(UUID archiveId, UUID studentId);

    Page<ResultArchiveStudent> findAllByArchiveIdOrderByStudentNameAsc(UUID archiveId, Pageable pageable);

    @Modifying
    @Query("DELETE FROM ResultArchiveStudent student WHERE student.archive.id = :archiveId")
    int deleteAllForArchive(@Param("archiveId") UUID archiveId);
}
