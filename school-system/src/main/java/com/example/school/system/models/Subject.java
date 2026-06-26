package com.example.school.system.models;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "subjects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "subject_id")
    Integer subjectId;

    @Column(name = "subject_name", unique = true)
    @NotBlank(message = "subject name is missing")
    String subjectName;

    @Column(name = "subject_type")
    String subjectType = "compulsory";

    // relationship between teacher and subjects
    @ManyToMany
    List<Teacher> teacher;

    // relationship between subject and marks
    @OneToMany(mappedBy = "subject")
    List<Marks> marks;
}
