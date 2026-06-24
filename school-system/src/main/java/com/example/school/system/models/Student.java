package com.example.school.system.models;

import java.time.LocalDate;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "student")
// student entity
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "student_id")
    Long studentId;

    @Column(name = "adm", unique = true)
    Long studentAdm;

    @Column(name = "full_name")
    String fullName;

    @Column(name = "registration_date")
    @CreationTimestamp
    LocalDate date;

    @Column(name = "status")
    String status;

    @Column(name = "phone_number")
    String phoneNumber;

    @Column(name = "password")
    String password;
    // getters and setters

    // for student student id

    public void setStudentId(Long id) {
        this.studentId = id;
    }

    public Long getStudentId() {
        return this.studentId;
    }

    // for student admission
    public void setStudentAdm(Long adm) {
        this.studentAdm = adm;
    }

    public Long getStudentAdm() {
        return this.studentAdm;
    }

    // for student full name
    public void setFullName(String name) {
        this.fullName = name;
    }

    public String getFullName() {
        return this.fullName;
    }

    // for student registration date
    public void setDate(LocalDate registrationDate) {
        this.date = registrationDate;
    }

    public LocalDate getDate() {
        return this.date;
    }

    // for student account status
    public void setStatus(String status) {
        this.status = status;
    }

    public String getStatus() {
        return this.status;
    }

    // for phone number
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getPhoneNumber() {
        return this.phoneNumber;
    }

    // for hashed passowrd
    public void setPassword(String password) {
        this.password = password;
    }

    public String getPassword() {
        return this.password;
    }

    public Student() {
    }

    public Student(Long studentAdm, String fullName, String status, String phoneNumber) {
        this.studentAdm = studentAdm;
        this.fullName = fullName;
        this.status = status;
        this.phoneNumber = phoneNumber;
    }
}
