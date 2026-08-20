package com.example.school.system.models;

import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.BatchSize;

import com.example.school.system.types.SubjectType;
import com.github.f4b6a3.uuid.UuidCreator;
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
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "subject_joint")
@BatchSize(size = 50)
public class SubjectJoint {
    @Id
    @Column(columnDefinition = "BINARY(16)", nullable = false, updatable = false, insertable = false)
    UUID id;
    @Enumerated(EnumType.STRING)
    private SubjectType subjectType = SubjectType.COMPULSORY;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name = "class_id")
    private SchoolClass schoolClass;

    @OneToMany(mappedBy = "subjectJoint",fetch = FetchType.LAZY)
    List<MarksSheet> marksSheets;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @OneToMany(mappedBy = "subjectJoint",fetch = FetchType.LAZY)
    List<StudentSubjectSelection> studentSubjectSelections;

    private String electiveCode;

    @ManyToOne(fetch = FetchType.LAZY)
    private TeacherProfile teacherProfile;

    @PrePersist
    private void generateIdAndNormalize() {
        if (id == null) {
            id = UuidCreator.getTimeOrdered();
        }
    }
}

