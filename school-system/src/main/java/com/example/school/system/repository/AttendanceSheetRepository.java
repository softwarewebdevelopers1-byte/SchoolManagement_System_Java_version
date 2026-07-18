package com.example.school.system.repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.school.system.models.AttendanceSheet;
import com.example.school.system.models.SchoolClass;

public interface AttendanceSheetRepository extends JpaRepository<AttendanceSheet, UUID> {
    Optional<AttendanceSheet>findBySchoolClassAndDate(SchoolClass classId,LocalDate date);
}
