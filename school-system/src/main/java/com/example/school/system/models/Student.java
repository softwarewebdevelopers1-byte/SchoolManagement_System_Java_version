package com.example.school.system.models;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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
    Long studentAdm;

    @Column(name = "full_name")
    String fullName;

    @Column(name = "registration_date")
    Date date;

    @Column(name = "status")
    String status;

    @Column(name = "phone_number")
    int phoneNumber;
}
