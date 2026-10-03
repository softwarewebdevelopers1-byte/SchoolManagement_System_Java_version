package com.example.school.system.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.school.system.models.AttendanceArchive;
import com.example.school.system.types.ArchiveStatus;

public interface AttendanceArchiveRepository extends JpaRepository<AttendanceArchive, UUID> {
    java.util.Optional<AttendanceArchive> findFirstBySchoolIdAndClassIdAndStartDateAndEndDateOrderByVersionDesc(
            UUID schoolId, UUID classId, LocalDate startDate, LocalDate endDate);

    List<AttendanceArchive> findAllBySchoolIdOrderByRequestedAtDesc(UUID schoolId);

    List<AttendanceArchive> findTop20ByStatusInOrderByRequestedAtAsc(List<ArchiveStatus> statuses);

    @Modifying
    @Query("""
            UPDATE AttendanceArchive archive
            SET archive.status = com.example.school.system.types.ArchiveStatus.PROCESSING,
                archive.processingStartedAt = CURRENT_TIMESTAMP,
                archive.attemptCount = archive.attemptCount + 1,
                archive.lastError = null
            WHERE archive.id = :id AND archive.status = com.example.school.system.types.ArchiveStatus.PENDING
            """)
    int claimPending(@Param("id") UUID id);

    @Modifying
    @Query("""
            UPDATE AttendanceArchive archive
            SET archive.status = com.example.school.system.types.ArchiveStatus.PENDING,
                archive.lastError = 'Recovered stale archive worker claim'
            WHERE archive.status = com.example.school.system.types.ArchiveStatus.PROCESSING
              AND archive.processingStartedAt < :cutoff
            """)
    int recoverStale(@Param("cutoff") java.time.Instant cutoff);

    boolean existsBySchoolIdAndClassIdAndStartDateAndEndDateAndStatus(
            UUID schoolId, UUID classId, LocalDate startDate, LocalDate endDate, ArchiveStatus status);
}
