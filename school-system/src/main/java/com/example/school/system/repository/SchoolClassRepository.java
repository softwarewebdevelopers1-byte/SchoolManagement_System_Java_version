package com.example.school.system.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.school.system.models.SchoolClass;
import com.example.school.system.projection.ClassHeaderProjection;
import com.example.school.system.projection.ClassTeacherProjection;
import com.example.school.system.projection.GetAllClasses;

public interface SchoolClassRepository extends JpaRepository<SchoolClass, UUID> {
    boolean existsByClassId(Integer classId);

    SchoolClass findByClassStream(String classStream);

    SchoolClass findByClassGrade(Integer classGrade);

    Optional<SchoolClass> findByClassGradeAndClassStream(Integer classGrade, String stream);

    Optional<SchoolClass> findByClassIdAndSchoolId(UUID classId, UUID schoolId);

    @EntityGraph(attributePaths = { "teacher", "teacher.teacher", "student" })
    Optional<SchoolClass> findByClassId(UUID classId);

    boolean existsByClassGradeAndClassStreamAndSchoolId(Integer classGrade, String classStream, UUID schoolId);

    // Safe projection query — no Cartesian product with students
    @Query("""
        SELECT new com.example.school.system.projection.ClassHeaderProjection(
            c.classId, c.classGrade, c.classStream, c.completed
        )
        FROM SchoolClass c
        WHERE c.school.id = :schoolId
    """)
    List<ClassHeaderProjection> findClassHeadersBySchoolId(@Param("schoolId") UUID schoolId);

    // Separate query for class teachers — avoids joining students
    @Query("""
        SELECT tp.schoolClass.classId as classId,
               tp.id as teacherProfileId,
               u.id as userId,
               u.email,
               tp.firstName,
               tp.lastName
        FROM TeacherProfile tp
        JOIN tp.teacher u
        WHERE tp.schoolClass.school.id = :schoolId
    """)
    List<ClassTeacherProjection> findClassTeachersBySchoolId(@Param("schoolId") UUID schoolId);

    // Legacy projection kept for backward compatibility
    @Query("""
        SELECT DISTINCT c.classGrade as classGrade, c.classStream as classStream, ta.id as userId,t.firstName as firstName, t.lastName as lastName,c.classId as classId
        FROM SchoolClass c
        LEFT JOIN c.teacher t
        LEFT JOIN t.teacher ta
        WHERE c.school.id = :schoolId
        """)
    List<GetAllClasses> findAllProjectionBySchoolIdWithTeacherAndStudents(@Param("schoolId") UUID schoolId);

    // Optimized with teacher graph; students batch-loaded via @BatchSize to avoid Cartesian product
    @Query("""
        SELECT DISTINCT c
        FROM SchoolClass c
        LEFT JOIN FETCH c.teacher teacher
        LEFT JOIN FETCH teacher.teacher
        WHERE c.school.id = :schoolId
        """)
    List<SchoolClass> findAllBySchoolIdWithTeacherAndStudents(@Param("schoolId") UUID schoolId);

    boolean existsBySchoolId(UUID schoolId);

    long countBySchoolId(UUID schoolId);
}
