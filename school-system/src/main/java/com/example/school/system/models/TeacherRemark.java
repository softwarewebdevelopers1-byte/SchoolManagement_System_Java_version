package com.example.school.system.models;

import java.util.UUID;

import org.hibernate.annotations.BatchSize;

import com.github.f4b6a3.uuid.UuidCreator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
    name = "teacher_remarks",
    uniqueConstraints = @UniqueConstraint(columnNames = {"school_id", "subject_id", "teacher_id", "grade_band"})
)
@Getter
@Setter
@BatchSize(size = 50)
public class TeacherRemark {
    @Id
    @Column(nullable = false, updatable = false, columnDefinition = "BINARY(16)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private TeacherProfile teacher;

    @Column(name = "grade_band", nullable = false)
    private String gradeBand;

    @Column(name = "remark", nullable = false, length = 500)
    private String remark;

    @PrePersist
    private void generateId() {
        if (id == null) {
            id = UuidCreator.getTimeOrdered();
        }
    }
}
