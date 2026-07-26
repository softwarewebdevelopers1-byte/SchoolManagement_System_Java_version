package com.example.school.system.models;

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
@Table(name = "marks")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Marks {
    @Id
    @Column(columnDefinition = "BINARY(16)", name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = true)
    private Integer exam = 0;

    @Column(nullable = true)
    private Integer cat1 = 0;

    @Column(nullable = true)
    private Integer cat2 = 0;

    @Column(nullable = true)
    private Integer cat3 = 0;

    @Column(name = "total_marks")
    private Integer totalMarks = 0;

    // "A","B+"
    private String grade;

    // "1","10"
    private Integer points;

    @Column(nullable = true, name = "average_marks%")
    private Integer averageMarksPercentage;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private StudentProfile StudentProfile;

    @ManyToOne
    MarksSheet marksSheet;

    @PrePersist
    private void generateIdAndNormalize() {
        if (id == null) {
            id = UuidCreator.getTimeOrdered();
        }

    }
}
