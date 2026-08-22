package com.example.school.system.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.school.system.models.Timetable;
import com.example.school.system.types.TimetableStatus;

public interface TimetableRepository extends JpaRepository<Timetable, UUID> {
    Optional<Timetable> findFirstBySchoolIdAndAcademicYearAndTermAndStatusOrderByGeneratedAtDesc(
            UUID schoolId,
            String academicYear,
            Integer term,
            TimetableStatus status);

    List<Timetable> findAllBySchoolIdOrderByGeneratedAtDesc(UUID schoolId);

    void deleteBySchoolIdAndAcademicYearAndTerm(UUID schoolId, String academicYear, Integer term);
    List<Timetable> findAllByStatus(TimetableStatus status);

    boolean existsBySchoolId(UUID schoolId);
}
