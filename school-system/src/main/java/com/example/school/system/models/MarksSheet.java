package com.example.school.system.models;

import java.util.List;
import java.util.UUID;

import com.github.f4b6a3.uuid.UuidCreator;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "marks_sheet")
public class MarksSheet {
    @Id
    @Column(columnDefinition = "BINARY(16)", name = "id", nullable = false, updatable = false)
    private UUID id;

    private Integer maxExam = 100;

    private Integer maxCat1 = 40;
    private boolean maxCat1Entry = false;

    private Integer maxCat2 = 40;
    private boolean maxCat2Entry = false;

    private Integer maxCat3 = 40;
    private boolean maxCat3Entry = false;

    private String academicYear;

    private Integer currentSchoolTerm;

    private String currentSubTerm;

    @OneToMany(mappedBy = "marksSheet", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Marks> marks;

    @ManyToOne
    @JoinColumn(name = "subject_joint_id")
    private SubjectJoint subjectJoint;

    @PrePersist
    private void generateIdAndNormalize() {
        if (id == null) {
            id = UuidCreator.getTimeOrdered();
        }
    }

    // public void addOrUpdateMarks() {
    // }
}
