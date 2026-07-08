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
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name = "teachers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Teacher {
  @Id
  @Column(name = "teacher_id")
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  Long teacherId;

  @Column(name = "first_name")
  @NotBlank(message = "First name is missing")
  String firstName;

  @Column(name = "last_name")
  @NotBlank(message = "Last name is missing")
  String lastName;

  @Column(name = "email", unique = true)
  @NotBlank(message = "Email is missing")
  String email;

  @NotBlank(message = "password is missing")
  @Column(name = "password")
  String password;

  @Column(name = "available_connections")
  Integer connections = 6;

  @Column(name = "registration_date")
  @CreationTimestamp
  LocalDate date;

  // create relationship between school and teacher
  @ManyToOne
  @JoinColumn(name = "school_id")
  School school;

  // create relationship between school settings and teacher
  @ManyToOne
  @JoinColumn(name = "scool_settings_id")
  SchoolSettings schoolSettings;

  // create relationship between teacher subject and teacher
  @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL)
  List<TeacherSubject> teacherSubjects;
  // relationship of class teacher with a class
  @OneToOne
  @JoinColumn(name = "classAssigned")
  SchoolClass classAssigned;

  @PreUpdate
  @PrePersist
  private void normalze() {
    if (firstName != null) {
      firstName = firstName.trim().toLowerCase();

    }
    if (lastName != null) {
      lastName = lastName.trim().toLowerCase();
    }
    if (email != null) {
      email = email.trim().toLowerCase();
    }
  }
}
