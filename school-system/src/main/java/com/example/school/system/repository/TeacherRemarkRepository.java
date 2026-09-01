package com.example.school.system.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.school.system.models.TeacherRemark;

public interface TeacherRemarkRepository extends JpaRepository<TeacherRemark, UUID> {
    List<TeacherRemark> findAllBySchoolIdAndSubjectIdAndTeacherId(UUID schoolId, UUID subjectId, UUID teacherId);
    List<TeacherRemark> findAllBySchoolIdAndSubjectId(UUID schoolId, UUID subjectId);
    Optional<TeacherRemark> findBySchoolIdAndSubjectIdAndTeacherIdAndGradeBand(UUID schoolId, UUID subjectId, UUID teacherId, String gradeBand);
}
