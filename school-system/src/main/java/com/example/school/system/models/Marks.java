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

@Entity
@Table(name = "marks")
@NoArgsConstructor
@AllArgsConstructor
@Getter
public class Marks {
    @Id
    @Column(columnDefinition = "BINARY(16)", name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "subject_name")
    @NotBlank(message = "subject name is missing")
    private String subjectName;

    private String academicYear;

    private Integer currentSchoolTerm;

    private String currentSubTerm;

    private Integer exam;

    private Integer cat1;

    private Integer cat2;

    private Integer cat3;

    @Column(name = "total_marks")
    private Integer totalMarks = 0;

    @ManyToOne
    @JoinColumn(name = "subject_joint_id")
    private SubjectJoint subjectJoint;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private StudentProfile StudentProfile;

    @PreUpdate
    private void Normalize() {
        if (subjectName != null) {
            subjectName = subjectName.trim().toLowerCase();
        }
    }

    @PrePersist
    private void generateIdAndNormalize() {
        if (id == null) {
            id = UuidCreator.getTimeOrdered();
        }

    }
}
