package com.example.school.system.models;

import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.BatchSize;

import com.github.f4b6a3.uuid.UuidCreator;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@RequiredArgsConstructor
@BatchSize(size = 50)
public class GradingScale {
    @Id
    @Column(nullable = false, updatable = false, columnDefinition = "BINARY(16)")
    UUID id;

    @Column(unique = true)
    private UUID schoolId;

    @OrderBy("minScore DESC")
    @OneToMany(mappedBy = "gradingScale", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 10)
    private List<GradeBand> bands;

    @PrePersist
    private void generateId() {
        if (id == null) {
            id = UuidCreator.getTimeOrdered();
        }
    }
}
