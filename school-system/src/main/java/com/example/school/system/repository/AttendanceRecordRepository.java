package com.example.school.system.repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.school.system.models.AttendanceRecords;
import com.example.school.system.models.StudentProfile;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecords, UUID> {
    Optional<AttendanceRecords> findByStudentAndDate(StudentProfile studentProfile, LocalDate date);
}
