package com.example.school.system.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.Instant;

import com.example.school.system.models.AttendanceArchive;
import com.example.school.system.types.ArchiveStatus;

public interface AttendanceArchiveRepository extends JpaRepository<AttendanceArchive, UUID> {
    java.util.Optional<AttendanceArchive> findFirstBySchoolIdAndClassIdAndStartDateAndEndDateOrderByVersionDesc(
            UUID schoolId, UUID classId, LocalDate startDate, LocalDate endDate);

    List<AttendanceArchive> findAllBySchoolIdOrderByRequestedAtDesc(UUID schoolId, Pageable pageable);

    List<AttendanceArchive> findTop20ByStatusInOrderByRequestedAtAsc(List<ArchiveStatus> statuses);

    @Modifying
    @Query("""
            UPDATE AttendanceArchive archive
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
            UPDATE AttendanceArchive archive
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
            UPDATE AttendanceArchive archive
            SET archive.status = com.example.school.system.types.ArchiveStatus.PENDING,
                archive.lastError = 'Recovered stale archive worker claim',
                archive.leaseToken = null,
                archive.leaseExpiresAt = null
            WHERE archive.status = com.example.school.system.types.ArchiveStatus.PROCESSING
              AND COALESCE(archive.leaseExpiresAt, archive.processingStartedAt) < :cutoff
            """)
    int recoverStale(@Param("cutoff") java.time.Instant cutoff);

    boolean existsBySchoolIdAndClassIdAndStartDateAndEndDateAndStatus(
            UUID schoolId, UUID classId, LocalDate startDate, LocalDate endDate, ArchiveStatus status);
}
