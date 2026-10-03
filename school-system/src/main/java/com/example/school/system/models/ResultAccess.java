package com.example.school.system.models;

import java.time.Instant;
import java.util.UUID;

import com.example.school.system.types.ExamType;
import com.github.f4b6a3.uuid.UuidCreator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
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
@Table(name = "result_access", indexes = {
        @Index(name = "idx_result_access_student", columnList = "student_id")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_result_access_publication",
                columnNames = { "student_id", "academic_year", "current_school_term", "exam_type" })
})
@Getter
@Setter
@NoArgsConstructor
public class ResultAccess {
    @Id
    @Column(columnDefinition = "BINARY(16)", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_result_access_student"))
    private StudentProfile studentProfile;

    @Column(name = "result_school_id", columnDefinition = "BINARY(16)")
    private UUID resultSchoolId;

    @Column(name = "result_class_id", columnDefinition = "BINARY(16)")
    private UUID resultClassId;

    @Column(name = "academic_year", nullable = false, length = 32)
    private String academicYear;

    @Column(name = "current_school_term", nullable = false)
    private Integer currentSchoolTerm;

    @Enumerated(EnumType.STRING)
    @Column(name = "exam_type", nullable = false, length = 32)
    private ExamType examType;

    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(name = "encrypted_token", length = 512)
    private String encryptedToken;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @Column(name = "renewed_at")
    private Instant renewedAt;

    @Column(name = "renewed_by", columnDefinition = "BINARY(16)")
    private UUID renewedBy;

    @PrePersist
    private void generateIdAndTimestamp() {
        if (id == null) {
            id = UuidCreator.getTimeOrdered();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
