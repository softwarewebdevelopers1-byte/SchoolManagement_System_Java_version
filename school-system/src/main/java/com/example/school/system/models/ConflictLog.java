package com.example.school.system.models;

import java.time.DayOfWeek;
import java.util.UUID;

import com.example.school.system.types.TimetableConflictType;
import com.github.f4b6a3.uuid.UuidCreator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "conflict_logs", indexes = {
        @Index(name = "idx_conflict_history", columnList = "generation_history_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConflictLog {
    @Id
    @Column(columnDefinition = "BINARY(16)", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "generation_history_id")
    private GenerationHistory generationHistory;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TimetableConflictType type;

    @Column(nullable = false)
    private String severity;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(name = "class_id", columnDefinition = "BINARY(16)")
    private UUID classId;

    @Column(name = "teacher_id", columnDefinition = "BINARY(16)")
    private UUID teacherId;

    @Column(name = "subject_id", columnDefinition = "BINARY(16)")
    private UUID subjectId;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week")
    private DayOfWeek dayOfWeek;

    @Column(name = "period_number")
    private Integer periodNumber;

    @PrePersist
    private void generateId() {
        if (id == null) {
            id = UuidCreator.getTimeOrdered();
        }
    }
}
