package com.example.school.system.models;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import com.example.school.system.types.UserRoles;
import com.github.f4b6a3.uuid.UuidCreator;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
  @Column(columnDefinition = "BINARY(16)", name = "id", nullable = false, updatable = false)
  UUID userId;

  @Column(name = "email", unique = true)
  @NotBlank(message = "Email is missing")
  String email;

  @Column(name = "roles")
  @Enumerated(EnumType.STRING)
  Set<UserRoles> roles = new HashSet<>();

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
  private void normalize() {
    if (roles.isEmpty()) {
      roles.add(UserRoles.STUDENT);
    }
    if (email != null) {
      email = email.trim().toLowerCase();
    }
    if (status != null) {
      status = status.trim().toLowerCase();
    }
  }

  @PrePersist
  private void generateId() {
    if (userId == null) {
      userId = UuidCreator.getTimeOrdered();
    }
    if (roles.isEmpty()) {
      roles.add(UserRoles.STUDENT);
    }
    if (email != null) {
      email = email.trim().toLowerCase();
    }
    if (status != null) {
      status = status.trim().toLowerCase();
    }
  }
}
