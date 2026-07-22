package com.example.school.system.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.school.system.models.SubjectJoint;

public interface SubjectJointRepo extends JpaRepository<SubjectJoint, UUID> {
    Optional<SubjectJoint> findByIdAndSchoolClassClassId(UUID id, UUID classId);

    boolean existsBySubjectIdAndSchoolClassClassId(UUID subjectId, UUID classId);

    List<SubjectJoint> findAllBySchoolClass_schoolId(UUID schoolId);
}
