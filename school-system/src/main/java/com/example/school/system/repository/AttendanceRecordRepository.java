package com.example.school.system.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.school.system.models.AttendanceRecords;
import com.example.school.system.models.StudentProfile;
import com.example.school.system.projection.AttendanceMonthlyProjection;
import com.example.school.system.projection.AttendanceTermlyProjection;
import com.example.school.system.projection.AttendanceTrendProjection;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecords, UUID> {
    @EntityGraph(attributePaths = { "student", "student.schoolClass", "sheet", "sheet.schoolClass" })
    Optional<AttendanceRecords> findByStudentAndDate(StudentProfile studentProfile, LocalDate date);

    @Query(value = """
            SELECT
                sp.student_id AS studentId,
                sp.student_name AS studentName,
                sp.student_adm AS admissionNo,
                COUNT(ar.id) AS totalDays,
                SUM(CASE WHEN ar.status = 'PRESENT' THEN 1 ELSE 0 END) AS presentDays,
                SUM(CASE WHEN ar.status = 'ABSENT' THEN 1 ELSE 0 END) AS absentDays,
                ROUND(SUM(CASE WHEN ar.status = 'PRESENT' THEN 1 ELSE 0 END) * 100.0 / COUNT(ar.id), 2) AS attendancePercentage
            FROM attendance_records ar
            JOIN students_profile sp ON ar.student_id = sp.student_id
            WHERE ar.date >= :startDate
              AND ar.date <= :endDate
              AND sp.class_id = :classId
            GROUP BY sp.student_id, sp.student_name, sp.student_adm
            """, nativeQuery = true)
    Page<AttendanceMonthlyProjection> findMonthlyAttendanceByClass(
            @Param("classId") UUID classId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("pageable") Pageable pageable);

    @Query(value = """
            SELECT
                sp.student_id AS studentId,
                sp.student_name AS studentName,
                sp.student_adm AS admissionNo,
                COUNT(ar.id) AS totalSessions,
                SUM(CASE WHEN ar.status = 'PRESENT' THEN 1 ELSE 0 END) AS presentSessions,
                ROUND(SUM(CASE WHEN ar.status = 'PRESENT' THEN 1 ELSE 0 END) * 100.0 / COUNT(ar.id), 2) AS attendancePercentage
            FROM attendance_records ar
            JOIN students_profile sp ON ar.student_id = sp.student_id
            WHERE ar.date >= :startDate
              AND ar.date <= :endDate
              AND sp.class_id = :classId
            GROUP BY sp.student_id, sp.student_name, sp.student_adm
            """, nativeQuery = true)
    Page<AttendanceTermlyProjection> findTermlyAttendanceByClass(
            @Param("classId") UUID classId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("pageable") Pageable pageable);

    @Query(value = """
            SELECT
                ar.date AS date,
                SUM(CASE WHEN ar.status = 'PRESENT' THEN 1 ELSE 0 END) AS present,
                SUM(CASE WHEN ar.status = 'ABSENT' THEN 1 ELSE 0 END) AS absent,
                ROUND(SUM(CASE WHEN ar.status = 'PRESENT' THEN 1 ELSE 0 END) * 100.0 / COUNT(ar.id), 2) AS rate
            FROM attendance_records ar
            JOIN students_profile sp ON ar.student_id = sp.student_id
            WHERE sp.class_id = :classId
              AND ar.date >= :startDate
              AND ar.date <= :endDate
            GROUP BY ar.date
            ORDER BY ar.date ASC
            """, nativeQuery = true)
    List<AttendanceTrendProjection> findAttendanceTrendByClass(
            @Param("classId") UUID classId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query(value = """
            SELECT ROUND(SUM(CASE WHEN ar.status = 'PRESENT' THEN 1 ELSE 0 END) * 100.0 / COUNT(ar.id), 2) AS rate
            FROM attendance_records ar
            JOIN students_profile sp ON ar.student_id = sp.student_id
            JOIN classes c ON sp.class_id = c.class_id
            WHERE c.school = :schoolId
              AND ar.date >= :startDate
              AND ar.date <= :endDate
            """, nativeQuery = true)
    Double findAverageAttendanceRateBySchool(
            @Param("schoolId") UUID schoolId,
            @Param("startDate") java.time.LocalDate startDate,
            @Param("endDate") java.time.LocalDate endDate);
}
