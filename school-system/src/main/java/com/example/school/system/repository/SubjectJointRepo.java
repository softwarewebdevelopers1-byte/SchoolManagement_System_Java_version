package com.example.school.system.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.school.system.DTO.DTOResponse.SubjectJointClassDTO;
import com.example.school.system.DTO.DTOResponse.SubjectJointForTeacherDTO;
import com.example.school.system.DTO.DTOResponse.SubjectJointSummaryDTO;
import com.example.school.system.models.SubjectJoint;
import com.example.school.system.types.SubjectType;

public interface SubjectJointRepo extends JpaRepository<SubjectJoint, UUID> {
        @EntityGraph(attributePaths = { "schoolClass", "schoolClass.school", "schoolClass.school.schoolSettings", "schoolClass.school.schoolSettings.examSettings", "subject" })
        Optional<SubjectJoint> findByIdAndSchoolClassClassId(UUID id, UUID classId);

        boolean existsBySubjectIdAndSchoolClassClassId(UUID subjectId, UUID classId);

        @EntityGraph(attributePaths = { "teacherProfile", "schoolClass", "subject" })
        List<SubjectJoint> findAllBySchoolClass_schoolId(UUID schoolId);

        @EntityGraph(attributePaths = { "teacherProfile", "schoolClass", "subject" })
        List<SubjectJoint> findAllBySchoolClassClassId(UUID classId);

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

        @Query("""
            SELECT new com.example.school.system.DTO.DTOResponse.SubjectJointSummaryDTO(
                sj.id,
                s.subjectName,
                CONCAT(c.classGrade, ' ', c.classStream),
                c.classId,
                tp.id,
                CASE WHEN tp IS NOT NULL THEN CONCAT(tp.firstName, ' ', tp.lastName) ELSE '' END,
                sj.subjectType,
                sj.electiveCode
            )
            FROM SubjectJoint sj
            JOIN sj.subject s
            JOIN sj.schoolClass c
            LEFT JOIN sj.teacherProfile tp
            WHERE c.school.id = :schoolId
        """)
        List<SubjectJointSummaryDTO> findSubjectJointSummariesBySchoolId(@Param("schoolId") UUID schoolId);

        @Query("""
            SELECT new com.example.school.system.DTO.DTOResponse.SubjectJointForTeacherDTO(
                sj.id,
                c.classGrade,
                c.classStream,
                s.subjectName,
                sj.subjectType,
                sj.electiveCode
            )
            FROM SubjectJoint sj
            JOIN sj.subject s
            JOIN sj.schoolClass c
            WHERE sj.teacherProfile.id = :teacherProfileId
        """)
        List<SubjectJointForTeacherDTO> findSummariesByTeacherProfileId(@Param("teacherProfileId") UUID teacherProfileId);

        @Query("""
            SELECT new com.example.school.system.DTO.DTOResponse.SubjectJointClassDTO(
                sj.id,
                s.subjectName,
                sj.subjectType,
                sj.electiveCode
            )
            FROM SubjectJoint sj
            JOIN sj.subject s
            WHERE sj.schoolClass.classId = :classId
        """)
        List<SubjectJointClassDTO> findSummariesByClassId(@Param("classId") UUID classId);
}
