package com.example.school.system.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.school.system.models.Users;
import com.example.school.system.projection.LoginView;
import com.example.school.system.types.AccountStatus;
import com.example.school.system.types.SchoolStatus;
import com.example.school.system.types.UserRoles;

public interface UserRepository extends JpaRepository<Users, UUID> {
  boolean existsByEmail(String email);

  boolean existsByIdAndSchoolStatus(UUID userId, SchoolStatus schoolStatus);

  boolean existsByEmailAndStatus(String email, AccountStatus status);

  @EntityGraph(attributePaths = { "studentProfile", "studentProfile.schoolClass" })
  @Query("""
      SELECT u
      FROM Users u
       WHERE u.school.id = :schoolId
         AND :role MEMBER OF u.roles
      """)
  Page<Users> findUsersBySchoolIdWithRole(@Param("schoolId") UUID id, @Param("role") UserRoles role,
      Pageable pageable);

  @Query("""
      SELECT u.id as userId,u.email as email, tp.id as teacherId,r as roles,tp.firstName as firstName ,tp.lastName as lastName ,tp.schoolClass.classId as classId ,tp.schoolClass.classGrade as classGrade,tp.schoolClass.classStream as classStream, u.school.id as schoolId,u.school.schoolSettings.examSettings.examType as examType,u.school.schoolSettings.academicYear as academicYear,u.school.schoolSettings.currentSchoolTerm as currentSchoolTerm, u.password as password, u.school.status as schoolStatus,u.status as status FROM Users u LEFT JOIN u.teacherProfile tp LEFT JOIN u.roles r WHERE u.email = :email
                      """)
  Optional<LoginView> findByEmail(@Param("email") String email);

  @Query("""
      SELECT u.id as userId,u.email as email, tp.id as teacherId,r as roles,tp.firstName as firstName ,tp.lastName as lastName ,tp.schoolClass.classId as classId ,tp.schoolClass.classGrade as classGrade,tp.schoolClass.classStream as classStream, u.school.id as schoolId,u.school.schoolSettings.examSettings.examType as examType,u.school.schoolSettings.academicYear as academicYear,u.school.schoolSettings.currentSchoolTerm as currentSchoolTerm, u.password as password, u.school.status as schoolStatus,u.status as status FROM Users u LEFT JOIN u.teacherProfile tp INNER JOIN u.roles r WHERE u.email = :email
                      """)
  Optional<LoginView> findByUserId(@Param("id") UUID id);

  Optional<Users> findByEmailAndStatus(String email, String status);

  Optional<Users> findByIdAndEmail(UUID id, String email);

  List<Users> findAllBySchoolId(UUID id);

  @Query("""
          SELECT u
          FROM Users u
          WHERE u.school.id = :schoolId
            AND :role NOT MEMBER OF u.roles AND status!=PENDING_APPROVAL AND status!=REJECTED_INVITE
      """)
  @EntityGraph(attributePaths = { "teacherProfile", "teacherProfile.schoolClass", "studentProfile",
      "studentProfile.schoolClass" })
  List<Users> findUsersBySchoolWithoutRole(
      @Param("schoolId") UUID schoolId,
      @Param("role") UserRoles role);

  Optional<Users> findByIdAndRolesContaining(UUID id, UserRoles role);

  @Query("""
          SELECT u
          FROM Users u
          WHERE u.school.id = :schoolId
             AND status=PENDING_APPROVAL
      """)
  List<Users> findBySchoolIdGetPendingInvites(@Param("schoolId") UUID schoolId);

  int deleteAllByStatus(AccountStatus status);

  int deleteAllByStatusAndDeletedAtBefore(AccountStatus status, Instant deletedAt);

  @Query("""
      SELECT COUNT(u)
      FROM Users u
      WHERE u.school.id = :schoolId
        AND :role MEMBER OF u.roles
      """)
  long countBySchoolIdAndRolesContaining(@Param("schoolId") UUID schoolId, @Param("role") UserRoles role);

  @Query("""
      SELECT COUNT(u)
      FROM Users u
      WHERE u.school.id = :schoolId
        AND :role NOT MEMBER OF u.roles
        AND status != PENDING_APPROVAL
        AND status != REJECTED_INVITE
      """)
  long countBySchoolIdAndRolesNotContaining(@Param("schoolId") UUID schoolId, @Param("role") UserRoles role);

  @Query("""
      SELECT u
      FROM Users u
        WHERE 'STUDENT' MEMBER OF u.roles
      """)
  List<Users> findAllStudents();

  @EntityGraph(attributePaths = { "school", "teacherProfile" })
  @Query("""
      SELECT u
      FROM Users u
       WHERE :role NOT MEMBER OF u.roles
      """)
  List<Users> findAllTeachers(@Param("role") UserRoles exceptedRole, Pageable pageable);
}
