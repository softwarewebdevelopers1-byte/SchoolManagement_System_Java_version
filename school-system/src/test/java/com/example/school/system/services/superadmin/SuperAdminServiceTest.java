package com.example.school.system.services.superadmin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.school.system.DTO.DTOResponse.SuperAdminSchoolRes;
import com.example.school.system.DTO.DTOResponse.SuperAdminUserRes;
import com.example.school.system.controller.superadmin.PlatformStatisticsDto;
import com.example.school.system.models.ExpiryLinks;
import com.example.school.system.models.School;
import com.example.school.system.models.Users;
import com.example.school.system.projection.PlatformStaffStatusCountProjection;
import com.example.school.system.repository.ExpiryLinksRepository;
import com.example.school.system.repository.SchoolRepository;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.services.JwtCreationService;
import com.example.school.system.types.AccountStatus;
import com.example.school.system.types.SchoolStatus;
import com.example.school.system.types.UserRoles;

@ExtendWith(MockitoExtension.class)
class SuperAdminServiceTest {

    @Mock
    private SchoolRepository schoolRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ExpiryLinksRepository expiryLinksRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtCreationService jwtCreationService;

    @InjectMocks
    private SuperAdminService superAdminService;

    @Test
    void getPlatformStatistics_shouldUseAggregatesAndReturnRecentInvitations() {
        when(schoolRepository.count()).thenReturn(4L);
        when(schoolRepository.countByStatus(SchoolStatus.ACTIVE)).thenReturn(2L);
        when(schoolRepository.countByStatus(SchoolStatus.PENDING_APPROVAL)).thenReturn(1L);
        when(schoolRepository.countByStatus(SchoolStatus.REJECTED_APPROVAL)).thenReturn(1L);
        when(schoolRepository.countByStatus(SchoolStatus.INACTIVE)).thenReturn(0L);
        when(userRepository.countPlatformStaffByStatus()).thenReturn(List.of(
                statusCount(AccountStatus.ACTIVE, 4L),
                statusCount(AccountStatus.PENDING_APPROVAL, 1L),
                statusCount(AccountStatus.SUSPENDED, 2L)));
        when(userRepository.countByRole(UserRoles.STUDENT)).thenReturn(100L);
        when(userRepository.countByRoleSince(org.mockito.ArgumentMatchers.eq(UserRoles.STUDENT),
                org.mockito.ArgumentMatchers.any())).thenReturn(6L);
        when(userRepository.countRegistrationsSince(org.mockito.ArgumentMatchers.any())).thenReturn(8L);

        UUID invitationUserId = UUID.randomUUID();
        Users invitedUser = new Users();
        invitedUser.setId(invitationUserId);
        invitedUser.setEmail("admin@school.test");
        when(userRepository.findAllById(List.of(invitationUserId))).thenReturn(List.of(invitedUser));

        ExpiryLinks invitation = new ExpiryLinks();
        invitation.setId(UUID.randomUUID());
        invitation.setUsers(invitationUserId);
        invitation.setSchoolId(UUID.randomUUID());
        invitation.setRoleName(UserRoles.ADMIN.name());
        invitation.setCreatedAt(LocalDateTime.now());
        invitation.setExpirationTime(LocalDateTime.now().plusDays(1));
        when(expiryLinksRepository.findTop10ByOrderByCreatedAtDesc()).thenReturn(List.of(invitation));

        PlatformStatisticsDto result = superAdminService.getPlatformStatistics();

        assertThat(result.totalSchools()).isEqualTo(4L);
        assertThat(result.activeSchools()).isEqualTo(2L);
        assertThat(result.totalStaff()).isEqualTo(7L);
        assertThat(result.activeStaff()).isEqualTo(4L);
        assertThat(result.pendingStaff()).isEqualTo(1L);
        assertThat(result.suspendedStaff()).isEqualTo(2L);
        assertThat(result.totalStudents()).isEqualTo(100L);
        assertThat(result.recentEnrollments()).isEqualTo(6L);
        assertThat(result.recentRegistrations()).isEqualTo(8L);
        assertThat(result.recentActivity()).isEmpty();
        assertThat(result.recentInvitations()).singleElement().satisfies(item ->
                assertThat(item).asInstanceOf(org.assertj.core.api.InstanceOfAssertFactories.MAP)
                        .containsEntry("email", "admin@school.test")
                        .containsEntry("status", "ACTIVE"));
    }

    private PlatformStaffStatusCountProjection statusCount(AccountStatus status, Long count) {
        return new PlatformStaffStatusCountProjection() {
            @Override
            public AccountStatus getStatus() {
                return status;
            }

            @Override
            public Long getCount() {
                return count;
            }
        };
    }

    @Test
    void getPlatformStaff_shouldIncludeAllStatusesAndExcludeStudentsAndSuperAdmins() {
        Users admin = new Users();
        admin.setId(UUID.randomUUID());
        admin.setEmail("admin@demo.com");
        admin.setRoles(Set.of(UserRoles.ADMIN));
        admin.setStatus(AccountStatus.PENDING_APPROVAL);

        Users teacher = new Users();
        teacher.setId(UUID.randomUUID());
        teacher.setEmail("teacher@demo.com");
        teacher.setRoles(Set.of(UserRoles.CLASSTEACHER));
        teacher.setStatus(AccountStatus.SUSPENDED);

        Users teacherWithoutRole = new Users();
        teacherWithoutRole.setId(UUID.randomUUID());
        teacherWithoutRole.setEmail("no-role-teacher@demo.com");
        teacherWithoutRole.setRoles(Set.of());
        teacherWithoutRole.setStatus(AccountStatus.ACTIVE);
        teacherWithoutRole.setTeacherProfile(new com.example.school.system.models.TeacherProfile());
        teacherWithoutRole.getTeacherProfile().setFirstName("No");
        teacherWithoutRole.getTeacherProfile().setLastName("Role");

        Users rejectedStaff = new Users();
        rejectedStaff.setId(UUID.randomUUID());
        rejectedStaff.setEmail("rejected@demo.com");
        rejectedStaff.setRoles(Set.of(UserRoles.SUBJECTTEACHER));
        rejectedStaff.setStatus(AccountStatus.REJECTED_INVITE);

        Users deletedStaff = new Users();
        deletedStaff.setId(UUID.randomUUID());
        deletedStaff.setEmail("deleted@demo.com");
        deletedStaff.setRoles(Set.of(UserRoles.HEADTEACHER));
        deletedStaff.setStatus(AccountStatus.DELETED);

        Users student = new Users();
        student.setId(UUID.randomUUID());
        student.setEmail("student@demo.com");
        student.setRoles(Set.of(UserRoles.STUDENT));
        student.setStatus(AccountStatus.ACTIVE);

        Users superAdmin = new Users();
        superAdmin.setId(UUID.randomUUID());
        superAdmin.setEmail("superadmin@demo.com");
        superAdmin.setRoles(Set.of(UserRoles.SUPERADMIN));
        superAdmin.setStatus(AccountStatus.ACTIVE);

        when(userRepository.findAllWithStaffDetails())
                .thenReturn(List.of(admin, teacher, teacherWithoutRole, rejectedStaff, deletedStaff, student, superAdmin));

        List<SuperAdminUserRes> result = superAdminService.getPlatformStaff();

        assertThat(result).hasSize(5);
        assertThat(result).allSatisfy(member ->
            assertThat(member.getRoles()).doesNotContain(UserRoles.STUDENT));
        assertThat(result.stream().map(SuperAdminUserRes::getEmail)).containsExactlyInAnyOrder(
                "admin@demo.com", "teacher@demo.com", "no-role-teacher@demo.com",
                "rejected@demo.com", "deleted@demo.com");
    }

    @Test
    void getAllSchools_shouldCountStaffAndStudentsSeparately() {
        School school = new School();
        school.setId(UUID.randomUUID());
        school.setSchoolName("Green Valley Academy");
        school.setSchoolCode("GVA");
        school.setStatus(SchoolStatus.ACTIVE);

        when(schoolRepository.findAll()).thenReturn(List.of(school));
        Users staffMember = new Users();
        staffMember.setId(UUID.randomUUID());
        staffMember.setSchool(school);
        staffMember.setRoles(Set.of(UserRoles.ADMIN));
        staffMember.setStatus(AccountStatus.ACTIVE);

        Users studentMember = new Users();
        studentMember.setId(UUID.randomUUID());
        studentMember.setSchool(school);
        studentMember.setRoles(Set.of(UserRoles.STUDENT));
        studentMember.setStatus(AccountStatus.ACTIVE);

        when(userRepository.findAll()).thenReturn(List.of(staffMember, studentMember));

        List<SuperAdminSchoolRes> result = superAdminService.getAllSchools();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTotalStaff()).isEqualTo(1L);
        assertThat(result.get(0).getTotalStudents()).isEqualTo(1L);
    }
}
