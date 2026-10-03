package com.example.school.system.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import java.time.Instant;

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

    List<ResultArchive> findAllBySchoolIdOrderByRequestedAtDesc(UUID schoolId, Pageable pageable);

    @Query("""
            SELECT archive
            FROM ResultArchive archive
            WHERE archive.schoolId = :schoolId
              AND (:classId IS NULL OR archive.classId = :classId)
              AND (:academicYear IS NULL OR archive.academicYear = :academicYear)
              AND (:term IS NULL OR archive.term = :term)
              AND (:status IS NULL OR archive.status = :status)
              AND (:search IS NULL
                   OR LOWER(archive.className) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(archive.academicYear) LIKE LOWER(CONCAT('%', :search, '%')))
            ORDER BY archive.requestedAt DESC, archive.id DESC
            """)
    List<ResultArchive> searchArchives(
            @Param("schoolId") UUID schoolId,
            @Param("classId") UUID classId,
            @Param("academicYear") String academicYear,
            @Param("term") Integer term,
            @Param("status") ArchiveStatus status,
            @Param("search") String search,
            Pageable pageable);

    List<ResultArchive> findTop20ByStatusInOrderByRequestedAtAsc(List<ArchiveStatus> statuses);

    @Modifying
    @Query("""
            UPDATE ResultArchive archive
            SET archive.status = com.example.school.system.types.ArchiveStatus.PROCESSING,
                archive.processingStartedAt = CURRENT_TIMESTAMP,
                archive.leaseToken = :leaseToken,
                archive.leaseExpiresAt = :leaseExpiresAt,
                archive.attemptCount = archive.attemptCount + 1,
                archive.lastError = null
            WHERE archive.id = :id AND archive.status = com.example.school.system.types.ArchiveStatus.PENDING
            """)
    int claimPending(
            @Param("id") UUID id,
            @Param("leaseToken") UUID leaseToken,
            @Param("leaseExpiresAt") Instant leaseExpiresAt);

    @Modifying
    @Query("""
            UPDATE ResultArchive archive
            SET archive.leaseExpiresAt = :leaseExpiresAt
            WHERE archive.id = :id
              AND archive.status = com.example.school.system.types.ArchiveStatus.PROCESSING
              AND archive.leaseToken = :leaseToken
            """)
    int renewLease(
            @Param("id") UUID id,
            @Param("leaseToken") UUID leaseToken,
            @Param("leaseExpiresAt") Instant leaseExpiresAt);

    @Modifying
    @Query("""
            UPDATE ResultArchive archive
            SET archive.status = com.example.school.system.types.ArchiveStatus.PENDING,
                archive.lastError = 'Recovered stale archive worker claim',
                archive.leaseToken = null,
                archive.leaseExpiresAt = null
            WHERE archive.status = com.example.school.system.types.ArchiveStatus.PROCESSING
              AND COALESCE(archive.leaseExpiresAt, archive.processingStartedAt) < :cutoff
            """)
    int recoverStale(@Param("cutoff") java.time.Instant cutoff);
}
