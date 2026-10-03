package com.example.school.system.models;

import java.util.UUID;

import com.github.f4b6a3.uuid.UuidCreator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "result_archive_students", uniqueConstraints = @UniqueConstraint(
        name = "uk_result_archive_student", columnNames = { "archive_id", "student_id" }),
        indexes = @Index(name = "idx_result_archive_student_lookup", columnList = "student_id, archive_id"))
@Getter
@Setter
@NoArgsConstructor
public class ResultArchiveStudent {
    @Id
    @Column(columnDefinition = "BINARY(16)", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "archive_id", nullable = false)
    private ResultArchive archive;

    @Column(name = "student_id", nullable = false, columnDefinition = "BINARY(16)")
    private UUID studentId;

    @Column(name = "student_name", nullable = false, length = 255)
    private String studentName;

    @Column(name = "admission_number", length = 64)
    private String admissionNumber;

    @Column(name = "snapshot_key", nullable = false, length = 1024)
    private String snapshotKey;

    @Column(name = "snapshot_sha256", nullable = false, length = 64)
    private String snapshotSha256;

    @Column(name = "snapshot_size", nullable = false)
    private Long snapshotSize;

    @Column(name = "document_key", length = 1024)
    private String documentKey;

    @Column(name = "document_sha256", length = 64)
    private String documentSha256;

    @Column(name = "document_size")
    private Long documentSize;

    @PrePersist
    private void initialize() {
        if (id == null) {
            id = UuidCreator.getTimeOrdered();
        }
    }
}
