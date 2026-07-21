package com.example.school.system.models;

import java.util.UUID;

import com.github.f4b6a3.uuid.UuidCreator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "subjects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Subject {
    @Id
    @Column(name = "id", nullable = false, insertable = true, updatable = true,columnDefinition = "BINARY(16)")
    UUID id; 
    
    @Column(name = "subject_name")
    @NotBlank(message = "subject name is missing")
    String subjectName;

    @ManyToOne
    @JoinColumn(name = "school_id")
    private School school;

    @PreUpdate
    private void normalze() {
        if (subjectName != null) {
            subjectName = subjectName.trim().toLowerCase();
        }
    }

    @PrePersist
    private void generateIdAndNormalize() {
        if (id == null) {
            id = UuidCreator.getTimeOrdered();
        }
        if (subjectName != null) {
            subjectName = subjectName.trim().toLowerCase();
        }
    }
}
