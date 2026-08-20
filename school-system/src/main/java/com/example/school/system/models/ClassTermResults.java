package com.example.school.system.models;

import com.example.school.system.types.ExamType;
import com.github.f4b6a3.uuid.UuidCreator;
import java.util.UUID;

import org.hibernate.annotations.BatchSize;

import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Table(name = "class_term_result")
@NoArgsConstructor
@Getter
@Entity
@Setter
@BatchSize(size = 50)
public class ClassTermResults {
    @Id
    @Column(columnDefinition = "BINARY(16)", name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne
    private StudentProfile  studentProfile;

    private UUID classId;

    private Double totalMarks;

    private Integer classPosition;

    private Integer streamPosition;

    private String grade;

    private String academicYear;

    private Integer currentSchoolTerm;

    private ExamType examType;

    @PrePersist
    private void generateIdAndNormalize() {
        if (id == null) {
            id = UuidCreator.getTimeOrdered();
        }
    }
}
