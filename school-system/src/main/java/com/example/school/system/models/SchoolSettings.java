package com.example.school.system.models;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SchoolSettings {
  @Id
  @Column(name = "settings_id")
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  Integer settingsId;

  // for example term one
  @Column(name = "term")
  Integer schoolTerm = 1;

  // for example term one opener
  @Column(name = "sub_term")
  String subTerm = "opener";

  // relationship between settings and school
  @OneToOne
  @JoinColumn(name = "school_id")
  School school;

  // relationship between settings and class
  @OneToMany(mappedBy = "schoolSettings")
  List<SchoolClass> schoolClasses;

  // relationship between setings and marks
  @OneToMany(mappedBy = "schoolSettings")
  List<Marks> marks;

  // relationship between settings and teacher
  @OneToMany(mappedBy = "schoolSettings")
  List<UserProfile> teachers;

  // relationship between settings and students
  @OneToMany(mappedBy = "schoolSettings")
  List<Student> students;

  @PrePersist
  @PreUpdate
  private void normalze() {
    if (subTerm != null) {
      subTerm = subTerm.trim().toLowerCase();
    }
  }
}
