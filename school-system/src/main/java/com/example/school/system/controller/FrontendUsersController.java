package com.example.school.system.controller;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import static java.util.Map.entry;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.SchoolClass;
import com.example.school.system.models.StudentProfile;
import com.example.school.system.models.Subject;
import com.example.school.system.models.SubjectJoint;
import com.example.school.system.models.TeacherProfile;
import com.example.school.system.models.Users;
import com.example.school.system.repository.SchoolClassRepository;
import com.example.school.system.repository.SchoolRepository;
import com.example.school.system.repository.StudentRepository;
import com.example.school.system.repository.SubjectJointRepo;
import com.example.school.system.repository.SubjectRepository;
import com.example.school.system.repository.TeacherProfileRepository;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.security.jwt.JwtValidator;
import com.example.school.system.types.AccountStatus;
import com.example.school.system.types.UserRoles;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class FrontendUsersController {
    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final StudentRepository studentRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final SubjectRepository subjectRepository;
    private final SubjectJointRepo subjectJointRepo;
    private final SchoolClassRepository schoolClassRepository;
    private final JwtValidator jwtValidator;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<?> dashboard(@RequestHeader("Authorization") String authHeader) {
        UUID schoolId = currentSchoolId(authHeader);
        List<Users> users = userRepository.findAllBySchool(schoolId);
        List<Subject> subjects = subjectRepository.findAllBySchoolId(schoolId);
        List<SubjectJoint> subjectJoints = subjectJointRepo.findAllBySchoolClass_schoolId(schoolId);

        Map<String, Object> payload = Map.of(
                "staff", users.stream().filter(user -> !user.getRoles().contains(UserRoles.STUDENT)).map(this::toStaff)
                        .toList(),
                "students",
                users.stream().filter(user -> user.getRoles().contains(UserRoles.STUDENT)).map(this::toStudent)
                        .toList(),
                "subjects", subjects.stream().map(this::toSubject).toList(),
                "assignments", subjectJoints.stream().map(this::toAssignment).toList(),
                "exitedStudents", List.of());

        return ResponseEntity.ok(SchoolApiResponse.success(payload, "Dashboard data loaded"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> byId(@PathVariable UUID id, @RequestHeader("Authorization") String authHeader) {
        UUID schoolId = currentSchoolId(authHeader);
        Users user = userRepository.findById(id)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("User not found"));
        ensureSameSchool(user, schoolId);
        return ResponseEntity.ok(SchoolApiResponse.success(toUser(user), "User loaded"));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> payload,
            @RequestHeader("Authorization") String authHeader) {
        UUID schoolId = currentSchoolId(authHeader);
        var school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("School not found"));
        Users user = new Users();
        user.setSchool(school);
        user.setEmail(stringValue(payload, "email", generatedEmail()));
        user.setPassword(passwordEncoder.encode(stringValue(payload, "password", "password")));
        user.setStatus(AccountStatus.valueOf(stringValue(payload, "status", "ACTIVE").toUpperCase()));
        user.setRoles(resolveRoles(payload));
        Users savedUser = userRepository.save(user);

        if (savedUser.getRoles().contains(UserRoles.STUDENT)) {
            StudentProfile profile = new StudentProfile();
            profile.setStudent(savedUser);
            profile.setStudentFullName(stringValue(payload, "name", savedUser.getEmail()));
            profile.setStudentAdm(stringValue(payload, "admissionNo", stringValue(payload, "adm", "")));
            profile.setPhoneNumber(stringValue(payload, "guardianPhone", ""));
            profile.setSchoolClass(resolveClass(schoolId, payload));
            studentRepository.save(profile);
        } else {
            TeacherProfile profile = new TeacherProfile();
            profile.setTeacher(savedUser);
            String[] names = stringValue(payload, "name", savedUser.getEmail()).trim().split("\\s+", 2);
            profile.setFirstName(names[0]);
            profile.setLastName(names.length > 1 ? names[1] : names[0]);
            profile.setSchoolClass(resolveClass(schoolId, payload));
            teacherProfileRepository.save(profile);
        }

        return ResponseEntity.ok(SchoolApiResponse.success(toUser(savedUser), "User created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody Map<String, Object> payload,
            @RequestHeader("Authorization") String authHeader) {
        UUID schoolId = currentSchoolId(authHeader);
        Users user = userRepository.findById(id)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("User not found"));
        ensureSameSchool(user, schoolId);

        if (payload.get("email") instanceof String email && !email.isBlank()) {
            user.setEmail(email);
        }
        if (payload.get("password") instanceof String password && !password.isBlank()) {
            user.setPassword(passwordEncoder.encode(password));
        }
        if (payload.get("status") instanceof String status && !status.isBlank()) {
            user.setStatus(AccountStatus.valueOf(status.trim().toUpperCase()));
        }
        if (payload.get("roles") instanceof List<?> roles && !roles.isEmpty()) {
            user.setRoles(resolveRoles(payload));
        }

        if (user.getRoles().contains(UserRoles.STUDENT) && user.getStudentProfile() != null) {
            StudentProfile profile = user.getStudentProfile();
            if (payload.get("name") instanceof String name && !name.isBlank()) {
                profile.setStudentFullName(name);
            }
            if (payload.get("admissionNo") instanceof String admissionNo && !admissionNo.isBlank()) {
                profile.setStudentAdm(admissionNo);
            }
            if (payload.get("guardianPhone") instanceof String phone) {
                profile.setPhoneNumber(phone);
            }
            SchoolClass schoolClass = resolveClass(schoolId, payload);
            if (schoolClass != null) {
                profile.setSchoolClass(schoolClass);
            }
            studentRepository.save(profile);
        } else if (user.getTeacherProfile() != null) {
            TeacherProfile profile = user.getTeacherProfile();
            if (payload.get("name") instanceof String name && !name.isBlank()) {
                String[] names = name.trim().split("\\s+", 2);
                profile.setFirstName(names[0]);
                profile.setLastName(names.length > 1 ? names[1] : names[0]);
            }
            SchoolClass schoolClass = resolveClass(schoolId, payload);
            if (schoolClass != null) {
                profile.setSchoolClass(schoolClass);
            }
            teacherProfileRepository.save(profile);
        }

        userRepository.save(user);
        return ResponseEntity.ok(SchoolApiResponse.success(toUser(user), "User updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id, @RequestHeader("Authorization") String authHeader) {
        UUID schoolId = currentSchoolId(authHeader);
        Users user = userRepository.findById(id)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("User not found"));
        ensureSameSchool(user, schoolId);
        user.setStatus(AccountStatus.DELETED);
        userRepository.save(user);
        return ResponseEntity.ok(SchoolApiResponse.success("User deleted"));
    }

    @GetMapping("/graduation-settings")
    public ResponseEntity<?> graduationSettings() {
        return ResponseEntity.ok(SchoolApiResponse.success(Map.of("finalGrade", "8"), "Graduation settings loaded"));
    }

    @PutMapping("/graduation-settings")
    public ResponseEntity<?> updateGraduationSettings(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(SchoolApiResponse.success(Map.of("finalGrade", String.valueOf(payload.get("finalGrade"))),
                "Graduation settings updated"));
    }

    private UUID currentSchoolId(String authHeader) {
        return UUID.fromString(String.valueOf(jwtValidator.validateTokenIssued(authHeader).get("school")));
    }

    private void ensureSameSchool(Users user, UUID schoolId) {
        if (user.getSchool() == null || !schoolId.equals(user.getSchool().getId())) {
            throw new SchoolResourceNotFoundExceptionHandler("User not found");
        }
    }

    private Set<UserRoles> resolveRoles(Map<String, Object> payload) {
        if (payload.get("roles") instanceof List<?> roles && !roles.isEmpty()) {
            return roles.stream()
                    .map(role -> UserRoles.valueOf(String.valueOf(role).trim().toUpperCase()))
                    .collect(Collectors.toSet());
        }
        String role = stringValue(payload, "role", "UNASSIGNED");
        return Set.of(UserRoles.valueOf(role.trim().toUpperCase()));
    }

    private SchoolClass resolveClass(UUID schoolId, Map<String, Object> payload) {
        String gradeValue = stringValue(payload, "classGrade", "");
        String stream = stringValue(payload, "classStream", "");
        if (gradeValue.isBlank() || stream.isBlank()) {
            return null;
        }
        return schoolClassRepository.findByClassGradeAndClassStream(Integer.valueOf(gradeValue), stream);
    }

    private String stringValue(Map<String, Object> payload, String key, String fallback) {
        Object value = payload.get(key);
        return value == null || String.valueOf(value).isBlank() ? fallback : String.valueOf(value).trim();
    }

    private String generatedEmail() {
        return "edunex-" + UUID.randomUUID().toString().substring(0, 8) + "@school.edunex.com";
    }

    private Map<String, Object> toUser(Users user) {
        return Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "roles", user.getRoles(),
                "status", user.getStatus(),
                "schoolId", user.getSchool() == null ? "" : user.getSchool().getId());
    }

    private Map<String, Object> toStaff(Users user) {
        TeacherProfile profile = user.getTeacherProfile();
        SchoolClass schoolClass = profile == null ? null : profile.getSchoolClass();
        String name = profile == null ? user.getEmail() : (profile.getFirstName() + " " + profile.getLastName()).trim();

        return Map.ofEntries(
                entry("id", user.getId().toString()),
                entry("name", name),
                entry("email", user.getEmail()),
                entry("phone", ""),
                entry("status", user.getStatus().name()),
                entry("department", ""),
                entry("roles", user.getRoles()),
                entry("roleLabel", user.getRoles().stream().map(Enum::name).collect(Collectors.joining(", "))),
                entry("classGrade", schoolClass == null ? "" : String.valueOf(schoolClass.getClassGrade())),
                entry("classStream", schoolClass == null ? "" : schoolClass.getClassStream()),
                entry("subjects", List.of()));
    }

    private Map<String, Object> toStudent(Users user) {
        StudentProfile profile = user.getStudentProfile();
        SchoolClass schoolClass = profile == null ? null : profile.getSchoolClass();

        return Map.ofEntries(
                entry("id", user.getId().toString()),
                entry("admissionNo", profile == null ? "" : profile.getStudentAdm()),
                entry("name", profile == null ? user.getEmail() : profile.getStudentFullName()),
                entry("gender", ""),
                entry("guardianName", ""),
                entry("guardianPhone", profile == null ? "" : profile.getPhoneNumber()),
                entry("status", user.getStatus().name()),
                entry("classGrade", schoolClass == null ? "" : String.valueOf(schoolClass.getClassGrade())),
                entry("classStream", schoolClass == null ? "" : schoolClass.getClassStream()),
                entry("enrolledSubjects", List.of()));
    }

    private Map<String, Object> toSubject(Subject subject) {
        return Map.of(
                "id", subject.getId().toString(),
                "name", subject.getSubjectName(),
                "department", "");
    }

    private Map<String, Object> toAssignment(SubjectJoint subjectJoint) {
        SchoolClass schoolClass = subjectJoint.getSchoolClass();
        TeacherProfile teacher = subjectJoint.getTeacherProfile();
        return Map.of(
                "id", subjectJoint.getId().toString(),
                "subjectId", subjectJoint.getSubject().getId().toString(),
                "teacherId", teacher == null ? "" : teacher.getTeacher().getId().toString(),
                "classGrade", schoolClass == null ? "" : String.valueOf(schoolClass.getClassGrade()),
                "classStream", schoolClass == null ? "" : schoolClass.getClassStream(),
                "enrollmentMode", subjectJoint.getSubjectType().name().toLowerCase(),
                "sharedSlotId", subjectJoint.getElectiveCode() == null ? "" : subjectJoint.getElectiveCode());
    }
}
