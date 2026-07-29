package com.example.school.system.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.school.system.models.SubjectRequirement;

public interface SubjectRequirementRepository extends JpaRepository<SubjectRequirement, UUID> {
    List<SubjectRequirement> findAllBySchoolId(UUID schoolId);

    Optional<SubjectRequirement> findBySchoolIdAndSchoolClassClassIdAndSubjectJointId(
            UUID schoolId,
            UUID classId,
            UUID subjectJointId);
}
