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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "classes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SchoolClass {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "class_id")
    Integer classId;
    // class as integer for example grade 7
    @NotNull(message = "Grade is missing")
    @Column(name = "grade")
    Integer classGrade;
    // class stream for example North
    @NotBlank(message = "Stream is missing")
    @Column(name = "stream")
    String classStream;

    // relationship between school and student
    @ManyToOne
    @JoinColumn(name = "school")
    School school;
    // relationship between class and student
    @OneToOne(mappedBy = "schoolClass")
    Student student;
    // relationship between class and school settings
    @ManyToOne
    @JoinColumn(name = "school_settings_id")
    SchoolSettings schoolSettings;
    // relationship between class and marks
    @OneToMany(mappedBy="schoolClass")
    List<Marks> marks;
}
