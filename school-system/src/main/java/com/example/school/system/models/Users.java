package com.example.school.system.models;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
public class Users {
  @Id
  @Column(name = "user_id")
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  Long user;
  @Column(name = "email", unique = true)
  @NotBlank(message = "Email is missing")
  String email;

  @Column(name = "roles")
  Set<String> roles = new HashSet<>();

  @NotBlank(message = "password is missing")
  @Column(name = "password")
  String password;

  @Column(name = "registration_date")
  @CreationTimestamp
  LocalDate date;

  @Column(name = "status")
  String status = "active";

  @OneToOne(mappedBy = "teacher", cascade = CascadeType.ALL)
  TeacherProfile teacherProfile;

  @OneToOne(mappedBy = "student", cascade = CascadeType.ALL)
  StudentProfile studentProfile;

  @PreUpdate
  @PrePersist
  private void normalze() {
    if (email != null) {
      email = email.trim().toLowerCase();
    }
    if (status != null) {
      status = status.trim().toLowerCase();
    }
  }
}
