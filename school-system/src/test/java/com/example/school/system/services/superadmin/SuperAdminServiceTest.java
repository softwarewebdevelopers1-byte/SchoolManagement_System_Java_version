package com.example.school.system.services.superadmin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.List;
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
import com.example.school.system.models.School;
import com.example.school.system.models.Users;
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
    void getPlatformStaff_shouldExcludeStudentsAndIncludeTeacherWithoutRoles() {
        Users admin = new Users();
        admin.setId(UUID.randomUUID());
        admin.setEmail("admin@demo.com");
        admin.setRoles(Set.of(UserRoles.ADMIN));
        admin.setStatus(AccountStatus.ACTIVE);

        Users teacher = new Users();
        teacher.setId(UUID.randomUUID());
        teacher.setEmail("teacher@demo.com");
        teacher.setRoles(Set.of(UserRoles.CLASSTEACHER));
        teacher.setStatus(AccountStatus.ACTIVE);

        Users teacherWithoutRole = new Users();
        teacherWithoutRole.setId(UUID.randomUUID());
        teacherWithoutRole.setEmail("no-role-teacher@demo.com");
        teacherWithoutRole.setRoles(Set.of());
        teacherWithoutRole.setStatus(AccountStatus.ACTIVE);
        teacherWithoutRole.setTeacherProfile(new com.example.school.system.models.TeacherProfile());
        teacherWithoutRole.getTeacherProfile().setFirstName("No");
        teacherWithoutRole.getTeacherProfile().setLastName("Role");

        Users student = new Users();
        student.setId(UUID.randomUUID());
        student.setEmail("student@demo.com");
        student.setRoles(Set.of(UserRoles.STUDENT));
        student.setStatus(AccountStatus.ACTIVE);

        when(userRepository.findAll()).thenReturn(List.of(admin, teacher, teacherWithoutRole, student));

        List<SuperAdminUserRes> result = superAdminService.getPlatformStaff();

        assertThat(result).hasSize(3);
        assertThat(result).allSatisfy(member ->
            assertThat(member.getRoles()).doesNotContain(UserRoles.STUDENT));
        assertThat(result.stream().map(SuperAdminUserRes::getEmail)).containsExactlyInAnyOrder(
                "admin@demo.com", "teacher@demo.com", "no-role-teacher@demo.com");
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
