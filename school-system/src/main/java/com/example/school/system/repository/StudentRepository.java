package com.example.school.system.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.school.system.models.StudentProfile;

public interface StudentRepository extends JpaRepository<StudentProfile, UUID> {
    boolean existsByStudentAdm(String Adm);

    Optional<StudentProfile> findByStudentAdm(String studentAdm);;

    Page <StudentProfile> findBySchoolClassClassId(UUID classId,Pageable pageable);
}
