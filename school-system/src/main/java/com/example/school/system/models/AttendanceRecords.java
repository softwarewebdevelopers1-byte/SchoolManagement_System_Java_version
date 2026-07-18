package com.example.school.system.models;

import java.util.UUID;

import com.example.school.system.types.ClassAttendanceStatus;
import com.github.f4b6a3.uuid.UuidCreator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@RequiredArgsConstructor
public class AttendanceRecords {
    @Id
    @Column(nullable = false, updatable = false, columnDefinition = "BINARY(16)")
    UUID id;
    @Enumerated(EnumType.STRING)
    ClassAttendanceStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    StudentProfile student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attendance_sheet_id")
    AttendanceSheet sheet;

    @PrePersist
    private void generateId() {
        if (id == null) {
            id = UuidCreator.getTimeOrdered();
        }
    }
}

