package com.example.school.system.services.superadmin;

import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.school.system.DTO.DTOResponse.SuperAdminSchoolRes;
import com.example.school.system.DTO.DTOResponse.SuperAdminUserRes;
import com.example.school.system.DTO.DTOResponse.LoginResponse;
import com.example.school.system.DTO.UserDto;
import com.example.school.system.error.InvalidTokenExceptionHandler;
import com.example.school.system.models.ExpiryLinks;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.School;
import com.example.school.system.models.Users;
import com.example.school.system.repository.SchoolRepository;
import com.example.school.system.repository.ExpiryLinksRepository;
import com.example.school.system.repository.TeacherProfileRepository;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.services.JwtCreationService;
import com.example.school.system.types.AccountStatus;
import com.example.school.system.types.SchoolStatus;
import com.example.school.system.types.UserRoles;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.example.school.system.controller.superadmin.SuperAdminInviteRequest;
import com.example.school.system.controller.superadmin.SuperAdminInviteResponse;
import com.example.school.system.controller.superadmin.AcceptAdminInviteRequest;

@Service
@Slf4j
@RequiredArgsConstructor
public class SuperAdminService {

    private final SchoolRepository schoolRepository;
    private final UserRepository userRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final ExpiryLinksRepository expiryLinksRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtCreationService jwtCreationService;

    public LoginResponse login(String email, String password) {
        Users user = userRepository.findUsersByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("Invalid super-admin credentials"));
        if (!user.getRoles().contains(UserRoles.SUPERADMIN)
                || user.getStatus() != AccountStatus.ACTIVE
                || !passwordEncoder.matches(password, user.getPassword())) {
            throw new SchoolResourceNotFoundExceptionHandler("Invalid super-admin credentials");
        }
        String token = jwtCreationService.GenerateSuperAdminToken(user.getId(), user.getRoles());
        return LoginResponse.builder().token(token).user(UserDto.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .roles(user.getRoles())
                .build()).build();
    }

    @Transactional
    public SuperAdminInviteResponse createAdminInvite(SuperAdminInviteRequest request) {
        School school = schoolRepository.findById(request.schoolId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("School not found"));
        String email = request.email().trim().toLowerCase();
        Users user = userRepository.findUsersByEmail(email).orElseGet(Users::new);
        user.setEmail(email);
        user.setSchool(school);
        user.setRoles(new HashSet<>(Set.of(UserRoles.ADMIN)));
        user.setStatus(AccountStatus.PENDING_APPROVAL);
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user = userRepository.save(user);

        ExpiryLinks link = new ExpiryLinks();
        link.setUsers(user.getId());
        link.setToken(UUID.randomUUID().toString());
        link.setExpirationTime(LocalDateTime.now().plusDays(7));
        link = expiryLinksRepository.save(link);
        return new SuperAdminInviteResponse(link.getId(), email, school.getId(), school.getSchoolName(),
                link.getToken(), link.getExpirationTime(), link.isUsed());
    }

    public SuperAdminInviteResponse validateAdminInvite(String token) {
        ExpiryLinks link = expiryLinksRepository.findByTokenAndUsedAndExpirationTimeAfter(token, false,
                LocalDateTime.now()).orElseThrow(() -> new InvalidTokenExceptionHandler("Invalid or expired invite"));
        Users user = userRepository.findById(link.getUsers())
                .orElseThrow(() -> new InvalidTokenExceptionHandler("Invalid invite user"));
        return new SuperAdminInviteResponse(link.getId(), user.getEmail(), user.getSchool().getId(),
                user.getSchool().getSchoolName(), link.getToken(), link.getExpirationTime(), link.isUsed());
    }

        @Transactional
        public void acceptAdminInvite(AcceptAdminInviteRequest request) {
                ExpiryLinks link = expiryLinksRepository
                                .findByTokenAndUsedAndExpirationTimeAfter(request.token(), false, LocalDateTime.now())
                                .orElseThrow(() -> new InvalidTokenExceptionHandler("Invalid or expired invite"));
                Users user = userRepository.findById(link.getUsers())
                                .orElseThrow(() -> new InvalidTokenExceptionHandler("Invalid invite user"));
                if (!user.getEmail().equalsIgnoreCase(request.email().trim())) {
                        throw new InvalidTokenExceptionHandler("Invite email does not match");
                }
                user.setPassword(passwordEncoder.encode(request.password()));
                user.setStatus(AccountStatus.ACTIVE);
                userRepository.save(user);
                link.setUsed(true);
                expiryLinksRepository.save(link);
        }

    public List<SuperAdminSchoolRes> getAllSchools() {
        return schoolRepository.findAll().stream()
                .map(school -> {
                    List<Users> schoolUsers = userRepository.findAllBySchoolId(school.getId());
                    long totalUsers = schoolUsers.size();
                    long activeUsers = schoolUsers.stream()
                            .filter(u -> u.getStatus() == AccountStatus.ACTIVE)
                            .count();
                    return SuperAdminSchoolRes.builder()
                            .schoolId(school.getId())
                            .schoolName(school.getSchoolName())
                            .schoolCode(school.getSchoolCode())
                            .address(school.getAddress())
                            .email(school.getEmail())
                            .phoneNumber(school.getPhoneNumber())
                            .status(school.getStatus() != null ? school.getStatus().name() : "PENDING_APPROVAL")
                            .totalUsers(totalUsers)
                            .activeUsers(activeUsers)
                            .registeredDate(school.getDate() != null ? school.getDate().toString() : null)
                            .build();
                })
                .toList();
    }

    @Transactional
    public SuperAdminSchoolRes updateSchoolStatus(UUID schoolId, SchoolStatus newStatus) {
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("School not found"));
        school.setStatus(newStatus);
        schoolRepository.save(school);
        List<Users> schoolUsers = userRepository.findAllBySchoolId(school.getId());
        long totalUsers = schoolUsers.size();
        long activeUsers = schoolUsers.stream()
                .filter(u -> u.getStatus() == AccountStatus.ACTIVE)
                .count();
        return SuperAdminSchoolRes.builder()
                .schoolId(school.getId())
                .schoolName(school.getSchoolName())
                .schoolCode(school.getSchoolCode())
                .address(school.getAddress())
                .email(school.getEmail())
                .phoneNumber(school.getPhoneNumber())
                .status(school.getStatus().name())
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .registeredDate(school.getDate() != null ? school.getDate().toString() : null)
                .build();
    }

    public List<SuperAdminUserRes> getAllUsers() {
        List<Users> allUsers = userRepository.findAll();
        return allUsers.stream()
                .map(user -> {
                    String schoolName = user.getSchool() != null ? user.getSchool().getSchoolName() : "N/A";
                    String schoolCode = user.getSchool() != null ? user.getSchool().getSchoolCode() : "N/A";
                    String firstName = null;
                    String lastName = null;
                    if (user.getTeacherProfile() != null) {
                        firstName = user.getTeacherProfile().getFirstName();
                        lastName = user.getTeacherProfile().getLastName();
                    }
                    return SuperAdminUserRes.builder()
                            .userId(user.getId())
                            .email(user.getEmail())
                            .roles(user.getRoles())
                            .schoolName(schoolName)
                            .schoolCode(schoolCode)
                            .firstName(firstName)
                            .lastName(lastName)
                            .status(user.getStatus() != null ? user.getStatus().name() : "ACTIVE")
                            .registeredDate(user.getDate() != null ? user.getDate().toString() : null)
                            .build();
                })
                .toList();
    }

    public List<SuperAdminUserRes> getAllTeachersAndAdmins() {
        List<Users> teachers = userRepository.findAllTeachers(UserRoles.STUDENT,
                org.springframework.data.domain.PageRequest.of(0, 500));
        return teachers.stream()
                .map(user -> {
                    String schoolName = user.getSchool() != null ? user.getSchool().getSchoolName() : "N/A";
                    String schoolCode = user.getSchool() != null ? user.getSchool().getSchoolCode() : "N/A";
                    String firstName = null;
                    String lastName = null;
                    if (user.getTeacherProfile() != null) {
                        firstName = user.getTeacherProfile().getFirstName();
                        lastName = user.getTeacherProfile().getLastName();
                    }
                    return SuperAdminUserRes.builder()
                            .userId(user.getId())
                            .email(user.getEmail())
                            .roles(user.getRoles())
                            .schoolName(schoolName)
                            .schoolCode(schoolCode)
                            .firstName(firstName)
                            .lastName(lastName)
                            .status(user.getStatus() != null ? user.getStatus().name() : "ACTIVE")
                            .registeredDate(user.getDate() != null ? user.getDate().toString() : null)
                            .build();
                })
                .toList();
    }

    @Transactional
    public SuperAdminUserRes updateUserStatus(UUID userId, AccountStatus newStatus) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("User not found"));
        user.setStatus(newStatus);
        userRepository.save(user);
        String schoolName = user.getSchool() != null ? user.getSchool().getSchoolName() : "N/A";
        String schoolCode = user.getSchool() != null ? user.getSchool().getSchoolCode() : "N/A";
        String firstName = null;
        String lastName = null;
        if (user.getTeacherProfile() != null) {
            firstName = user.getTeacherProfile().getFirstName();
            lastName = user.getTeacherProfile().getLastName();
        }
        return SuperAdminUserRes.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .roles(user.getRoles())
                .schoolName(schoolName)
                .schoolCode(schoolCode)
                .firstName(firstName)
                .lastName(lastName)
                .status(user.getStatus().name())
                .registeredDate(user.getDate() != null ? user.getDate().toString() : null)
                .build();
    }
}
