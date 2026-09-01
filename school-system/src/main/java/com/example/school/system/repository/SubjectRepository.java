package com.example.school.system.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.school.system.DTO.DTOResponse.SubjectListDTO;
import com.example.school.system.models.Subject;

public interface SubjectRepository extends JpaRepository<Subject, UUID> {
    boolean existsBySubjectNameAndSchoolId(String subjectName, UUID schoolId);

    Optional<Subject> findBySubjectNameAndSchoolId(String subjectName, UUID schoolId);

        @Query("""
            SELECT s
            FROM Subject s
            LEFT JOIN FETCH s.school
            WHERE s.school.id = :schoolId
            """)
        List<Subject> findAllBySchoolIdWithSchool(@Param("schoolId") UUID schoolId);

    @Query("""
        SELECT new com.example.school.system.DTO.DTOResponse.SubjectListDTO(
            s.id,
            s.subjectName,
            s.mainTeacher.id
        )
        FROM Subject s
        WHERE s.school.id = :schoolId
    """)
    List<SubjectListDTO> findSubjectSummariesBySchoolId(@Param("schoolId") UUID schoolId);

    Optional<Subject> findByIdAndSchoolId(UUID id, UUID schoolId);

    long countBySchoolId(UUID schoolId);
}
