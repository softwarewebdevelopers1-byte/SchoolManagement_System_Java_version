package com.example.school.system.models;

import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.BatchSize;

import com.example.school.system.types.Gender;
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
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "students_profile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@BatchSize(size = 50)
public class StudentProfile {
    @Id
    @Column(columnDefinition = "BINARY(16)", name = "student_id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "student_name")
    private String studentFullName;

    @Column(name = "student_adm", unique = true)
    private String studentAdm;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "guardian_name")
    private String guardianName;

    @Column(name = "gender")
    @Enumerated(EnumType.STRING)
    private Gender gender;

    @OneToMany(mappedBy = "studentProfile", fetch = FetchType.LAZY)
    private List<ClassTermResults> classTermResults;

    @OneToMany(mappedBy = "studentProfile", fetch = FetchType.LAZY)
    private List<StudentSubjectSelection> studentSubjectSelections;

    @OneToMany(mappedBy = "StudentProfile", fetch = FetchType.LAZY)
    List<MarksRow> marks;
    // relationship between student and class
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id")
    private SchoolClass schoolClass;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_account")
    private Users student;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<AttendanceRecords> attendanceRecords;

    @PreUpdate
    private void normalze() {
        if (studentFullName != null) {
            studentFullName = studentFullName.trim().toLowerCase();
        }
        if (studentAdm != null) {
            studentAdm = studentAdm.trim();
        }
        if (phoneNumber != null) {
            phoneNumber = phoneNumber.trim();

        }
    }

    @PrePersist
    private void generateIdAndNormalize() {
        if (id == null) {
            id = UuidCreator.getTimeOrdered();
        }
        if (studentFullName != null) {
            studentFullName = studentFullName.trim().toLowerCase();
        }
        if (studentAdm != null) {
            studentAdm = studentAdm.trim();
        }
        if (phoneNumber != null) {
            phoneNumber = phoneNumber.trim();

        }
    }
}
