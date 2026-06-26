package com.example.school.system.models;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Student {
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

    @Column(name = "student_status")
    String status = "active";

    // relationship between student and school
    @ManyToOne
    @JoinColumn(name = "school_id")
    School school;

    // relationship between student and marks
    @OneToMany
    List<Marks> marks;

    // relationship between student and class
    @ManyToOne
    @JoinColumn(name = "class_id")
    SchoolClass schoolClass;

    // relationship between student and school settings
    @ManyToOne
    @JoinColumn(name = "school_settings")
    SchoolSettings schoolSettings;

}
