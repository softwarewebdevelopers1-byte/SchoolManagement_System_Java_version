package com.example.school.system.services;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.school.system.DTO.BulkEnrollElectiveDTO;
import com.example.school.system.DTO.ChangePasswordDTO;
import com.example.school.system.DTO.GraduationSettingsDTO;
import com.example.school.system.DTO.ParentConcernDTO;
import com.example.school.system.DTO.ParentConcernStatusDTO;
import com.example.school.system.DTO.StudentDashboardDTO;
import com.example.school.system.DTO.UserCreateDTO;
import com.example.school.system.DTO.UserUpdateDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.error.SchoolResourceBadInputExceptionHandler;
import com.example.school.system.error.SchoolResourceExistsExceptionHandler;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.error.SchoolResourceRestrictedException;
import com.example.school.system.models.MarksRow;
import com.example.school.system.models.MarksSheet;
import com.example.school.system.models.School;
import com.example.school.system.models.SchoolClass;
import com.example.school.system.models.SchoolSettings;
import com.example.school.system.models.StudentProfile;
import com.example.school.system.models.Subject;
import com.example.school.system.models.SubjectJoint;
import com.example.school.system.models.Users;
import com.example.school.system.repository.MarksRepo;
import com.example.school.system.repository.SchoolClassRepository;
import com.example.school.system.repository.SchoolRepository;
import com.example.school.system.repository.SchoolSettingsRepository;
import com.example.school.system.repository.StudentRepository;
import com.example.school.system.repository.StudentSubjectSelectionRepo;
import com.example.school.system.repository.SubjectJointRepo;
import com.example.school.system.repository.TeacherProfileRepository;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.security.PasswordHashing;
import com.example.school.system.security.jwt.JwtValidator;
import com.example.school.system.types.AccountStatus;
import com.example.school.system.types.UserRoles;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserUpdate {
    private final UserRepository userRepository;
    private final PasswordHashing passwordHashing;
    private final JwtValidator jwtValidator;
    private final StudentRepository studentRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SchoolRepository schoolRepository;
    private final SchoolSettingsRepository schoolSettingsRepository;
    private final SubjectJointRepo subjectJointRepo;
    private final MarksRepo marksRepo;
    private final StudentSubjectSelectionRepo studentSubjectSelectionRepo;
    private final TeacherProfileRepository teacherProfileRepository;

    @Transactional
    public SchoolApiResponse<?> updateUserDetails(UserUpdateDTO userUpdate, String token) {
        validateToken(token, userUpdate.userUuid().toString());
        Users user = userRepository.findById(userUpdate.userUuid())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("user not found"));
        String email = userUpdate.email();
        String password = userUpdate.password();
        if (email != null) {
            email = email.trim().toLowerCase();
            if (userRepository.existsByEmail(email) && !email.equals(user.getEmail())) {
                throw new SchoolResourceExistsExceptionHandler("user with that email already exists");
            }
            user.setEmail(email);
        }
        if (password != null) {
            String userPassword = passwordHashing.PasswordEncoder().encode(password);
            user.setPassword(userPassword);
        }
        userRepository.save(user);
        return SchoolApiResponse.success("User updated");
    }

    @Transactional
    public void deleteAccount(UUID id) {
        Users userFound = userRepository.findById(id)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("user not found"));
        userFound.setStatus(AccountStatus.DELETED);
        userFound.setDeletedAt(Instant.now());
        userRepository.save(userFound);
        log.info("user id {} deleted on {}", id, Instant.now());
    }

    @Transactional
    public void suspendAccount(UUID id) {
        userRepository.findById(id)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("user not found"))
                .setStatus(AccountStatus.SUSPENDED);
        ;
    }

    @Transactional
    public void deActivateAccount(UUID id) {
        userRepository.findById(id).orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("user not found"))
                .setStatus(AccountStatus.INACTIVE);
        ;
    }

    private void validateToken(String token, String id) {
        Claims userToken = jwtValidator.validateTokenIssued(token);
        if (!id.equals(userToken.getSubject().toString())) {
            throw new SchoolResourceRestrictedException("forbidden");
        }
    }

    @Transactional(readOnly = true)
    public Users getUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("user not found"));
    }

    @Transactional
    public Users createUser(UserCreateDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new SchoolResourceExistsExceptionHandler("user with that email already exists");
        }
        School school = schoolRepository.findById(dto.getSchoolId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school not found"));
        Users user = new Users();
        user.setEmail(dto.getEmail().trim().toLowerCase());
        user.setPassword(passwordHashing.PasswordEncoder().encode(dto.getPassword()));
        user.setRoles(Set.of(dto.getRole()));
        user.setStatus(AccountStatus.ACTIVE);
        user.setSchool(school);
        user = userRepository.save(user);
        if (dto.getRole() == UserRoles.STUDENT) {
            SchoolClass schoolClass = schoolClassRepository
                    .findByClassGradeAndClassStream(dto.getClassGrade(), dto.getClassStream())
                    .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("class not found"));
            StudentProfile studentProfile = new StudentProfile();
            studentProfile.setStudentFullName(dto.getStudentFullName());
            studentProfile.setStudentAdm(dto.getStudentAdm());
            studentProfile.setPhoneNumber(dto.getPhone());
            studentProfile.setSchoolClass(schoolClass);
            studentProfile.setStudent(user);
            studentProfile.setGuardianName(dto.getGuardianName());
            studentProfile.setPhoneNumber(dto.getGuardianPhone());
            studentRepository.save(studentProfile);
        } else if (dto.getRole() == UserRoles.CLASSTEACHER || dto.getRole() == UserRoles.CLASSTEACHER
                || dto.getRole() == UserRoles.DEPUTYTEACHER || dto.getRole() == UserRoles.SUBJECTTEACHER
                || dto.getRole() == UserRoles.HEADTEACHER) {
            com.example.school.system.models.TeacherProfile teacherProfile = new com.example.school.system.models.TeacherProfile();
            teacherProfile.setFirstName(dto.getName());
            teacherProfile.setTeacher(user);
            teacherProfileRepository.save(teacherProfile);
        }
        return user;
    }

    @Transactional
    public Users updateUser(UUID id, UserCreateDTO dto) {
        Users user = userRepository.findById(id)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("user not found"));
        if (dto.getEmail() != null) {
            user.setEmail(dto.getEmail().trim().toLowerCase());
        }
        if (dto.getPassword() != null) {
            user.setPassword(passwordHashing.PasswordEncoder().encode(dto.getPassword()));
        }
        if (dto.getStatus() != null) {
            user.setStatus(AccountStatus.valueOf(dto.getStatus()));
        }
        userRepository.save(user);
        return user;
    }

    @Transactional
    public void deleteUser(UUID id) {
        deleteAccount(id);
    }

    @Transactional
    public void changePassword(String authHeader, ChangePasswordDTO dto) {
        Claims claims = jwtValidator.validateTokenIssued(authHeader);
        String userId = claims.getSubject();
        Users user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("user not found"));
        if (!passwordHashing.PasswordEncoder().matches(dto.oldPassword(), user.getPassword())) {
            throw new SchoolResourceBadInputExceptionHandler("old password is incorrect");
        }
        user.setPassword(passwordHashing.PasswordEncoder().encode(dto.newPassword()));
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public StudentDashboardDTO getStudentDashboard(String authHeader) {
        Claims claims = jwtValidator.validateTokenIssued(authHeader);
        String userId = claims.getSubject();
        Users user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("user not found"));
        StudentProfile studentProfile = user.getStudentProfile();
        if (studentProfile == null) {
            throw new SchoolResourceNotFoundExceptionHandler("student profile not found");
        }
        SchoolClass schoolClass = studentProfile.getSchoolClass();
        StudentDashboardDTO.StudentInfo studentInfo = StudentDashboardDTO.StudentInfo.builder()
                .id(studentProfile.getId())
                .name(studentProfile.getStudentFullName())
                .admissionNumber(studentProfile.getStudentAdm())
                .classGrade(schoolClass != null ? schoolClass.getClassGrade() : null)
                .classStream(schoolClass != null ? schoolClass.getClassStream() : null)
                .guardianName(studentProfile.getGuardianName())
                .guardianPhone(studentProfile.getPhoneNumber())
                .status(user.getStatus().toString())
                .performance(getStudentPerformance(studentProfile.getId()))
                .build();
        return StudentDashboardDTO.builder()
                .parent(StudentDashboardDTO.ParentInfo.builder()
                        .name(studentProfile.getGuardianName())
                        .phone(studentProfile.getPhoneNumber())
                        .build())
                .students(List.of(studentInfo))
                .build();
    }

    private List<StudentDashboardDTO.PerformanceInfo> getStudentPerformance(UUID studentId) {
        List<MarksRow> marksRows = marksRepo.findByStudentProfileId(studentId);
        return marksRows.stream().map(m -> {
            MarksSheet marksSheet = m.getMarksSheet();
            SubjectJoint subjectJoint = marksSheet.getSubjectJoint();
            SchoolClass schoolClass = subjectJoint.getSchoolClass();
            Subject subject = subjectJoint.getSubject();
            return StudentDashboardDTO.PerformanceInfo.builder()
                    .id(m.getId())
                    .subjectId(subject.getId())
                    .subjectName(subject.getSubjectName())
                    .classGrade(schoolClass != null ? schoolClass.getClassGrade() : null)
                    .classStream(schoolClass != null ? schoolClass.getClassStream() : null)
                    .term(marksSheet.getCurrentSchoolTerm())
                    .year(Integer.parseInt(marksSheet.getAcademicYear()))
                    .examType(marksSheet.getExamType() != null ? marksSheet.getExamType().toString() : null)
                    .cat1(m.getCat1())
                    .cat2(m.getCat2())
                    .cat3(m.getCat3())
                    .exam(m.getExam())
                    .finalScore(m.getTotalMarks())
                    .percentage(
                            m.getAverageMarksPercentage() != null ? m.getAverageMarksPercentage().doubleValue() : null)
                    .cbcBand(m.getGrade())
                    .points(m.getPoints())
                    .build();
        }).toList();
    }

    // @Transactional(readOnly = true)
    // public List<?> getStudentsByClass(Integer grade, String stream, String term,
    // Integer year, String examType) {
    // SchoolClass classes =
    // schoolClassRepository.findByClassGradeAndClassStream(grade,
    // stream).orElseThrow();
    // return classes.getStudent().stream().maq(schoolClass -> {
    // return StudentDashboardDTO.StudentInfo.builder()
    // .id(student.getId())
    // .name(student.getStudentFullName())
    // .admissionNumber(student.getStudentAdm())
    // .classGrade(schoolClass.getClassGrade())
    // .classStream(schoolClass.getClassStream())
    // .guardianName(student.getGuardianName())
    // .guardianPhone(student.getGuardianPhone())
    // .status(student.getStudent().getStatus().toString())
    // .performance(marksRows.stream().map(m -> {
    // SubjectJoint sj = m.getMarksSheet().getSubjectJoint();
    // Subject subj = sj.getSubject();
    // SchoolClass sc = sj.getSchoolClass();
    // return StudentDashboardDTO.PerformanceInfo.builder()
    // .id(m.getId())
    // .subjectId(subj.getId())
    // .subjectName(subj.getSubjectName())
    // .classGrade(sc != null ? sc.getClassGrade() : null)
    // .classStream(sc != null ? sc.getClassStream() : null)
    // .term(m.getMarksSheet().getCurrentSchoolTerm())
    // .year(Integer.parseInt(m.getMarksSheet().getAcademicYear()))
    // .examType(m.getMarksSheet().getExamType() != null
    // ? m.getMarksSheet().getExamType().toString()
    // : null)
    // .cat1(m.getCat1())
    // .cat2(m.getCat2())
    // .cat3(m.getCat3())
    // .exam(m.getExam())
    // .finalScore(m.getTotalMarks())
    // .percentage(m.getAverageMarksPercentage() != null
    // ? m.getAverageMarksPercentage().doubleValue()
    // : null)
    // .cbcBand(m.getGrade())
    // .points(m.getPoints())
    // .build();
    // }).toList())
    // .build();
    // });
    // }).toList();
    // }

    @Transactional(readOnly = true)
    public String getGraduationSettings(UUID schoolId) {
        SchoolSettings settings = schoolSettingsRepository.findBySchoolId(schoolId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school settings not found"));
        return settings.getFinalGrade() != null ? settings.getFinalGrade() : "Final Grade";
    }

    @Transactional
    public String updateGraduationSettings(GraduationSettingsDTO dto) {
        SchoolSettings settings = schoolSettingsRepository.findBySchoolId(dto.getSchoolId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school settings not found"));
        settings.setFinalGrade(dto.getFinalGrade());
        schoolSettingsRepository.save(settings);
        return dto.getFinalGrade();
    }

    @Transactional
    public void bulkEnrollElective(BulkEnrollElectiveDTO dto) {
        SubjectJoint subjectJoint = subjectJointRepo.findById(dto.getSubjectId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("subject joint not found"));
        for (UUID studentId : dto.getStudentIds()) {
            StudentProfile student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("student not found"));
            if ("enroll".equalsIgnoreCase(dto.getAction())) {
                if (!studentSubjectSelectionRepo.existsByElectiveCodeAndStudentProfileId(
                        subjectJoint.getElectiveCode(), studentId)) {
                    com.example.school.system.models.StudentSubjectSelection selection = new com.example.school.system.models.StudentSubjectSelection();
                    selection.setElectiveCode(subjectJoint.getElectiveCode());
                    selection.setStudentProfile(student);
                    selection.setSubjectJoint(subjectJoint);
                    studentSubjectSelectionRepo.save(selection);
                }
            } else if ("unenroll".equalsIgnoreCase(dto.getAction())) {
                studentSubjectSelectionRepo.deleteByElectiveCodeAndStudentProfileId(
                        subjectJoint.getElectiveCode(), studentId);
            }
        }
    }

    @Transactional
    public SchoolApiResponse<?> createParentConcern(ParentConcernDTO dto) {
        StudentProfile student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("student not found"));
        return SchoolApiResponse.success("parent concern created for student: " + student.getStudentFullName());
    }

    @Transactional
    public SchoolApiResponse<?> updateParentConcernStatus(UUID id, ParentConcernStatusDTO dto) {
        return SchoolApiResponse.success("parent concern status updated to: " + dto.getStatus());
    }

    @Transactional
    public void deleteExitedStudent(UUID recordId) {
        studentRepository.findById(recordId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("exited student record not found"));
        studentRepository.deleteById(recordId);
    }
}