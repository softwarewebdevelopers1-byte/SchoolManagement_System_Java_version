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

    private String academicYear;

    private Integer currentSchoolTerm;

    private String currentSubTerm;

    @Column(nullable = true)
    private Integer exam;

    @Column(nullable = true)
    private Integer cat1;

    @Column(nullable = true)
    private Integer cat2;

    @Column(nullable = true)
    private Integer cat3;

    @Column(name = "total_marks")
    private Integer totalMarks = 0;

    @ManyToOne
    @JoinColumn(name = "subject_joint_id")
    private SubjectJoint subjectJoint;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private StudentProfile StudentProfile;

    @PrePersist
    private void generateIdAndNormalize() {
        if (id == null) {
            id = UuidCreator.getTimeOrdered();
        }

    }
}
