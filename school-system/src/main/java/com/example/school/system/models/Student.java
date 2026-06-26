package com.example.school.system.models;

import java.time.LocalDate;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "student")
@Getter
@Setter
// student entity
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "student_id")
    Long studentId;

    @Column(name = "adm", unique = true)
    @NotNull(message = "student admission is missing")
    Long studentAdm;

    @Column(name = "full_name")
    @NotBlank(message = "student name field should not be empty")
    String fullName;

    @Column(name = "registration_date")
    @CreationTimestamp
    LocalDate date;

    @Column(name = "status")
    String status;

    @Column(name = "phone_number")
    @Size(min = 10, max = 13)
    String phoneNumber;

    @Column(name = "password")
    String password;

    // creating relationship between student and school(one school has many students
    // ...one to many)
    @ManyToOne
    @JoinColumn(name = "school_id")
    School school;

    public Student() {
    }

    public Student(Long studentAdm, String fullName, String status, String phoneNumber) {
        this.studentAdm = studentAdm;
        this.fullName = fullName;
        this.status = status;
        this.phoneNumber = phoneNumber;
    }
}
