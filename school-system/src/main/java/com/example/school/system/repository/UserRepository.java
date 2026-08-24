package com.example.school.system.repository;

import java.time.Instant;
import java.util.HashSet;
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
import com.example.school.system.projection.CredentialsView;
import com.example.school.system.projection.LoginData;
import com.example.school.system.projection.LoginView;
import com.example.school.system.projection.StudentsLoaded;
import com.example.school.system.projection.TeachersLoaded;
import com.example.school.system.types.AccountStatus;
import com.example.school.system.types.SchoolStatus;
import com.example.school.system.types.UserRoles;

public interface UserRepository extends JpaRepository<Users, UUID> {
    boolean existsByEmail(String email);

    boolean existsByIdAndSchoolStatus(UUID userId, SchoolStatus schoolStatus);

    boolean existsByEmailAndStatus(String email, AccountStatus status);
    
    @Query("""
             SELECT u.id as userId, u.email as email,u.status as status,sp.studentFullName as fullName, sp.studentAdm as adm, sp.gender as gender,sp.phoneNumber as phoneNumber,sp.guardianName as guardianName, c.classGrade as classGrade, c.classStream as classStream
            FROM Users u
            LEFT JOIN u.studentProfile sp
            LEFT JOIN sp.schoolClass c
            WHERE u.school.id = :schoolId
              AND :role MEMBER OF u.roles AND c.completed  = false
            """)
    Page<StudentsLoaded> findLiveStudentsBySchoolIdWithRole(@Param("schoolId") UUID id, @Param("role") UserRoles role,
            Pageable pageable);

    @Query("""
            SELECT u.id as userId, u.email as email,u.status as status,sp.studentFullName as fullName, sp.studentAdm as adm, sp.gender as gender,sp.phoneNumber as phoneNumber,sp.guardianName as guardianName, c.classGrade as classGrade, c.classStream as classStream
            FROM Users u
            LEFT JOIN u.studentProfile sp
            LEFT JOIN sp.schoolClass c
            WHERE u.school.id = :schoolId
              AND :role MEMBER OF u.roles AND c.completed = true
            """)
    Page<StudentsLoaded> findExitedStudentsBySchoolIdWithRole(@Param("schoolId") UUID id, @Param("role") UserRoles role,
            Pageable pageable);

    @Query("""
            SELECT u.id as userId, u.email as email, u.password as password
            FROM Users u
            WHERE u.email = :email
            """)
    Optional<CredentialsView> findCredentialsByEmail(@Param("email") String email);

        @Query("""
                        SELECT new com.example.school.system.projection.LoginData(
                                u.id, u.email, tp.id, tp.firstName, tp.lastName,
                                c.classId, c.classStream, c.classGrade, s.id,
                                es.examType, ss.academicYear, ss.currentSchoolTerm,
                                s.status, u.password, u.status)
                        FROM Users u
                        LEFT JOIN u.teacherProfile tp
                        LEFT JOIN tp.schoolClass c
                        LEFT JOIN u.school s
                        LEFT JOIN s.schoolSettings ss
                        LEFT JOIN ss.examSettings es
                        WHERE u.id = :id
                        """)
        Optional<LoginData> findLoginDataById(@Param("id") UUID id);

        @Query("SELECT r FROM Users u JOIN u.roles r WHERE u.id = :id")
        List<UserRoles> findRolesByUserId(@Param("id") UUID id);

        default Optional<LoginView> findByUserId(UUID id) {
                return findLoginDataById(id).map(loginData -> {
                        loginData.setRoles(new HashSet<>(findRolesByUserId(id)));
                        return loginData;
                });
        }

    Optional<Users> findByEmailAndStatus(String email, String status);

    Optional<Users> findByIdAndEmail(UUID id, String email);

    List<Users> findAllBySchoolId(UUID id);

    @Query("""
                SELECT u.id as userId, u.email as email, u.status as status,  r as roles, c.classStream as classStream,c.classGrade as classGrade, tp.firstName as firstName, tp.lastName as lastName, tp.phoneNumber as phoneNumber, tp.id as teacherId
                FROM Users u
                LEFT JOIN u.roles r
                LEFT JOIN u.teacherProfile tp
                LEFT JOIN tp.schoolClass c
                WHERE u.school.id = :schoolId
                  AND :role NOT MEMBER OF u.roles
                  AND u.status != PENDING_APPROVAL
                  AND u.status != REJECTED_INVITE
            """)
    List<TeachersLoaded> findUsersBySchoolWithoutRole(
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
