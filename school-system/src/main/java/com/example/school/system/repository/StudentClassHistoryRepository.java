package com.example.school.system.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.school.system.models.StudentClassHistory;

public interface StudentClassHistoryRepository extends JpaRepository<StudentClassHistory, UUID> {
    boolean existsByStudentIdAndSchoolIdAndAcademicYear(UUID studentId, UUID schoolId, String academicYear);

    @Query("""
            SELECT h.student.id FROM StudentClassHistory h
            WHERE h.school.id = :schoolId AND h.academicYear = :academicYear
            """)
    List<UUID> findRecordedStudentIdsForSchoolYear(
            @Param("schoolId") UUID schoolId,
            @Param("academicYear") String academicYear);

    List<StudentClassHistory> findAllByStudentIdOrderByAcademicYearDesc(UUID studentId);

    List<StudentClassHistory> findAllBySchoolIdAndAcademicYearOrderByClassGradeAscClassStreamAscStudentStudentFullNameAsc(
            UUID schoolId,
            String academicYear);
}
