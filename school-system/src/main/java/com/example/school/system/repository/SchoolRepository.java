package com.example.school.system.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.school.system.DTO.DTOResponse.SchoolSettingsDTO;
import com.example.school.system.models.School;
import com.example.school.system.types.SchoolStatus;

public interface SchoolRepository extends JpaRepository<School, UUID> {
    boolean existsBySchoolName(String schoolName);

    boolean existsByEmail(String schoolEmail);

    Optional<School> findBySchoolName(String schoolName);

    Optional<School> findBySchoolCode(String code);

    Optional<School> findBySchoolCodeAndStatus(String code, SchoolStatus status);

    Optional<School> findByEmail(String schoolEmail);

    List<School> findAllByStatus(SchoolStatus status);

    Optional<School> findByIdAndSchoolNameAndStatus(UUID id, String schoolName,SchoolStatus status);

    @Query("SELECT new com.example.school.system.repository.SchoolSummaryRow(s.id, s.schoolCode, s.schoolName) FROM School s")
    List<SchoolSummaryRow> findAllSchoolSummaries();

    @EntityGraph(attributePaths = { "schoolSettings", "schoolSettings.examSettings" })
    @Query("SELECT s FROM School s WHERE s.id = :id")
    Optional<School> findByIdWithSettings(@Param("id") UUID id);

    @Query("""
        SELECT new com.example.school.system.DTO.DTOResponse.SchoolSettingsDTO(
            s.schoolName, s.schoolCode, s.email, s.schoolMotto, s.address, s.phoneNumber
        )
        FROM School s WHERE s.id = :id
    """)
    Optional<SchoolSettingsDTO> findSchoolSettingsById(@Param("id") UUID id);
}
