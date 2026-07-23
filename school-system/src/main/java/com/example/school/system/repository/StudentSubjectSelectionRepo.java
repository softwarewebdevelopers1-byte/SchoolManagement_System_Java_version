package com.example.school.system.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.school.system.models.StudentSubjectSelection;

public interface StudentSubjectSelectionRepo extends JpaRepository<StudentSubjectSelection, UUID> {
    int deleteBySubjectJointId(UUID subjectJointId);

    boolean existsByElectiveCodeAndStudentProfileId(String electiveCode, UUID studentProfileId);

    List<StudentSubjectSelection> findAllBySubjectJointId(UUID subjectJointId);
}
