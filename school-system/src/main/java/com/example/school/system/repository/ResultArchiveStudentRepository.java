package com.example.school.system.repository;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.school.system.models.ResultArchiveStudent;
import com.example.school.system.types.ArchiveStatus;
import com.example.school.system.types.ExamType;

public interface ResultArchiveStudentRepository extends JpaRepository<ResultArchiveStudent, UUID> {
    List<ResultArchiveStudent> findAllByArchiveId(UUID archiveId);

    List<ResultArchiveStudent> findAllByStudentIdAndArchive_ClassIdAndArchive_AcademicYearAndArchive_TermAndArchive_ExamTypeAndArchive_StatusOrderByArchive_VersionDesc(
            UUID studentId, UUID classId, String academicYear, Integer term, ExamType examType, ArchiveStatus status);
}
