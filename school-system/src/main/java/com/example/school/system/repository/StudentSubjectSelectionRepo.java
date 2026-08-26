package com.example.school.system.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.school.system.models.StudentSubjectSelection;

public interface StudentSubjectSelectionRepo extends JpaRepository<StudentSubjectSelection, UUID> {
    @Modifying
    int deleteBySubjectJointId(UUID subjectJointId);

    boolean existsByElectiveCodeAndStudentProfileId(String electiveCode, UUID studentProfileId);

    @EntityGraph(attributePaths = { "studentProfile", "studentProfile.schoolClass" })
    List<StudentSubjectSelection> findAllBySubjectJointId(UUID subjectJointId);

    @Query("""
            SELECT s FROM StudentSubjectSelection s
            JOIN FETCH s.studentProfile
            JOIN FETCH s.subjectJoint sj
            WHERE sj.schoolClass.school.id = :schoolId
            """)
    List<StudentSubjectSelection> findAllBySchoolId(@Param("schoolId") UUID schoolId);

    @Modifying
    int deleteByElectiveCodeAndStudentProfileId(String code, UUID profileId);

    Optional<StudentSubjectSelection> findByElectiveCodeAndStudentProfileId(String code, UUID profileId);

    @Query("""
        SELECT s.studentProfile.id FROM StudentSubjectSelection s
        WHERE s.electiveCode = :electiveCode AND s.studentProfile.id IN :studentProfileIds
    """)
    List<UUID> findEnrolledStudentIdsByElectiveCodeAndStudentIds(
            @Param("electiveCode") String electiveCode,
            @Param("studentProfileIds") List<UUID> studentProfileIds);

    @Query("""
        SELECT s.studentProfile.id, s.subjectJoint.id
        FROM StudentSubjectSelection s
        WHERE s.studentProfile.schoolClass.classId = :classId
    """)
    List<Object[]> findEnrollmentPairsByClassId(@Param("classId") UUID classId);
}