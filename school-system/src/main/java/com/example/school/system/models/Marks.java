package com.example.school.system.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "marks")
@NoArgsConstructor
@AllArgsConstructor
public class Marks {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer marksId;

    @Column(name = "subject_name")
    @NotBlank(message = "subject name is missing")
    private String subjectName;

    @Column(name = "total_marks")
    private Integer totalMarks = 0;

    @ManyToOne
    @JoinColumn(name = "subject_joint_id")
    private SubjectJoint subjectJoint;

    @PreUpdate
    @PrePersist
    private void Normalize() {
        if (subjectName != null) {
            subjectName = subjectName.trim().toLowerCase();
        }
    }
}
