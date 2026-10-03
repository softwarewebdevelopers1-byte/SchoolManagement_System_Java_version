package com.example.school.system.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.school.system.models.ResultArchive;
import com.example.school.system.types.ArchiveStatus;
import com.example.school.system.types.ExamType;

public interface ResultArchiveRepository extends JpaRepository<ResultArchive, UUID> {
    Optional<ResultArchive> findFirstBySchoolIdAndClassIdAndAcademicYearAndTermAndExamTypeOrderByVersionDesc(
            UUID schoolId, UUID classId, String academicYear, Integer term, ExamType examType);

    Optional<ResultArchive> findFirstBySchoolIdAndClassIdAndAcademicYearAndTermAndExamTypeAndStatusOrderByVersionDesc(
            UUID schoolId, UUID classId, String academicYear, Integer term, ExamType examType, ArchiveStatus status);

    Optional<ResultArchive> findFirstByClassIdAndAcademicYearAndTermAndExamTypeAndStatusOrderByVersionDesc(
            UUID classId, String academicYear, Integer term, ExamType examType, ArchiveStatus status);

    List<ResultArchive> findAllBySchoolIdOrderByRequestedAtDesc(UUID schoolId);

    List<ResultArchive> findTop20ByStatusInOrderByRequestedAtAsc(List<ArchiveStatus> statuses);

    @Modifying
    @Query("""
            UPDATE ResultArchive archive
            SET archive.status = com.example.school.system.types.ArchiveStatus.PROCESSING,
                archive.processingStartedAt = CURRENT_TIMESTAMP,
                archive.attemptCount = archive.attemptCount + 1,
                archive.lastError = null
            WHERE archive.id = :id AND archive.status = com.example.school.system.types.ArchiveStatus.PENDING
            """)
    int claimPending(@Param("id") UUID id);

    @Modifying
    @Query("""
            UPDATE ResultArchive archive
            SET archive.status = com.example.school.system.types.ArchiveStatus.PENDING,
                archive.lastError = 'Recovered stale archive worker claim'
            WHERE archive.status = com.example.school.system.types.ArchiveStatus.PROCESSING
              AND archive.processingStartedAt < :cutoff
            """)
    int recoverStale(@Param("cutoff") java.time.Instant cutoff);
}
