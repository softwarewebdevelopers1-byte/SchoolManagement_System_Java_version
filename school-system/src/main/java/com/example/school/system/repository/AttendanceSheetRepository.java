package com.example.school.system.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import com.example.school.system.models.AttendanceSheet;
import com.example.school.system.types.WholeAttendanceSheetStatus;

public interface AttendanceSheetRepository extends JpaRepository<AttendanceSheet, UUID> {
    @EntityGraph(attributePaths = { "attendanceRecords", "schoolClass", "attendanceRecords.student" })
    Optional<AttendanceSheet> findBySchoolClassClassIdAndDate(UUID classId, LocalDate date);

    @EntityGraph(attributePaths = { "attendanceRecords", "schoolClass", "attendanceRecords.student" })
    Optional<AttendanceSheet> findBySchoolClassClassIdAndSchoolClassSchoolIdAndDate(
            UUID classId, UUID schoolId, LocalDate date);

    @EntityGraph(attributePaths = { "attendanceRecords", "attendanceRecords.student" })
    Optional<AttendanceSheet> findBySchoolClassClassIdAndDateAndStatus(UUID classId, LocalDate date,
            WholeAttendanceSheetStatus status);

    @EntityGraph(attributePaths = { "attendanceRecords", "schoolClass", "attendanceRecords.student" })
    Optional<AttendanceSheet> findBySchoolClassClassIdAndDateAndStatusIn(UUID classId, LocalDate date, List<WholeAttendanceSheetStatus> statuses);

    @Query("""
            SELECT a FROM AttendanceSheet a WHERE id = :id AND schoolClass.classId= :classId AND a.status !=LOCKED
                """)
    @EntityGraph(attributePaths = { "attendanceRecords" })

    Optional<AttendanceSheet> findEditableSheet(@Param("id") UUID sheetId, @Param("classId") UUID schoolClassClassId);

    @Query("""
            SELECT a FROM AttendanceSheet a
            WHERE a.id = :id AND a.schoolClass.classId = :classId
              AND a.schoolClass.school.id = :schoolId AND a.status != com.example.school.system.types.WholeAttendanceSheetStatus.LOCKED
            """)
    @EntityGraph(attributePaths = { "attendanceRecords", "schoolClass" })
    Optional<AttendanceSheet> findEditableSheetForSchool(
            @Param("id") UUID sheetId, @Param("classId") UUID classId, @Param("schoolId") UUID schoolId);

    @EntityGraph(attributePaths = { "attendanceRecords" })
    List<AttendanceSheet> findAllByStatus(WholeAttendanceSheetStatus attendanceSheetStatus);

    @Query("""
            SELECT a.id FROM AttendanceSheet a
            WHERE a.status = :status
            ORDER BY a.date, a.id
            """)
    List<UUID> findIdsByStatus(
            @Param("status") WholeAttendanceSheetStatus status, Pageable pageable);

    @Modifying
    @Query("""
            UPDATE AttendanceSheet a
            SET a.status = com.example.school.system.types.WholeAttendanceSheetStatus.LOCKED
            WHERE a.id IN :ids
              AND a.status = com.example.school.system.types.WholeAttendanceSheetStatus.SUBMITTED
            """)
    int lockSubmittedByIds(@Param("ids") List<UUID> ids);

    @EntityGraph(attributePaths = { "schoolClass", "attendanceRecords", "attendanceRecords.student" })
    List<AttendanceSheet> findAllBySchoolClassClassIdAndDateBetweenOrderByDate(
            UUID classId, LocalDate startDate, LocalDate endDate);

    @Query("""
            SELECT a.status, COUNT(a)
            FROM AttendanceSheet a
            WHERE a.schoolClass.classId = :classId AND a.date BETWEEN :startDate AND :endDate
            GROUP BY a.status
            """)
    List<Object[]> countByStatusForClassAndDateRange(
            @Param("classId") UUID classId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    long countDistinctBySchoolClassClassIdAndDateBetween(UUID classId, LocalDate startDate, LocalDate endDate);

    long countBySchoolClassSchoolIdAndDate(UUID schoolId, LocalDate date);
}