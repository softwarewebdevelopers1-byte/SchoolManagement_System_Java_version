package com.example.school.system.models;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.BatchSize;

import com.example.school.system.types.TimetableStatus;
import com.github.f4b6a3.uuid.UuidCreator;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "timetables", indexes = {
        @Index(name = "idx_timetable_school_term", columnList = "school_id, academic_year, term")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@BatchSize(size = 50)
public class Timetable {
    @Id
    @Column(columnDefinition = "BINARY(16)", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(optional = false,fetch=FetchType.LAZY)
    @JoinColumn(name = "school_id")
    private School school;

    @Column(name = "academic_year", nullable = false)
    private String academicYear;

    @Column(name = "term", nullable = false)
    private Integer term;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TimetableStatus status = TimetableStatus.ACTIVE;

    @Column(name = "generated_at", nullable = false)
    private Instant generatedAt;

    @Column(name = "generation_duration_ms")
    private Long generationDurationMs;

    @Column(name = "completeness_percentage")
    private Double completenessPercentage;

    @OneToMany(mappedBy = "timetable", cascade = CascadeType.ALL, orphanRemoval = true,fetch=FetchType.LAZY)
    private List<TimetableEntry> entries = new ArrayList<>();

    @PrePersist
    private void generateId() {
        if (id == null) {
            id = UuidCreator.getTimeOrdered();
        }
        if (generatedAt == null) {
            generatedAt = Instant.now();
        }
        if (status == null) {
            status = TimetableStatus.ACTIVE;
        }
    }
}
