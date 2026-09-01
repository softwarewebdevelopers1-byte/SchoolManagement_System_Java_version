package com.example.school.system.services;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.school.system.DTO.RegisterTeacherDTO;
import com.example.school.system.DTO.TeacherAddProfile;
import com.example.school.system.DTO.TeacherCreateDTO;
import com.example.school.system.DTO.DTOResponse.GetTeachersDTO;
import com.example.school.system.DTO.DTOResponse.PendingInviteDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.DTO.DTOResponse.TeacherEditDTO;
import com.example.school.system.error.SchoolResourceExistsExceptionHandler;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.School;
import com.example.school.system.models.TeacherProfile;
import com.example.school.system.models.Users;
import com.example.school.system.repository.TeacherProfileRepository;
import com.example.school.system.repository.SchoolRepository;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.security.PasswordHashing;
import com.example.school.system.security.jwt.JwtValidator;
import com.example.school.system.types.UserRoles;
import com.example.school.system.types.AccountStatus;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class TeachersService {
    private final UserRepository userRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final SchoolRepository schoolRepository;
    private final PasswordHashing passwordHashing;
    private final JwtValidator jwtValidator;
    private String schoolNotFound = "school not found";
    
    public List<GetTeachersDTO> getTeachers(UUID id, String authHeader) {
        tokenIssuedValidator(id, authHeader);
        List<Object[]> results = userRepository.findUsersBySchoolWithoutRoleNative(
                id, UserRoles.STUDENT.name());

        return results.stream().map(row -> {
            GetTeachersDTO dto = new GetTeachersDTO();

            // Handle UUID conversion from byte[]
            byte[] userIdBytes = (byte[]) row[0];
            dto.setUsersId(convertBytesToUUID(userIdBytes));

            dto.setEmail((String) row[1]);
            dto.setStatus(AccountStatus.valueOf((String) row[2]));

            // Parse roles
            String rolesStr = (String) row[3];
            Set<UserRoles> roles = new HashSet<>();
            if (rolesStr != null && !rolesStr.isEmpty()) {
                for (String role : rolesStr.split(",")) {
                    roles.add(UserRoles.valueOf(role.trim()));
                }
            }
            dto.setRoles(roles);

            dto.setFirstName((String) row[4]);
            dto.setLastName((String) row[5]);
            dto.setPhoneNumber((String) row[6]);

            // Handle teacherId UUID conversion
            byte[] teacherIdBytes = (byte[]) row[7];
            dto.setTeacherProfileId(convertBytesToUUID(teacherIdBytes));

            String classStream = String.valueOf(row[8]);
            String classGrade = String.valueOf(row[9]);
            if (classGrade != null && classStream != null && !"null".equals(classGrade) && !"null".equals(classStream)) {
                dto.setSchoolClass(classGrade + " " + classStream);
            }

            return dto;
        }).toList();
    }

    // Helper method to convert byte[] to UUID
    private UUID convertBytesToUUID(byte[] bytes) {
        if (bytes == null)
            return null;
        try {
            java.nio.ByteBuffer bb = java.nio.ByteBuffer.wrap(bytes);
            long mostSigBits = bb.getLong();
            long leastSigBits = bb.getLong();
            return new UUID(mostSigBits, leastSigBits);
        } catch (Exception e) {
            return null;
        }
    }

    private void tokenIssuedValidator(UUID id, String authHeader) {
        Claims userToken = jwtValidator.validateTokenIssued(authHeader);
        if (!userToken.get("school").equals(id.toString())) {
            throw new SchoolResourceNotFoundExceptionHandler(schoolNotFound);
        }
    }

    public UUID schoolUuid(String token) {
        Claims userToken = jwtValidator.validateTokenIssued(token);
        String school = userToken.get("school").toString();
        return UUID.fromString(school);
    }

    @Transactional
    public void EditTeacher(TeacherEditDTO editTeacher, String authHeader) {
        // 1. Find the user
        log.info("teacher updated {}", editTeacher.teacherId());
        Users user = userRepository.findById(editTeacher.teacherId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("User not found"));
        if (!schoolUuid(authHeader).equals(user.getSchool().getId())) {
            throw new SchoolResourceNotFoundExceptionHandler(schoolNotFound);
        }
        // 2. Get the teacher profile - FIXED
        TeacherProfile teacher = user.getTeacherProfile(); // Direct access from user
        String response = "Teacher profile doesn't exist";
        if (editTeacher.firstName() != null && teacher == null) {
            throw new SchoolResourceNotFoundExceptionHandler(response);
        }
        if (editTeacher.lastName() != null && teacher == null) {
            throw new SchoolResourceNotFoundExceptionHandler(response);
        }

        // 4. Update user fields

        String newEmail = editTeacher.email();
        if (!user.getEmail().equals(newEmail)
                && userRepository.existsByEmail(newEmail)) {
            throw new SchoolResourceExistsExceptionHandler("user already exists");
        }
        if (newEmail != null) {
            newEmail = newEmail.trim().toLowerCase();
            user.setEmail(newEmail);
        }
        if (teacher != null && editTeacher.phoneNumber() != null) {
            teacher.setPhoneNumber(editTeacher.phoneNumber());
        }

        if (editTeacher.password() != null && editTeacher.password() != "") {
            user.setPassword(passwordHashing.PasswordEncoder().encode(editTeacher.password()));
        }

        if (editTeacher.roles() != null && !editTeacher.roles().isEmpty()) {
            Set<UserRoles> newRoles = new HashSet<>(editTeacher.roles());
            newRoles.remove(UserRoles.UNASSIGNED);
            user.getRoles().clear();
            user.getRoles().addAll(newRoles);
        }

        if (!user.getStatus().equals(editTeacher.status()) && editTeacher.status() != null) {
            user.setStatus(editTeacher.status());
            if (editTeacher.status() == AccountStatus.REJECTED_INVITE)
                user.setDeletedAt(Instant.now());
            ;
        }

        // 5. Update teacher profile fields
        if (teacher != null && !teacher.getFirstName().equals(editTeacher.firstName())
                && editTeacher.firstName() != null
                && teacher != null) {
            teacher.setFirstName(editTeacher.firstName().trim().toLowerCase());
        }

        if (teacher != null && !teacher.getLastName().equals(editTeacher.lastName()) && editTeacher.lastName() != null
                && teacher != null) {
            teacher.setLastName(editTeacher.lastName().trim().toLowerCase());
        }

        // // 6. Save both entities
        // userRepository.save(user);
        // if (teacher != null)
        // teacherProfileRepository.save(teacher);
    }

    public SchoolApiResponse<?> addProfile(TeacherAddProfile teacherAddProfile) {
        toTeacherProfile(teacherAddProfile, teacherAddProfile.userId());
        return SchoolApiResponse.success("Teacher profile added");
    }

    @Transactional
    public SchoolApiResponse<?> createTeacher(TeacherCreateDTO request, String authHeader) {
        if (userRepository.existsByEmail(request.email().trim().toLowerCase())) {
            throw new SchoolResourceExistsExceptionHandler("user already exists");
        }
        var school = schoolRepository.findById(schoolUuid(authHeader))
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school not found"));
        Users teacher = new Users();
        teacher.setEmail(request.email().trim().toLowerCase());
        teacher.setPassword(passwordHashing.PasswordEncoder().encode(request.password()));
        teacher.setRoles(request.roles());
        teacher.setStatus(AccountStatus.ACTIVE);
        teacher.setSchool(school);
        teacher = userRepository.save(teacher);

        TeacherProfile profile = new TeacherProfile();
        profile.setFirstName(request.firstName().trim());
        profile.setLastName(request.lastName().trim());
        profile.setTeacher(teacher);
        teacherProfileRepository.save(profile);
        return SchoolApiResponse.success("Teacher created");
    }

    @Transactional
    private void toTeacherProfile(TeacherAddProfile teacherAddProfile, UUID id) {
        var user = userRepository.findById(id)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("user not found"));
        TeacherProfile profile = teacherProfileRepository.findByTeacher_Id(id).orElseGet(() -> {
            TeacherProfile newProfile = new TeacherProfile();
            newProfile.setTeacher(user);
            return newProfile;
        });
        profile.setFirstName(teacherAddProfile.firstName());
        profile.setLastName(teacherAddProfile.lastName());
        teacherProfileRepository.save(profile);
    }

    @Transactional(readOnly = true)
    public SchoolApiResponse<?> getPendingInvites(UUID schoolId) {
        List<PendingInviteDTO> inviteList = userRepository.findPendingInvitesBySchoolId(schoolId);
        return SchoolApiResponse.success(inviteList, "Invites loaded");
    }

    @Transactional
    public SchoolApiResponse<?> regNewTeacher(RegisterTeacherDTO registerTeacherDTO) {
        log.info("New details to be saved ", registerTeacherDTO.toString());
        if (userRepository.existsByEmail(registerTeacherDTO.getEmail())) {
            throw new SchoolResourceExistsExceptionHandler("email already exists");
        }
        School schoolFound = schoolRepository.findById(registerTeacherDTO.getSchoolId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school not found"));
        Users user = new Users();
        TeacherProfile teacherProfile = new TeacherProfile();
        if (registerTeacherDTO.getPassword() != "" || registerTeacherDTO.getPassword() != null) {
            String hashedPass = passwordHashing.PasswordEncoder().encode(registerTeacherDTO.getPassword());
            user.setPassword(hashedPass);
        }
        if (registerTeacherDTO.getStatus() != null) {
            user.setStatus(registerTeacherDTO.getStatus());
        }

        if (registerTeacherDTO.getPassword() == "" || registerTeacherDTO.getPassword() == null) {
            String hashedPass = passwordHashing.PasswordEncoder().encode("staff123");
            user.setPassword(hashedPass);
        }
        if (registerTeacherDTO.getStatus() == null) {
            user.setStatus(AccountStatus.ACTIVE);
        }
        user.setSchool(schoolFound);
        if (registerTeacherDTO.getRoles() != null) {
            user.setRoles(registerTeacherDTO.getRoles());
        }
        user.setEmail(registerTeacherDTO.getEmail());
        teacherProfile.setPhoneNumber(registerTeacherDTO.getPhoneNumber());
        teacherProfile.setFirstName(registerTeacherDTO.getFirstName());
        if (registerTeacherDTO.getLastName() != null || registerTeacherDTO.getLastName() != "") {
            teacherProfile.setLastName(registerTeacherDTO.getLastName());
        }
        teacherProfile.setTeacher(user);
        userRepository.save(user);
        teacherProfileRepository.save(teacherProfile);
        log.info("new user {} registered in school {}", registerTeacherDTO.getEmail(),
                registerTeacherDTO.getSchoolId());
        return SchoolApiResponse.success();
    }
};
