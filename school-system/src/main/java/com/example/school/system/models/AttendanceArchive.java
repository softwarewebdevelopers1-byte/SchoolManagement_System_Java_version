package com.example.school.system.models;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.example.school.system.types.ArchiveStatus;
import com.github.f4b6a3.uuid.UuidCreator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "attendance_archives", uniqueConstraints = @UniqueConstraint(
        name = "uk_attendance_archive_scope_version",
        columnNames = { "school_id", "class_id", "start_date", "end_date", "archive_version" }),
        indexes = {
                @Index(name = "idx_attendance_archive_school_status", columnList = "school_id, status, requested_at"),
                @Index(name = "idx_attendance_archive_class_period",
                        columnList = "class_id, start_date, end_date, status")
        })
@Getter
@Setter
@NoArgsConstructor
public class AttendanceArchive {
    @Id
    @Column(columnDefinition = "BINARY(16)", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "school_id", nullable = false, columnDefinition = "BINARY(16)")
    private UUID schoolId;

    @Column(name = "class_id", nullable = false, columnDefinition = "BINARY(16)")
    private UUID classId;

    @Column(name = "class_name", nullable = false, length = 128)
    private String className;

    @Column(name = "school_name", length = 255)
    private String schoolName;

    @Column(name = "student_count")
    private Integer studentCount;

    @Column(name = "recorded_days")
    private Integer recordedDays;

    @Column(name = "no_sheet_days")
    private Integer noSheetDays;

    @Column(name = "attendance_rate")
    private Double attendanceRate;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "missing_dates_confirmed", nullable = false)
    private boolean missingDatesConfirmed;

    @Column(name = "archive_version", nullable = false)
    private Integer version = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private ArchiveStatus status = ArchiveStatus.PENDING;

    @Column(name = "snapshot_key", length = 1024)
    private String snapshotKey;

    @Column(name = "snapshot_sha256", length = 64)
    private String snapshotSha256;

    @Column(name = "snapshot_size")
    private Long snapshotSize;

    @Column(name = "manifest_key", length = 1024)
    private String manifestKey;

    @Column(name = "manifest_sha256", length = 64)
    private String manifestSha256;

    @Column(name = "manifest_size")
    private Long manifestSize;

    @Column(name = "document_key", length = 1024)
    private String documentKey;

    @Column(name = "document_sha256", length = 64)
    private String documentSha256;

    @Column(name = "document_size")
    private Long documentSize;

    @Column(name = "cleanup_eligible", nullable = false)
    private boolean cleanupEligible;

    @Column(name = "requested_by", columnDefinition = "BINARY(16)")
    private UUID requestedBy;

    @Column(name = "requested_at", nullable = false, updatable = false)
    private Instant requestedAt;

    @Column(name = "processing_started_at")
    private Instant processingStartedAt;

    @Column(name = "lease_token", columnDefinition = "BINARY(16)")
    private UUID leaseToken;

    @Column(name = "lease_expires_at")
    private Instant leaseExpiresAt;

    @Column(name = "attempt_count", nullable = false)
    private Integer attemptCount = 0;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(name = "last_error", length = 2000)
    private String lastError;

    @Version
    private Long entityVersion;

    @PrePersist
    private void initialize() {
        if (id == null) {
            id = UuidCreator.getTimeOrdered();
        }
        if (requestedAt == null) {
            requestedAt = Instant.now();
        }
    }
}
