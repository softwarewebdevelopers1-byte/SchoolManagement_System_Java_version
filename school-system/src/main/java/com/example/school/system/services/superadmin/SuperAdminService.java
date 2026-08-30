package com.example.school.system.services.superadmin;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.DTO.DTOResponse.LoginResponse;
import com.example.school.system.DTO.DTOResponse.SuperAdminSchoolRes;
import com.example.school.system.DTO.DTOResponse.SuperAdminUserRes;
import com.example.school.system.DTO.UserDto;
import com.example.school.system.controller.superadmin.AcceptAdminInviteRequest;
import com.example.school.system.controller.superadmin.PlatformStatisticsDto;
import com.example.school.system.controller.superadmin.SuperAdminInvitationDto;
import com.example.school.system.controller.superadmin.SuperAdminInviteRequest;
import com.example.school.system.controller.superadmin.SuperAdminInviteResponse;
import com.example.school.system.controller.superadmin.SuperAdminSchoolDetailDto;
import com.example.school.system.error.InvalidTokenExceptionHandler;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.ExpiryLinks;
import com.example.school.system.models.School;
import com.example.school.system.models.Users;
import com.example.school.system.projection.TeacherSummaryProjection;
import com.example.school.system.repository.ExpiryLinksRepository;
import com.example.school.system.repository.SchoolRepository;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.services.JwtCreationService;
import com.example.school.system.types.AccountStatus;
import com.example.school.system.types.SchoolStatus;
import com.example.school.system.types.UserRoles;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class SuperAdminService {

    private final SchoolRepository schoolRepository;
    private final UserRepository userRepository;
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
        user.setRoles(new java.util.HashSet<>(Set.of(UserRoles.ADMIN)));
        user.setStatus(AccountStatus.PENDING_APPROVAL);
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user = userRepository.save(user);

        ExpiryLinks link = new ExpiryLinks();
        link.setUsers(user.getId());
        link.setSchoolId(school.getId());
        link.setRoleName(UserRoles.ADMIN.name());
        link.setToken(UUID.randomUUID().toString());
        link.setExpirationTime(LocalDateTime.now().plusDays(7));
        link = expiryLinksRepository.save(link);
        return new SuperAdminInviteResponse(link.getId(), email, school.getId(), school.getSchoolName(),
                link.getToken(), link.getExpirationTime(), link.isUsed());
    }

    @Transactional(readOnly = true)
    public PlatformStatisticsDto getPlatformStatistics() {
        List<School> schools = schoolRepository.findAll();
        List<Users> users = userRepository.findAll();

        long totalSchools = schools.size();
        long activeSchools = schools.stream().filter(s -> s.getStatus() == SchoolStatus.ACTIVE).count();
        long pendingSchools = schools.stream().filter(s -> s.getStatus() == SchoolStatus.PENDING_APPROVAL).count();
        long rejectedSchools = schools.stream().filter(s -> s.getStatus() == SchoolStatus.REJECTED_APPROVAL).count();
        long suspendedSchools = schools.stream().filter(s -> s.getStatus() == SchoolStatus.INACTIVE).count();

        long totalStaff = users.stream().filter(u -> u.getRoles() != null && u.getRoles().stream().anyMatch(r ->
                r == UserRoles.ADMIN || r == UserRoles.HEADTEACHER || r == UserRoles.DEPUTYTEACHER
                        || r == UserRoles.CLASSTEACHER || r == UserRoles.SUBJECTTEACHER)).count();
        long activeStaff = users.stream().filter(u -> u.getStatus() == AccountStatus.ACTIVE && u.getRoles() != null && u.getRoles().stream().anyMatch(r ->
                r == UserRoles.ADMIN || r == UserRoles.HEADTEACHER || r == UserRoles.DEPUTYTEACHER
                        || r == UserRoles.CLASSTEACHER || r == UserRoles.SUBJECTTEACHER)).count();
        long pendingStaff = users.stream().filter(u -> u.getStatus() == AccountStatus.PENDING_APPROVAL && u.getRoles() != null && u.getRoles().stream().anyMatch(r ->
                r == UserRoles.ADMIN || r == UserRoles.HEADTEACHER || r == UserRoles.DEPUTYTEACHER
                        || r == UserRoles.CLASSTEACHER || r == UserRoles.SUBJECTTEACHER)).count();
        long suspendedStaff = users.stream().filter(u -> u.getStatus() == AccountStatus.SUSPENDED && u.getRoles() != null && u.getRoles().stream().anyMatch(r ->
                r == UserRoles.ADMIN || r == UserRoles.HEADTEACHER || r == UserRoles.DEPUTYTEACHER
                        || r == UserRoles.CLASSTEACHER || r == UserRoles.SUBJECTTEACHER)).count();

        long totalStudents = users.stream().filter(u -> u.getRoles() != null && u.getRoles().contains(UserRoles.STUDENT)).count();
        long recentEnrollments = Math.max(0L, totalStudents);
        long recentRegistrations = users.stream().filter(u -> u.getDate() != null).count();

        List<?> recentActivity = new ArrayList<>();
        ((ArrayList<Object>) recentActivity).add(Map.of("type", "New school registered", "count", totalSchools));
        ((ArrayList<Object>) recentActivity).add(Map.of("type", "School approved", "count", activeSchools));
        ((ArrayList<Object>) recentActivity).add(Map.of("type", "Teacher registered", "count", totalStaff));

        List<?> recentInvitations = expiryLinksRepository.findAllByOrderByCreatedAtDesc().stream()
                .limit(10)
                .map(link -> Map.of(
                        "id", link.getId(),
                        "schoolId", link.getSchoolId(),
                        "role", link.getRoleName(),
                        "status", link.isUsed() ? "USED" : (link.isRevoked() ? "REVOKED" : (link.getExpirationTime() != null && link.getExpirationTime().isBefore(LocalDateTime.now()) ? "EXPIRED" : "ACTIVE")),
                        "email", userRepository.findById(link.getUsers()).map(Users::getEmail).orElse(null),
                        "createdAt", link.getCreatedAt()))
                .toList();

        return new PlatformStatisticsDto(
                totalSchools,
                activeSchools,
                pendingSchools,
                rejectedSchools,
                suspendedSchools,
                totalStaff,
                activeStaff,
                pendingStaff,
                suspendedStaff,
                totalStudents,
                recentEnrollments,
                recentRegistrations,
                recentActivity,
                recentInvitations);
    }

    @Transactional(readOnly = true)
    public SuperAdminSchoolDetailDto getSchoolDetails(UUID schoolId) {
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("School not found"));

        List<Users> schoolUsers = userRepository.findAllBySchoolId(schoolId);
        long totalStaff = schoolUsers.stream().filter(u -> u.getRoles() != null && u.getRoles().stream().anyMatch(r ->
                r == UserRoles.ADMIN || r == UserRoles.HEADTEACHER || r == UserRoles.DEPUTYTEACHER
                        || r == UserRoles.CLASSTEACHER || r == UserRoles.SUBJECTTEACHER)).count();
        long activeStaff = schoolUsers.stream().filter(u -> u.getStatus() == AccountStatus.ACTIVE && u.getRoles() != null && u.getRoles().stream().anyMatch(r ->
                r == UserRoles.ADMIN || r == UserRoles.HEADTEACHER || r == UserRoles.DEPUTYTEACHER
                        || r == UserRoles.CLASSTEACHER || r == UserRoles.SUBJECTTEACHER)).count();
        long suspendedStaff = schoolUsers.stream().filter(u -> u.getStatus() == AccountStatus.SUSPENDED && u.getRoles() != null && u.getRoles().stream().anyMatch(r ->
                r == UserRoles.ADMIN || r == UserRoles.HEADTEACHER || r == UserRoles.DEPUTYTEACHER
                        || r == UserRoles.CLASSTEACHER || r == UserRoles.SUBJECTTEACHER)).count();
        long pendingStaff = schoolUsers.stream().filter(u -> u.getStatus() == AccountStatus.PENDING_APPROVAL && u.getRoles() != null && u.getRoles().stream().anyMatch(r ->
                r == UserRoles.ADMIN || r == UserRoles.HEADTEACHER || r == UserRoles.DEPUTYTEACHER
                        || r == UserRoles.CLASSTEACHER || r == UserRoles.SUBJECTTEACHER)).count();
        long totalStudents = schoolUsers.stream().filter(u -> u.getRoles() != null && u.getRoles().contains(UserRoles.STUDENT)).count();

        String adminName = schoolUsers.stream()
                .filter(u -> u.getRoles() != null && u.getRoles().contains(UserRoles.ADMIN))
                .findFirst()
                .map(u -> u.getEmail())
                .orElse("N/A");

        return new SuperAdminSchoolDetailDto(
                school.getId(),
                school.getSchoolName(),
                school.getSchoolCode(),
                school.getEmail(),
                school.getPhoneNumber(),
                school.getAddress(),
                school.getStatus() != null ? school.getStatus().name() : "PENDING_APPROVAL",
                school.getDate(),
                adminName,
                totalStaff,
                activeStaff,
                suspendedStaff,
                pendingStaff,
                totalStudents,
                List.of(),
                List.of(),
                schoolUsers.stream().map(u -> Map.of(
                        "userId", u.getId(),
                        "email", u.getEmail(),
                        "roles", u.getRoles(),
                        "status", u.getStatus())).toList(),
                schoolUsers.stream().filter(u -> u.getRoles() != null && u.getRoles().contains(UserRoles.ADMIN)).map(u -> Map.of(
                        "userId", u.getId(),
                        "email", u.getEmail(),
                        "role", UserRoles.ADMIN.name())).toList());
    }

    private boolean isStaffRole(UserRoles role) {
        return role == UserRoles.ADMIN
                || role == UserRoles.HEADTEACHER
                || role == UserRoles.DEPUTYTEACHER
                || role == UserRoles.CLASSTEACHER
                || role == UserRoles.SUBJECTTEACHER;
    }

    private boolean isStudentRole(UserRoles role) {
        return role == UserRoles.STUDENT;
    }

    private Map<UUID, long[]> buildSchoolRoleCounts(List<Users> users) {
        Map<UUID, long[]> counts = new java.util.HashMap<>();
        for (Users user : users) {
            if (user == null || user.getSchool() == null || user.getSchool().getId() == null) {
                continue;
            }
            UUID schoolId = user.getSchool().getId();
            long[] schoolCounts = counts.computeIfAbsent(schoolId, ignored -> new long[] {0L, 0L});
            if (user.getRoles() != null) {
                for (UserRoles role : user.getRoles()) {
                    if (isStaffRole(role)) {
                        schoolCounts[0]++;
                    }
                    if (isStudentRole(role)) {
                        schoolCounts[1]++;
                    }
                }
            }
        }
        return counts;
    }

    @Transactional(readOnly = true)
    public List<SuperAdminUserRes> getPlatformStaff() {
        List<Users> users = userRepository.findAll();
        return users.stream()
                .filter(u -> u.getRoles() != null
                        && !u.getRoles().contains(UserRoles.SUPERADMIN)
                        && u.getRoles().stream().anyMatch(this::isStaffRole))
                .map(u -> {
                    String schoolName = u.getSchool() != null ? u.getSchool().getSchoolName() : "N/A";
                    String schoolCode = u.getSchool() != null ? u.getSchool().getSchoolCode() : "N/A";
                    String firstName = null;
                    String lastName = null;
                    if (u.getTeacherProfile() != null) {
                        firstName = u.getTeacherProfile().getFirstName();
                        lastName = u.getTeacherProfile().getLastName();
                    }
                    return SuperAdminUserRes.builder()
                            .userId(u.getId())
                            .email(u.getEmail())
                            .roles(u.getRoles())
                            .schoolName(schoolName)
                            .schoolCode(schoolCode)
                            .firstName(firstName)
                            .lastName(lastName)
                            .status(u.getStatus() != null ? u.getStatus().name() : AccountStatus.ACTIVE.name())
                            .registeredDate(u.getDate() != null ? u.getDate().toString() : null)
                            .build();
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SuperAdminInvitationDto> getInvitations() {
        return expiryLinksRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(link -> {
                    Users user = userRepository.findById(link.getUsers()).orElse(null);
                    School school = user != null && user.getSchool() != null ? user.getSchool() : null;
                    String status = link.isUsed() ? "USED" : link.isRevoked() ? "REVOKED" : (link.getExpirationTime() != null && link.getExpirationTime().isBefore(LocalDateTime.now()) ? "EXPIRED" : "ACTIVE");
                    String role = link.getRoleName() != null ? link.getRoleName() : (user != null && user.getRoles()!=null && !user.getRoles().isEmpty() ? user.getRoles().iterator().next().name() : "ADMIN");
                    return new SuperAdminInvitationDto(
                            link.getId(),
                            user != null ? user.getEmail() : null,
                            link.getSchoolId(),
                            school != null ? school.getSchoolName() : null,
                            role,
                            status,
                            link.getToken() != null ? "https://schoolmanagement-system-java-version-1.onrender.com/api/superadmin/invites/" + link.getToken() : null,
                            link.getCreatedAt(),
                            link.getExpirationTime(),
                            link.getUsedAt(),
                            link.isUsed(),
                            link.isRevoked(),
                            link.getExpirationTime() != null && link.getExpirationTime().isBefore(LocalDateTime.now()) && !link.isUsed());
                }).toList();
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
        link.setUsedAt(LocalDateTime.now());
        expiryLinksRepository.save(link);
    }

    @Transactional
    public SuperAdminInvitationDto revokeInvitation(UUID inviteId) {
        ExpiryLinks link = expiryLinksRepository.findById(inviteId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("Invite not found"));
        if (link.isUsed() || link.isRevoked()) {
            return getInvitations().stream()
                    .filter(inv -> inv.id().equals(inviteId))
                    .findFirst()
                    .orElse(new SuperAdminInvitationDto(link.getId(), null, link.getSchoolId(), null, link.getRoleName(),
                            link.isUsed() ? "USED" : "REVOKED", null, link.getCreatedAt(), link.getExpirationTime(),
                            link.getUsedAt(), link.isUsed(), link.isRevoked(), false));
        }
        link.setRevoked(true);
        expiryLinksRepository.save(link);
        return getInvitations().stream()
                .filter(inv -> inv.id().equals(inviteId))
                .findFirst()
                .orElse(new SuperAdminInvitationDto(link.getId(), null, link.getSchoolId(), null, link.getRoleName(),
                        "REVOKED", null, link.getCreatedAt(), link.getExpirationTime(), link.getUsedAt(),
                        link.isUsed(), link.isRevoked(), false));
    }

    @Transactional(readOnly = true)
    public List<SuperAdminSchoolRes> getAllSchools() {
        List<School> schools = schoolRepository.findAll();
        Map<UUID, long[]> schoolRoleCounts = buildSchoolRoleCounts(userRepository.findAll());

        return schools.stream()
                .map(school -> {
                    long[] counts = schoolRoleCounts.getOrDefault(school.getId(), new long[] {0L, 0L});
                    long totalStaff = counts[0];
                    long totalStudents = counts[1];
                    return SuperAdminSchoolRes.builder()
                            .schoolId(school.getId())
                            .schoolName(school.getSchoolName())
                            .schoolCode(school.getSchoolCode())
                            .address(school.getAddress())
                            .email(school.getEmail())
                            .phoneNumber(school.getPhoneNumber())
                            .status(school.getStatus() != null ? school.getStatus().name() : "PENDING_APPROVAL")
                            .totalStaff(totalStaff)
                            .totalStudents(totalStudents)
                            .totalUsers(totalStaff)
                            .activeUsers(totalStudents)
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

        Map<UUID, long[]> schoolRoleCounts = buildSchoolRoleCounts(userRepository.findAll());
        long[] counts = schoolRoleCounts.getOrDefault(school.getId(), new long[] {0L, 0L});
        long totalStaff = counts[0];
        long totalStudents = counts[1];

        return SuperAdminSchoolRes.builder()
                .schoolId(school.getId())
                .schoolName(school.getSchoolName())
                .schoolCode(school.getSchoolCode())
                .address(school.getAddress())
                .email(school.getEmail())
                .phoneNumber(school.getPhoneNumber())
                .status(school.getStatus().name())
                .totalStaff(totalStaff)
                .totalStudents(totalStudents)
                .totalUsers(totalStaff)
                .activeUsers(totalStudents)
                .registeredDate(school.getDate() != null ? school.getDate().toString() : null)
                .build();
    }

    public List<SuperAdminUserRes> getAllUsers() {
        Pageable pageable = PageRequest.of(0, 500);
        List<TeacherSummaryProjection> teachers = userRepository.findTeacherSummariesBySchool(
                null, UserRoles.STUDENT, pageable).getContent();

        return teachers.stream()
                .map(t -> SuperAdminUserRes.builder()
                        .userId(t.getUserId())
                        .email(t.getEmail())
                        .roles(t.getRoles())
                        .schoolName(t.getSchoolName())
                        .schoolCode("N/A")
                        .firstName(t.getFirstName())
                        .lastName(t.getLastName())
                        .status(t.getStatus() != null ? t.getStatus().name() : "ACTIVE")
                        .registeredDate(null)
                        .build())
                .toList();
    }

    public List<SuperAdminUserRes> getAllTeachersAndAdmins() {
        Pageable pageable = PageRequest.of(0, 500);
        List<TeacherSummaryProjection> teachers = userRepository.findTeacherSummariesBySchool(
                null, UserRoles.STUDENT, pageable).getContent();

        return teachers.stream()
                .map(t -> SuperAdminUserRes.builder()
                        .userId(t.getUserId())
                        .email(t.getEmail())
                        .roles(t.getRoles())
                        .schoolName(t.getSchoolName())
                        .schoolCode("N/A")
                        .firstName(t.getFirstName())
                        .lastName(t.getLastName())
                        .status(t.getStatus() != null ? t.getStatus().name() : "ACTIVE")
                        .registeredDate(null)
                        .build())
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

    /**
     * Search schools with optional filters for status and search term
     * @param status Optional school status filter
     * @param search Optional search term (searches school name, code, email, address)
     * @return List of matching schools
     */
    @Transactional(readOnly = true)
    public List<SuperAdminSchoolRes> searchSchools(String status, String search) {
        List<School> schools = schoolRepository.findAll();
        Map<UUID, long[]> schoolRoleCounts = buildSchoolRoleCounts(userRepository.findAll());
        String searchLower = search != null ? search.toLowerCase().trim() : "";

        return schools.stream()
                .filter(school -> {
                    if (status != null && !status.isEmpty() && !status.equals("ALL")) {
                        String schoolStatus = school.getStatus() != null ? school.getStatus().name() : "PENDING_APPROVAL";
                        if (!schoolStatus.equalsIgnoreCase(status)) {
                            return false;
                        }
                    }

                    if (!searchLower.isEmpty()) {
                        String name = school.getSchoolName() != null ? school.getSchoolName().toLowerCase() : "";
                        String code = school.getSchoolCode() != null ? school.getSchoolCode().toLowerCase() : "";
                        String email = school.getEmail() != null ? school.getEmail().toLowerCase() : "";
                        String address = school.getAddress() != null ? school.getAddress().toLowerCase() : "";

                        return name.contains(searchLower) || code.contains(searchLower)
                                || email.contains(searchLower) || address.contains(searchLower);
                    }

                    return true;
                })
                .map(school -> {
                    long[] counts = schoolRoleCounts.getOrDefault(school.getId(), new long[] {0L, 0L});
                    long totalStaff = counts[0];
                    long totalStudents = counts[1];
                    return SuperAdminSchoolRes.builder()
                            .schoolId(school.getId())
                            .schoolName(school.getSchoolName())
                            .schoolCode(school.getSchoolCode())
                            .address(school.getAddress())
                            .email(school.getEmail())
                            .phoneNumber(school.getPhoneNumber())
                            .status(school.getStatus() != null ? school.getStatus().name() : "PENDING_APPROVAL")
                            .totalStaff(totalStaff)
                            .totalStudents(totalStudents)
                            .totalUsers(totalStaff)
                            .activeUsers(totalStudents)
                            .registeredDate(school.getDate() != null ? school.getDate().toString() : null)
                            .build();
                })
                .toList();
    }

    /**
     * Search staff/users with optional filters for status, role, and search term
     * @param status Optional account status filter
     * @param role Optional user role filter
     * @param search Optional search term (searches email, name, school name)
     * @return List of matching staff members
     */
    @Transactional(readOnly = true)
    public List<SuperAdminUserRes> searchStaff(String status, String role, String search) {
        List<Users> users = userRepository.findAll();
        
        final String searchLower = search != null ? search.toLowerCase().trim() : "";
        UserRoles roleEnum = null;
        
        if (role != null && !role.isEmpty() && !role.equals("ALL")) {
            try {
                roleEnum = UserRoles.valueOf(role.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Invalid role, will be ignored
            }
        }
        
        final UserRoles finalRoleEnum = roleEnum;
        
        return users.stream()
                .filter(u -> u.getRoles() != null
                        && !u.getRoles().contains(UserRoles.SUPERADMIN)
                        && u.getRoles().stream().anyMatch(this::isStaffRole))
                .filter(user -> {
                    if (status != null && !status.isEmpty() && !status.equals("ALL")) {
                        String userStatus = user.getStatus() != null ? user.getStatus().name() : "ACTIVE";
                        if (!userStatus.equalsIgnoreCase(status)) {
                            return false;
                        }
                    }

                    if (finalRoleEnum != null) {
                        if (user.getRoles() == null || !user.getRoles().contains(finalRoleEnum)) {
                            return false;
                        }
                    }

                    if (!searchLower.isEmpty()) {
                        String email = user.getEmail() != null ? user.getEmail().toLowerCase() : "";
                        String schoolName = user.getSchool() != null && user.getSchool().getSchoolName() != null ?
                                           user.getSchool().getSchoolName().toLowerCase() : "";
                        String firstName = user.getTeacherProfile() != null && user.getTeacherProfile().getFirstName() != null ?
                                          user.getTeacherProfile().getFirstName().toLowerCase() : "";
                        String lastName = user.getTeacherProfile() != null && user.getTeacherProfile().getLastName() != null ?
                                         user.getTeacherProfile().getLastName().toLowerCase() : "";

                        return email.contains(searchLower) || schoolName.contains(searchLower)
                               || firstName.contains(searchLower) || lastName.contains(searchLower);
                    }

                    return true;
                })
                .map(u -> {
                    String schoolName = u.getSchool() != null ? u.getSchool().getSchoolName() : "N/A";
                    String schoolCode = u.getSchool() != null ? u.getSchool().getSchoolCode() : "N/A";
                    String firstName = null;
                    String lastName = null;
                    if (u.getTeacherProfile() != null) {
                        firstName = u.getTeacherProfile().getFirstName();
                        lastName = u.getTeacherProfile().getLastName();
                    }
                    return SuperAdminUserRes.builder()
                            .userId(u.getId())
                            .email(u.getEmail())
                            .roles(u.getRoles())
                            .schoolName(schoolName)
                            .schoolCode(schoolCode)
                            .firstName(firstName)
                            .lastName(lastName)
                            .status(u.getStatus() != null ? u.getStatus().name() : AccountStatus.ACTIVE.name())
                            .registeredDate(u.getDate() != null ? u.getDate().toString() : null)
                            .build();
                })
                .toList();
    }
}
