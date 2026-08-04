package com.example.school.system.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.school.system.models.StudentSubjectSelection;

public interface StudentSubjectSelectionRepo extends JpaRepository<StudentSubjectSelection, UUID> {
    int deleteBySubjectJointId(UUID subjectJointId);

    boolean existsByElectiveCodeAndStudentProfileId(String electiveCode, UUID studentProfileId);

    List<StudentSubjectSelection> findAllBySubjectJointId(UUID subjectJointId);

    @Query("""
            SELECT s FROM StudentSubjectSelection s
            JOIN FETCH s.studentProfile
            JOIN FETCH s.subjectJoint sj
            WHERE sj.schoolClass.school.id = :schoolId
            """)
    List<StudentSubjectSelection> findAllBySchoolId(@Param("schoolId") UUID schoolId);
    int deleteByElectiveCodeAndStudentProfileId(String code,UUID profileId);
}
