package com.example.school.system.models;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "class_histories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClassHistory {
    @Id
    @Column(name = "class_id", columnDefinition = "BINARY(16)")
    private UUID id;

    @Column(columnDefinition = "BINARY(16)")
    private UUID linkedClass;

    private LocalDate createdAt;

    List<UUID> studentProfiles;
    // for example Form4-2024
    @Column(unique = true, updatable = false)
    private String code;
    // relationship between school and student
    @ManyToOne
    @JoinColumn(name = "school")
    private School school;

    @PrePersist
    private void generateIdAndNormalize() {
        if (id == null) {
            id = UuidCreator.getTimeOrdered();
        }
        if (createdAt == null) {
            createdAt = LocalDate.now();
        }
    }
}
