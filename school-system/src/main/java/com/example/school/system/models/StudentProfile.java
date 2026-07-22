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

    @OneToMany(mappedBy = "StudentProfile")
    List<Marks> marks;
    // relationship between student and class
    @ManyToOne
    @JoinColumn(name = "class_id")
    private SchoolClass schoolClass;

    @OneToOne
    @JoinColumn(name = "student_account")
    private Users student;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
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
