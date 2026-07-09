package com.example.school.system.models;

import java.time.LocalDate;
import java.util.List;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "schools")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class School {
    @Id
    @Column(name = "school_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long schoolId;

    @Column(name = "school_name", unique = true)
    @NotBlank(message = "school name must be provided")
    String schoolName;

    @Column(name = "registered_date")
    @CreationTimestamp
    LocalDate date;

    // creating relationship between school and students
    @OneToMany(mappedBy = "school", cascade = CascadeType.ALL)
    List<StudentProfile> students;

    // creating relationship between school and school settings
    @OneToOne(mappedBy = "school", cascade = CascadeType.ALL)
    SchoolSettings schoolSettings;

    @PreUpdate
    @PrePersist
    private void normalze() {
        if (schoolName != null) {
            schoolName = schoolName.trim().toLowerCase();
        }
    }

}