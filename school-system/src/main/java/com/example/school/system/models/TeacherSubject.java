package com.example.school.system.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "teacher_subject")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TeacherSubject {
    @Id
    Integer Id;
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    // relationship btwn teachersubject and teacher entities
    @ManyToOne
    Teacher teacher;

    // relationship btwn teachersubject and subject entities
    @ManyToOne
    Subject subject;
}
