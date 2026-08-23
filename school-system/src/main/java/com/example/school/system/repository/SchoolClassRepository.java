package com.example.school.system.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.school.system.models.SchoolClass;

public interface SchoolClassRepository extends JpaRepository<SchoolClass, UUID> {
    boolean existsByClassId(Integer classId);

    SchoolClass findByClassStream(String classStream);

    SchoolClass findByClassGrade(Integer classGrade);

    Optional<SchoolClass> findByClassGradeAndClassStream(Integer classGrade, String classStream);

    Optional<SchoolClass> findByClassIdAndSchoolId(UUID classId, UUID schoolId);

    @EntityGraph(attributePaths = { "teacher", "teacher.teacher", "student" })
    Optional<SchoolClass> findByClassId(UUID classId);

    boolean existsByClassGradeAndClassStreamAndSchoolId(Integer classGrade, String classStream, UUID schoolId);

        @Query("""
            SELECT DISTINCT c
            FROM SchoolClass c
            LEFT JOIN FETCH c.teacher teacher
            LEFT JOIN FETCH teacher.teacher
            LEFT JOIN FETCH c.student
            WHERE c.school.id = :schoolId
            """)
        List<SchoolClass> findAllBySchoolIdWithTeacherAndStudents(@Param("schoolId") UUID schoolId);

    boolean existsBySchoolId(UUID schoolId);

    long countBySchoolId(UUID schoolId);
}
