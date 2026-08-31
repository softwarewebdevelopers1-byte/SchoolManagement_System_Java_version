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
import com.example.school.system.DTO.DTOResponse.PendingInviteDTO;
import com.example.school.system.models.Users;
import com.example.school.system.projection.CredentialsView;
import com.example.school.system.projection.LoginSummaryProjection;
import com.example.school.system.projection.TeacherSummaryProjection;
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
    Page<com.example.school.system.projection.StudentsLoaded> findLiveStudentsBySchoolIdWithRole(
            @Param("schoolId") UUID id, @Param("role") UserRoles role,
            Pageable pageable);

    @Query("""
            SELECT u.id as userId, u.email as email,u.status as status,sp.studentFullName as fullName, sp.studentAdm as adm, sp.gender as gender,sp.phoneNumber as phoneNumber,sp.guardianName as guardianName, c.classGrade as classGrade, c.classStream as classStream
            FROM Users u
            LEFT JOIN u.studentProfile sp
            LEFT JOIN sp.schoolClass c
            WHERE u.school.id = :schoolId
              AND :role MEMBER OF u.roles AND c.completed = true
            """)
    Page<com.example.school.system.projection.StudentsLoaded> findExitedStudentsBySchoolIdWithRole(
            @Param("schoolId") UUID id, @Param("role") UserRoles role,
            Pageable pageable);

    @Query("""
            SELECT u.id as userId, u.email as email, u.password as password
            FROM Users u
            WHERE u.email = :email
            """)
    Optional<CredentialsView> findCredentialsByEmail(@Param("email") String email);

    @Query("""
                SELECT new com.example.school.system.projection.LoginSummaryProjection(
                    u.id, u.email, u.password,
                    u.status,
                    s.id, s.schoolName, s.status,
                    ss.currentSchoolTerm, ss.academicYear,
                    es.examType
                )
                FROM Users u
                LEFT JOIN u.school s
                LEFT JOIN s.schoolSettings ss
                LEFT JOIN ss.examSettings es
                WHERE u.email = :email
            """)
    Optional<LoginSummaryProjection> findLoginSummaryByEmail(@Param("email") String email);

    @Query("""
                SELECT r
                FROM Users u
                JOIN u.roles r
                WHERE u.id = :id
            """)
    List<UserRoles> findRolesByUserId(@Param("id") UUID id);

    default Optional<com.example.school.system.projection.LoginView> findByUserId(UUID id) {
        return findLoginDataById(id).map(loginData -> {
            loginData.setRoles(new HashSet<>(findRolesByUserId(id)));
            return loginData;
        });
    }

    default Optional<com.example.school.system.projection.LoginView> findByEmail(String email) {
        return findLoginDataByEmail(email).map(loginData -> {
            loginData.setRoles(new HashSet<>(findRolesByUserId(loginData.getUserId())));
            return loginData;
        });
    }

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
    Optional<com.example.school.system.projection.LoginData> findLoginDataById(@Param("id") UUID id);

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
                WHERE u.email = :email
            """)
    Optional<com.example.school.system.projection.LoginData> findLoginDataByEmail(@Param("email") String email);

    Optional<Users> findByEmailAndStatus(String email, String status);

    Optional<Users> findUsersByEmail(String email);

    Optional<Users> findByIdAndEmail(UUID id, String email);

    List<Users> findAllBySchoolId(UUID id);

    // Replaced with projection below; kept only if mutation code still uses it
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

    @Query(value = """
                SELECT u.id as userId, u.email as email, u.status as status,
                       GROUP_CONCAT(r.roles) as roles,
                       tp.first_name as firstName, tp.last_name as lastName,
                       tp.phone_number as phoneNumber, tp.id as teacherId,
                       c.stream as classStream, c.grade as classGrade
                FROM users u
                LEFT JOIN users_roles r ON u.id = r.users_id
                LEFT JOIN teachers_profile tp ON u.id = tp.teacher_account
                LEFT JOIN classes c ON tp.class_id = c.class_id
                WHERE u.school_id = :schoolId
                  AND NOT FIND_IN_SET(:role, (
                      SELECT GROUP_CONCAT(r2.roles)
                      FROM users_roles r2
                      WHERE r2.users_id = u.id
                  ))
                  AND u.status != 'PENDING_APPROVAL'
                  AND u.status != 'REJECTED_INVITE'
                GROUP BY u.id, u.email, u.status, tp.first_name, tp.last_name,
                         tp.phone_number, tp.id, c.stream, c.grade
            """, nativeQuery = true)
    List<Object[]> findUsersBySchoolWithoutRoleNative(
            @Param("schoolId") UUID schoolId,
            @Param("role") String role);

    // NEW: Lightweight teacher summary projection with pagination
    @Query("""
                SELECT new com.example.school.system.projection.TeacherSummaryProjection(
                    u.id, u.email, u.status, r,
                    tp.firstName, tp.lastName, tp.phoneNumber,
                    tp.id, s.id, s.schoolName,
                    c.classGrade, c.classStream
                )
                FROM Users u
                JOIN u.roles r
                LEFT JOIN u.teacherProfile tp
                LEFT JOIN tp.schoolClass c
                LEFT JOIN u.school s
                WHERE (:schoolId IS NULL OR u.school.id = :schoolId)
                  AND :role NOT MEMBER OF u.roles
                  AND u.status NOT IN (com.example.school.system.types.AccountStatus.PENDING_APPROVAL,
                                       com.example.school.system.types.AccountStatus.REJECTED_INVITE)
            """)
    Page<TeacherSummaryProjection> findTeacherSummariesBySchool(
            @Param("schoolId") UUID schoolId,
            @Param("role") UserRoles role,
            Pageable pageable);

    // NEW: Batched user counts grouped by school for SuperAdmin
    @Query("""
                SELECT u.school.id as schoolId,
                       COUNT(u) as totalUsers,
                       SUM(CASE WHEN u.status = com.example.school.system.types.AccountStatus.ACTIVE THEN 1 ELSE 0 END) as activeUsers
                FROM Users u
                WHERE u.school IS NOT NULL
                  AND u.deletedAt IS NULL
                GROUP BY u.school.id
            """)
    List<Object[]> countActiveUsersGroupedBySchool();

    Optional<Users> findByIdAndRolesContaining(UUID id, UserRoles role);

    @Query("""
                SELECT u
                FROM Users u
                WHERE u.school.id = :schoolId
                   AND status=PENDING_APPROVAL
            """)
    List<Users> findBySchoolIdGetPendingInvites(@Param("schoolId") UUID schoolId);

    @Query("""
                SELECT new com.example.school.system.DTO.DTOResponse.PendingInviteDTO(
                    u.id, u.email, u.status
                )
                FROM Users u
                WHERE u.school.id = :schoolId AND u.status = com.example.school.system.types.AccountStatus.PENDING_APPROVAL
            """)
    List<PendingInviteDTO> findPendingInvitesBySchoolId(@Param("schoolId") UUID schoolId);

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
