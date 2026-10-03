package com.example.school.system.models;

import java.time.Instant;
import java.util.UUID;

import com.example.school.system.types.ArchiveStatus;
import com.example.school.system.types.ExamType;
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
@Table(name = "result_archives", uniqueConstraints = @UniqueConstraint(
        name = "uk_result_archive_scope_version",
        columnNames = { "school_id", "class_id", "academic_year", "term", "exam_type", "archive_version" }),
        indexes = {
                @Index(name = "idx_result_archive_school_status", columnList = "school_id, status, requested_at"),
                @Index(name = "idx_result_archive_class_cycle",
                        columnList = "class_id, academic_year, term, exam_type, status")
        })
@Getter
@Setter
@NoArgsConstructor
public class ResultArchive {
    @Id
    @Column(columnDefinition = "BINARY(16)", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "school_id", nullable = false, columnDefinition = "BINARY(16)")
    private UUID schoolId;

    @Column(name = "class_id", nullable = false, columnDefinition = "BINARY(16)")
    private UUID classId;

    @Column(name = "class_name", nullable = false, length = 128)
    private String className;

    @Column(name = "academic_year", nullable = false, length = 32)
    private String academicYear;

    @Column(nullable = false)
    private Integer term;

    @Enumerated(EnumType.STRING)
    @Column(name = "exam_type", nullable = false, length = 32)
    private ExamType examType;

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

    @Column(name = "class_snapshot_key", length = 1024)
    private String classSnapshotKey;

    @Column(name = "class_snapshot_sha256", length = 64)
    private String classSnapshotSha256;

    @Column(name = "class_snapshot_size")
    private Long classSnapshotSize;

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

    @Column(name = "supersedes_archive_id", columnDefinition = "BINARY(16)")
    private UUID supersedesArchiveId;

    @Column(name = "correction_reason", length = 500)
    private String correctionReason;

    @Column(name = "frozen_snapshot", columnDefinition = "LONGTEXT")
    private String frozenSnapshot;

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
