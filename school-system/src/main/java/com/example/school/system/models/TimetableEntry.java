package com.example.school.system.models;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.UUID;

import com.github.f4b6a3.uuid.UuidCreator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "timetable_entries", indexes = {
        @Index(name = "idx_entry_timetable", columnList = "timetable_id"),
        @Index(name = "idx_entry_class_slot", columnList = "class_id, day_of_week, period_number"),
        @Index(name = "idx_entry_teacher_slot", columnList = "teacher_id, day_of_week, period_number")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_entry_timetable_class_slot", columnNames = { "timetable_id", "class_id",
                "day_of_week", "period_number" }),
        @UniqueConstraint(name = "uk_entry_timetable_teacher_slot", columnNames = { "timetable_id", "teacher_id",
                "day_of_week", "period_number" }),
        @UniqueConstraint(name = "uk_entry_timetable_joint_slot", columnNames = { "timetable_id", "subject_joint_id",
                "day_of_week", "period_number" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TimetableEntry {
    @Id
    @Column(columnDefinition = "BINARY(16)", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "timetable_id")
    private Timetable timetable;

    @ManyToOne(optional = false)
    @JoinColumn(name = "class_id")
    private SchoolClass schoolClass;

    @ManyToOne(optional = false)
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @ManyToOne(optional = false)
    @JoinColumn(name = "teacher_id")
    private TeacherProfile teacherProfile;

    @ManyToOne(optional = false)
    @JoinColumn(name = "subject_joint_id")
    private SubjectJoint subjectJoint;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false)
    private DayOfWeek dayOfWeek;

    @Column(name = "period_number", nullable = false)
    private Integer periodNumber;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "double_lesson_part", nullable = false)
    private Integer doubleLessonPart = 0;

    @Column(nullable = false)
    private Boolean locked = false;

    @PrePersist
    private void generateId() {
        if (id == null) {
            id = UuidCreator.getTimeOrdered();
        }
        if (locked == null) {
            locked = false;
        }
        if (doubleLessonPart == null) {
            doubleLessonPart = 0;
        }
    }
}
