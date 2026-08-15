package com.example.school.system.models;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
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
  @Column(columnDefinition = "BINARY(16)", name = "id", nullable = false, updatable = false)
  private UUID id;

  private String academicYear;
  // for example term one
  @Column(name = "term")
  private Integer currentSchoolTerm = 1;

  @Column(name = "school_start_time")
  private LocalTime schoolStartTime = LocalTime.of(8, 0);

  @Column(name = "lessons_per_day")
  private Integer lessonsPerDay = 8;

  @Column(name = "minutes_per_lesson")
  private Integer minutesPerLesson = 40;

  // relationship between settings and school
  @OneToOne
  @JoinColumn(name = "school_id")
  private School school;

  @OneToOne(mappedBy = "schoolSettings",cascade = CascadeType.ALL)
  private ExamSettings examSettings;

  @Column(name = "final_grade")
  private Integer finalGrade;

  @OneToMany(mappedBy = "schoolSettings", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<SchoolBreak> breaks = new ArrayList<>();

  @PrePersist
  private void generateIdAndNormalize() {
    if (id == null) {
      id = UuidCreator.getTimeOrdered();
    }
    if (academicYear == null) {
      academicYear = String.valueOf(LocalDate.now().getYear());
    }
    if (schoolStartTime == null) {
      schoolStartTime = LocalTime.of(8, 0);
    }
    if (lessonsPerDay == null) {
      lessonsPerDay = 8;
    }
    if (minutesPerLesson == null) {
      minutesPerLesson = 40;
    }
  }
}
