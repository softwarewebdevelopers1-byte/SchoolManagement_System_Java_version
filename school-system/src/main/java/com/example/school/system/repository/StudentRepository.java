package com.example.school.system.repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.example.school.system.models.StudentProfile;

public interface StudentRepository extends JpaRepository<StudentProfile, UUID> {
    boolean existsByStudentAdm(String Adm);

    @EntityGraph(attributePaths = { "schoolClass", "schoolClass.teacher", "schoolClass.teacher.teacher", "student", "attendanceRecords" })
    Optional<StudentProfile> findByStudentAdm(String studentAdm);;

    @EntityGraph(attributePaths = { "studentSubjectSelections", "studentSubjectSelections.subjectJoint", "student", "schoolClass" })
    Page<StudentProfile> findBySchoolClassClassId(UUID classId, Pageable pageable);

    @EntityGraph(attributePaths = { "studentSubjectSelections", "studentSubjectSelections.subjectJoint", "student", "schoolClass" })
    List<StudentProfile> findAllBySchoolClassClassId(UUID classId);

    long countByschoolClassClassId(UUID classId);

    @Query("SELECT sp.schoolClass.classId, COUNT(sp) FROM StudentProfile sp WHERE sp.schoolClass.school.id = :schoolId GROUP BY sp.schoolClass.classId")
    List<Object[]> countBySchoolId(UUID schoolId);

    default Map<UUID, Long> countBySchoolIdAsMap(UUID schoolId) {
        return countBySchoolId(schoolId).stream()
                .collect(Collectors.toMap(arr -> (UUID) arr[0], arr -> (Long) arr[1]));
    }
}

