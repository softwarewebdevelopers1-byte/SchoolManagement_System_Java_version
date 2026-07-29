package com.example.school.system.models;

import java.util.UUID;

import com.example.school.system.types.SubjectTimePreference;
import com.github.f4b6a3.uuid.UuidCreator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "subject_requirements", indexes = {
        @Index(name = "idx_subject_requirement_school", columnList = "school_id"),
        @Index(name = "idx_subject_requirement_class", columnList = "class_id")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_requirement_school_class_joint", columnNames = { "school_id", "class_id",
                "subject_joint_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubjectRequirement {
    @Id
    @Column(columnDefinition = "BINARY(16)", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "school_id")
    private School school;

    @ManyToOne(optional = false)
    @JoinColumn(name = "class_id")
    private SchoolClass schoolClass;

    @ManyToOne(optional = false)
    @JoinColumn(name = "subject_joint_id")
    private SubjectJoint subjectJoint;

    @Column(name = "weekly_lessons", nullable = false)
    private Integer weeklyLessons;

    @Column(name = "requires_double_lesson", nullable = false)
    private Boolean requiresDoubleLesson = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "time_preference", nullable = false)
    private SubjectTimePreference timePreference = SubjectTimePreference.NEUTRAL;

    @PrePersist
    private void generateId() {
        if (id == null) {
            id = UuidCreator.getTimeOrdered();
        }
        if (requiresDoubleLesson == null) {
            requiresDoubleLesson = false;
        }
        if (timePreference == null) {
            timePreference = SubjectTimePreference.NEUTRAL;
        }
    }
}
