package com.example.school.system.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
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
public class TeacherLinkedToSubject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer Id;
    // relationship btwn teachersubjectLink and subject entities
    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;

    // relationship btwn teachersubjectLink and subject entities
    @ManyToOne
    @JoinColumn(name = "teacher_link_subject")
    private TeacherProfile link;

}
