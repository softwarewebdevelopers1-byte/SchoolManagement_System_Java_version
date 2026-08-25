package com.example.school.system.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.school.system.models.TeacherProfile;

public interface TeacherProfileRepository extends JpaRepository<TeacherProfile, UUID> {
    @EntityGraph(attributePaths = { "teacher", "schoolClass" })
    Optional<TeacherProfile> findByTeacher_Id(UUID id);

    @EntityGraph(attributePaths = { "teacher", "schoolClass" })
    Optional<TeacherProfile> findByTeacher(UUID id);

    @EntityGraph(attributePaths = { "teacher", "schoolClass" })
    @Query("SELECT tp FROM TeacherProfile tp JOIN tp.teacher t WHERE t.id IN :teacherIds")
    List<TeacherProfile> findAllByTeacherIdIn(@Param("teacherIds") Iterable<UUID> teacherIds);
}
