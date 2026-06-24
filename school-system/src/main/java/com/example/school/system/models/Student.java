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
    public void setDate(Date registrationDate) {
        this.date = registrationDate;
    }

    public Date getDate() {
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
    public void setPhoneNumber(int phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public int getPhoneNumber() {
        return this.phoneNumber;
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
