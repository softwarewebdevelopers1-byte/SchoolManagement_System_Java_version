package com.example.school.system.models;

import java.util.UUID;

import org.hibernate.annotations.BatchSize;

import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@RequiredArgsConstructor
@BatchSize(size = 50)
public class GradeBand {
    @Id
    @Column(nullable = false, updatable = false, columnDefinition = "BINARY(16)")
    private UUID id;
    // for example "A","A-"
    private String grade;

    private Integer minScore;

    private Integer maxScore;

    private Double points;

    @ManyToOne(fetch = FetchType.LAZY)
    private GradingScale gradingScale;

    @PrePersist
    private void generateId() {
        if (id == null) {
            id = UuidCreator.getTimeOrdered();
        }
    }
}
