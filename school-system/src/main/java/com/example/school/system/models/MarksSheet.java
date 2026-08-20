package com.example.school.system.models;

import java.util.List;
import java.util.UUID;

import com.example.school.system.types.ExamType;
import com.example.school.system.types.MarksSheetStatus;
import com.github.f4b6a3.uuid.UuidCreator;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
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

    private UUID classId;

    private Integer grade;

    private UUID schoolId;

    private Integer maxExam;
    private boolean ExamEntry = true;

    private Integer maxCat1;
    private boolean Cat1Entry = false;

    private Integer maxCat2;
    private boolean Cat2Entry = false;

    private Integer maxCat3;
    private boolean Cat3Entry = false;

    private String academicYear;

    private Integer currentSchoolTerm;

    private ExamType examType;

    @Enumerated(EnumType.STRING)
    private MarksSheetStatus status = MarksSheetStatus.NOT_SUBMITTED;

    @OneToMany(mappedBy = "marksSheet", cascade = CascadeType.ALL, orphanRemoval = true)
    List<MarksRow> marks;

    @ManyToOne(fetch = FetchType.LAZY)
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
