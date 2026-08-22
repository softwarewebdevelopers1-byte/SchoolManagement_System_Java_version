package com.example.school.system.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.school.system.models.AttendanceSheet;
import com.example.school.system.types.WholeAttendanceSheetStatus;

public interface AttendanceSheetRepository extends JpaRepository<AttendanceSheet, UUID> {
    @EntityGraph(attributePaths = { "attendanceRecords", "schoolClass", "attendanceRecords.student" })
    Optional<AttendanceSheet> findBySchoolClassClassIdAndDate(UUID classId, LocalDate date);

    @EntityGraph(attributePaths = { "attendanceRecords", "attendanceRecords.student" })
    Optional<AttendanceSheet> findBySchoolClassClassIdAndDateAndStatus(UUID classId, LocalDate date,
            WholeAttendanceSheetStatus status);

    @Query("""
            SELECT a FROM AttendanceSheet a WHERE id = :id AND schoolClass.classId= :classId AND a.status !=LOCKED
                """)
    @EntityGraph(attributePaths = { "attendanceRecords" })

    Optional<AttendanceSheet> findEditableSheet(@Param("id") UUID sheetId, @Param("classId") UUID schoolClassClassId);

    @EntityGraph(attributePaths = { "attendanceRecords" })
    List<AttendanceSheet> findAllByStatus(WholeAttendanceSheetStatus attendanceSheetStatus);

    long countBySchoolClassSchoolIdAndDate(UUID schoolId, LocalDate date);
}