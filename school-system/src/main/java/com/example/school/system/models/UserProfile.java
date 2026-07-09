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
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {
  @Id
  @Column(name = "user_id")
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  Long user;
  @Column(name = "email", unique = true)
  @NotBlank(message = "Email is missing")
  String email;

  @NotBlank(message = "password is missing")
  @Column(name = "password")
  String password;

  @Column(name = "registration_date")
  @CreationTimestamp
  LocalDate date;

  // create relationship between school and user
  @ManyToOne
  @JoinColumn(name = "school_id")
  School school;

  // create relationship between school settings and user
  @ManyToOne
  @JoinColumn(name = "school_settings_id")
  SchoolSettings schoolSettings;

  // create relationship between user subject and user
  @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL)
  List<TeacherSubject> teacherSubjects;
  // relationship of class teacher with a class
  @OneToOne
  @JoinColumn(name = "classAssigned")
  SchoolClass classAssigned;

  @PreUpdate
  @PrePersist
  private void normalze() {
    if (email != null) {
      email = email.trim().toLowerCase();
    }
  }
}
