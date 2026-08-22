package com.example.school.system.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.school.system.models.SubjectJoint;
import com.example.school.system.types.SubjectType;

public interface SubjectJointRepo extends JpaRepository<SubjectJoint, UUID> {
        @EntityGraph(attributePaths = { "schoolClass", "schoolClass.school", "schoolClass.school.schoolSettings", "schoolClass.school.schoolSettings.examSettings", "subject" })
        Optional<SubjectJoint> findByIdAndSchoolClassClassId(UUID id, UUID classId);

        boolean existsBySubjectIdAndSchoolClassClassId(UUID subjectId, UUID classId);

        @EntityGraph(attributePaths = { "teacherProfile", "schoolClass", "subject" })
        List<SubjectJoint> findAllBySchoolClass_schoolId(UUID schoolId);

        @EntityGraph(attributePaths = { "teacherProfile", "schoolClass", "subject" })
        List<SubjectJoint> findAllBySchoolClassClassId(UUID classId);;

        Optional<SubjectJoint> findByIdAndElectiveCodeAndSubjectTypeAndSchoolClass_schoolId(UUID subjectJointId,
                        String electiveCode,
                        SubjectType subjectType,
                        UUID schoolId);

        List<SubjectJoint> findAllBySubjectTypeAndSchoolClassClassId(SubjectType subjectType, UUID classId);

        @Query("""
                        SELECT s FROM SubjectJoint s WHERE NOT s.subjectType = :subjectType AND id = :id
                        """)
        @EntityGraph(attributePaths = {"schoolClass", "schoolClass.school", "schoolClass.school.schoolSettings", "schoolClass.school.schoolSettings.examSettings"})
        Optional<SubjectJoint> findByIdWithoutSubjectType(@Param("id") UUID subjectJointId,
                        @Param("subjectType") SubjectType subjectType);

        @Query("""
                        SELECT COUNT(s) FROM SubjectJoint s WHERE NOT s.subjectType = :subjectType AND  schoolClass.classId= :id
                        """)
        Integer countByclassIdWithoutSubjectType(@Param("id") UUID subjectJointId,
                        @Param("subjectType") SubjectType subjectType);

        List<SubjectJoint> findBySubjectTypeAndElectiveCode(SubjectType subjectType, String electiveCode);

        @EntityGraph(attributePaths = { "schoolClass", "subject" })
        List<SubjectJoint> findAllByTeacherProfileId(UUID teacherProfileId);
}
