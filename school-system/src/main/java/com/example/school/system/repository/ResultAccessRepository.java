package com.example.school.system.repository;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.school.system.models.ResultAccess;
import com.example.school.system.types.ExamType;

public interface ResultAccessRepository extends JpaRepository<ResultAccess, UUID> {
    Optional<ResultAccess> findByTokenHash(String tokenHash);

    Optional<ResultAccess> findByStudentProfileIdAndAcademicYearAndCurrentSchoolTermAndExamType(
            UUID studentId, String academicYear, Integer term, ExamType examType);

    List<ResultAccess> findAllByStudentProfileIdInAndAcademicYearAndCurrentSchoolTermAndExamType(
            List<UUID> studentIds, String academicYear, Integer term, ExamType examType);
}
