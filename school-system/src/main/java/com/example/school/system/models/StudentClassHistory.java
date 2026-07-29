package com.example.school.system.models;

import java.time.Instant;
import java.util.UUID;

import com.github.f4b6a3.uuid.UuidCreator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "student_class_history", indexes = {
        @Index(name = "idx_student_class_history_student", columnList = "student_id"),
        @Index(name = "idx_student_class_history_school_year", columnList = "school_id, academic_year")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_student_class_history_year", columnNames = { "student_id", "school_id",
                "academic_year" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudentClassHistory {
    @Id
    @Column(columnDefinition = "BINARY(16)", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "student_id")
    private StudentProfile student;

    @ManyToOne(optional = false)
    @JoinColumn(name = "school_id")
    private School school;

    @ManyToOne(optional = false)
    @JoinColumn(name = "class_id")
    private SchoolClass schoolClass;

    @Column(name = "academic_year", nullable = false)
    private String academicYear;

    @Column(name = "class_grade", nullable = false)
    private Integer classGrade;

    @Column(name = "class_stream", nullable = false)
    private String classStream;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;

    @PrePersist
    private void generateIdAndNormalize() {
        if (id == null) {
            id = UuidCreator.getTimeOrdered();
        }
        if (recordedAt == null) {
            recordedAt = Instant.now();
        }
        if (classStream != null) {
            classStream = classStream.trim().toLowerCase();
        }
    }
}
