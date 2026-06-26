package com.example.school.system.models;

import java.time.LocalDate;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "school")
@Getter
@Setter
public class School {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "school_id")
    Long schoolId;

    @Column(name = "school_name", unique = true)
    @NotBlank(message = "School name field is missing")
    String schoolName;

    @Column(name = "registration_date")
    @CreationTimestamp
    LocalDate schoolRegistrationDate;

    // creating relationship
    @OneToMany(mappedBy = "school")
    List<Student> students;

    public School() {

    }

    public School(Long schoolId, String schoolName) {
        this.schoolId = schoolId;
        this.schoolName = schoolName;
    }
}
