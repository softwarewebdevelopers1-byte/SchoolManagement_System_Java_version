package com.example.school.system.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.school.system.models.SchoolClass;
import com.example.school.system.projection.GetAllClasses;

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

         @Query("""
            SELECT DISTINCT c.classGrade as classGrade, c.classStream as classStream, ta.id as userId,t.firstName as firstName, t.lastName as lastName,c.classId as classId
            FROM SchoolClass c
            LEFT JOIN c.teacher t
            LEFT JOIN t.teacher ta
            LEFT JOIN c.student s
            WHERE c.school.id = :schoolId
            """)
    List<GetAllClasses> findAllProjectionBySchoolIdWithTeacherAndStudents(@Param("schoolId") UUID schoolId);

    boolean existsBySchoolId(UUID schoolId);

    long countBySchoolId(UUID schoolId);
}
