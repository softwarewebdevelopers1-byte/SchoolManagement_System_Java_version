package com.example.school.system.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "marks")
@NoArgsConstructor
@AllArgsConstructor
public class Marks {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer marksId;

    @Column(name = "subject_name")
    @NotBlank(message = "subject name is missing")
    String subjectName;

    @Column(name = "total_marks")
    Integer totalMarks = 0;
    // relationship between marks and subject
    @ManyToOne
    @JoinColumn(name = "subject_id")
    Subject subject;

    // relationship between marks and student
    @ManyToOne
    @JoinColumn(name = "student_id")
    Student student;

    // relationship between marks and class
    @ManyToOne
    @JoinColumn(name = "class_id")
    SchoolClass schoolClass;

    // relationship between marks and school settings
    @ManyToOne
    @JoinColumn(name = "school_settings_id")
    SchoolSettings schoolSettings;

}
