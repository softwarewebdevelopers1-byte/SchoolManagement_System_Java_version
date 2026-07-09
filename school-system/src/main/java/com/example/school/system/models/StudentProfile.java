package com.example.school.system.models;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "student_id")
    Long studentId;

    @Column(name = "student_name")
    String studentFullName;

    @Column(name = "student_adm", unique = true)
    String studentAdm;

    @Column(name = "phone_number")
    String phoneNumber;

    // relationship between student and school
    @ManyToOne
    @JoinColumn(name = "school_id")
    School school;

    // relationship between student and marks
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    List<Marks> marks;

    // relationship between student and class
    @ManyToOne
    @JoinColumn(name = "class_id")
    SchoolClass schoolClass;

    @OneToOne
    @JoinColumn(name = "student_account")
    Users student;

    @PrePersist
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
}
