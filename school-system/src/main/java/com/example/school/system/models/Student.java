package com.example.school.system.models;

import java.util.Date;

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
    Date date;

    @Column(name = "status")
    String status;

    @Column(name = "phone_number")
    int phoneNumber;

    public void setStudentId(Long id) {
        this.studentId = id;
    }

    public Long getStudentId() {
        return this.studentId;
    }

    public void setFullName(String name) {
        this.fullName = name;
    }

    public String getFullName() {
        return this.fullName;
    }

    public Student() {
    }

    public Student(Long studentAdm, String fullName, Date registrationDate, String status, int phoneNumber) {
        this.studentAdm = studentAdm;
        this.fullName = fullName;
        this.date = registrationDate;
        this.status = status;
        this.phoneNumber = phoneNumber;
    }
}
