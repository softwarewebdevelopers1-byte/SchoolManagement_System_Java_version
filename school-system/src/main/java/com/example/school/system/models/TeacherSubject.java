package com.example.school.system.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class TeacherSubject {
    @Id
    Integer Id;

    // relationship btwn teachersubject and teacher entities
    @ManyToOne
    Teacher teacher;

    // relationship btwn teachersubject and subject entities
    @ManyToOne
    Subject subject;
}
