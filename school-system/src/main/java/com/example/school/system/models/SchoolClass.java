package com.example.school.system.models;

import java.time.LocalDate;
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
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "classes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SchoolClass {
    @Id
    @Column(name = "class_id", columnDefinition = "BINARY(16)")
    private UUID classId;

    // class as integer for example grade 7
    @NotNull(message = "Grade is missing")
    @Column(name = "grade")
    private Integer classGrade;

    // class stream for example North
    @NotBlank(message = "Stream is missing")
    @Column(name = "stream")
    private String classStream;

    private LocalDate createdAt;

    private LocalDate updatedAt;

    @OneToMany(mappedBy = "schoolClass")
    private List<SubjectJoint> subjectJoints;

    // relationship between school and student
    @ManyToOne
    @JoinColumn(name = "school")
    private School school;

    @OneToOne(mappedBy = "schoolClass")
    private TeacherProfile teacher;
    // relationship between class and student
    @OneToMany(mappedBy = "schoolClass", cascade = CascadeType.ALL)
    private List<StudentProfile> student;

    @OneToMany(mappedBy = "schoolClass")
    private List<AttendanceSheet> attendanceSheets;

    @PreUpdate
    private void normalize() {
        if (classStream != null) {
            classStream = classStream.trim().toLowerCase();
        }
    }

    @PrePersist
    private void generateIdAndNormalize() {
        if (classId == null) {
            classId = UuidCreator.getTimeOrdered();
        }
        if (classStream != null) {
            classStream = classStream.trim().toLowerCase();
        }
        if (createdAt == null) {
            createdAt = LocalDate.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDate.now();
        }

    }
}
