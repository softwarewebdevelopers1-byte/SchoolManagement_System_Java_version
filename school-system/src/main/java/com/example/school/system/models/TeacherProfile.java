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
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "teachers_profile")
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class TeacherProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "first_name")
    @NotBlank(message = "First name is missing")
    private String firstName;

    @Column(name = "last_name")
    @NotBlank(message = "Last name is missing")
    private String lastName;

    @Column(name = "available_connections")
    private Integer connections = 6;

    @OneToOne
    @JoinColumn(name = "teacher_account")
    private Users teacher;

    // relationship between teacher and school
    @ManyToOne
    @JoinColumn(name = "school_id")
    private School school;

    // relationship between teacher and school settings
    @ManyToOne
    @JoinColumn(name = "school_settings")
    private SchoolSettings schoolSettings;

    @OneToMany(mappedBy = "link")
    private List<TeacherLinkedToSubject> teacherLinkedToSubjects;
}
