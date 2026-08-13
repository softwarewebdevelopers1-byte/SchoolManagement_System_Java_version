package com.example.school.system.services;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;

import com.example.school.system.DTO.GetAllClassesDTO;
import com.example.school.system.DTO.SchoolClassCreateDTO;
import com.example.school.system.DTO.SchoolClassUpdate;
import com.example.school.system.DTO.UnassignClassTeacherDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.DTO.DTOResponse.StudentClassHistoryDTO;
import com.example.school.system.error.SchoolResourceBadInputExceptionHandler;
import com.example.school.system.error.SchoolResourceExistsExceptionHandler;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.School;
import com.example.school.system.models.SchoolClass;
import com.example.school.system.models.SchoolSettings;
import com.example.school.system.models.StudentClassHistory;
import com.example.school.system.models.StudentProfile;
import com.example.school.system.models.TeacherProfile;
import com.example.school.system.models.Users;
import com.example.school.system.repository.SchoolClassRepository;
import com.example.school.system.repository.SchoolRepository;
import com.example.school.system.repository.SchoolSettingsRepository;
import com.example.school.system.repository.StudentClassHistoryRepository;
import com.example.school.system.repository.StudentRepository;
import com.example.school.system.repository.TeacherProfileRepository;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.types.ExamType;
import com.example.school.system.types.UserRoles;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Service
@Slf4j
public class SchoolClassService {
    private final SchoolClassRepository schoolClassRepository;
    private final SchoolRepository schoolRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final SchoolSettingsRepository schoolSettingsRepository;
    private final StudentClassHistoryRepository studentClassHistoryRepository;

    @Transactional
    public SchoolApiResponse<?> getAllClasses(UUID schoolId) {
        List<SchoolClass> classes = schoolClassRepository.findBySchoolId(schoolId);
        List<GetAllClassesDTO> allClasses = classes.stream().map(c -> {
            long allStudents = studentRepository.countByschoolClassClassId(c.getClassId());
            return GetAllClassesDTO.builder().classId(c.getClassId()).grade(c.getClassGrade().toString())
                    .stream(c.getClassStream())
                    .className(c.getClassGrade().toString() + " " + c.getClassStream())
                    // teacher user id is the one passed not teacherProfileId
                    .classTeacherId(
                            c.getTeacher() != null && c.getTeacher().getTeacher() != null
                                    ? c.getTeacher().getTeacher().getId()
                                    : null)
                    .classTeacher(
                            c.getTeacher() != null ? c.getTeacher().getFirstName() + " " + c.getTeacher().getLastName()
                                    : null)
                    .totalStudents(allStudents).build();
        }).toList();
        return SchoolApiResponse.success(allClasses, "all classes loaded");
    }

    @Transactional
    public SchoolApiResponse<?> updateSchoolClassCycle(UUID schoolId) {
        School schoolFound = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school not found"));
        int currentYear = LocalDate.now().getYear();
        int settingsYear = Integer.parseInt(schoolFound.getSchoolSettings().getAcademicYear());
        if (settingsYear == currentYear) {
            log.info("{} cannot be updated from {} to {}", schoolFound.getSchoolName(), settingsYear, currentYear);
            throw new SchoolResourceBadInputExceptionHandler(
                    "Cannot update school since we are on current year " + currentYear);
        }
        String academicYear = schoolSettingsRepository.findBySchoolId(schoolId)
                .map(SchoolSettings::getAcademicYear)
                .orElse(String.valueOf(LocalDate.now().getYear()));

        List<SchoolClass> classes = schoolFound.getClasses();
        if (!classes.isEmpty()) {
            recordStudentClassHistory(schoolFound, classes, academicYear);
            classes.stream().forEach(c -> {
                c.setClassGrade(c.getClassGrade() + 1);
                c.setUpdatedAt(LocalDate.now());

            });
        }
        SchoolSettings settings = schoolFound.getSchoolSettings();
        settings.setAcademicYear(String.valueOf(currentYear));
        settings.setCurrentSchoolTerm(1);
        settings.getExamSettings().setExamType(ExamType.OPENER);
        ;
        schoolFound.setClasses(classes);
        return SchoolApiResponse.success("classes updated and student class history recorded");
    }

    @Transactional(readOnly = true)
    public List<StudentClassHistoryDTO> getStudentClassHistory(UUID studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new SchoolResourceNotFoundExceptionHandler("student not found");
        }
        return studentClassHistoryRepository.findAllByStudentIdOrderByAcademicYearDesc(studentId)
                .stream()
                .map(this::toStudentClassHistoryDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StudentClassHistoryDTO> getSchoolClassHistory(UUID schoolId, String academicYear) {
        if (!schoolRepository.existsById(schoolId)) {
            throw new SchoolResourceNotFoundExceptionHandler("school not found");
        }
        return studentClassHistoryRepository
                .findAllBySchoolIdAndAcademicYearOrderByClassGradeAscClassStreamAscStudentStudentFullNameAsc(
                        schoolId,
                        academicYear)
                .stream()
                .map(this::toStudentClassHistoryDTO)
                .toList();
    }

    private void recordStudentClassHistory(School school, List<SchoolClass> classes, String academicYear) {
        var alreadyRecordedStudentIds = new HashSet<>(
                studentClassHistoryRepository.findRecordedStudentIdsForSchoolYear(school.getId(), academicYear));
        List<StudentClassHistory> histories = classes.stream()
                .flatMap(schoolClass -> studentRepository.findAllBySchoolClassClassId(schoolClass.getClassId())
                        .stream()
                        .filter(student -> alreadyRecordedStudentIds.add(student.getId()))
                        .map(student -> toStudentClassHistory(school, schoolClass, student, academicYear)))
                .toList();
        if (!histories.isEmpty()) {
            studentClassHistoryRepository.saveAll(histories);
        }
    }

    private StudentClassHistory toStudentClassHistory(
            School school,
            SchoolClass schoolClass,
            StudentProfile student,
            String academicYear) {
        StudentClassHistory history = new StudentClassHistory();
        history.setSchool(school);
        history.setSchoolClass(schoolClass);
        history.setStudent(student);
        history.setAcademicYear(academicYear);
        history.setClassGrade(schoolClass.getClassGrade());
        history.setClassStream(schoolClass.getClassStream());
        return history;
    }

    private StudentClassHistoryDTO toStudentClassHistoryDTO(StudentClassHistory history) {
        StudentProfile student = history.getStudent();
        return StudentClassHistoryDTO.builder()
                .studentId(student.getId())
                .studentName(student.getStudentFullName())
                .admissionNumber(student.getStudentAdm())
                .classId(history.getSchoolClass().getClassId())
                .classGrade(history.getClassGrade())
                .classStream(history.getClassStream())
                .academicYear(history.getAcademicYear())
                .recordedAt(history.getRecordedAt())
                .build();
    }

    public SchoolApiResponse<?> createClass(SchoolClassCreateDTO classDTO) {
        Integer grade = classDTO.grade();
        String classStream = classDTO.classStream();
        School schoolFound = schoolRepository.findById(classDTO.schoolId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school not found"));
        classExistenceChecker(grade, classStream, classDTO.schoolId());

        schoolClassRepository.save(toClassCreate(grade, classStream, schoolFound));
        return SchoolApiResponse.success("class created");
    }

    private void classExistenceChecker(Integer grade, String classStream, UUID schoolFound) {
        if (schoolClassRepository.existsByClassGradeAndClassStreamAndSchoolId(grade, classStream, schoolFound)) {

            throw new SchoolResourceExistsExceptionHandler("class already exists");
        }
    }

    private SchoolClass toClassCreate(Integer classGrade, String classStream, School school) {
        SchoolClass sClass = new SchoolClass();
        sClass.setClassGrade(classGrade);
        sClass.setClassStream(classStream);
        sClass.setSchool(school);
        return sClass;
    }

    @Transactional
    public SchoolApiResponse<?> updateClass(@RequestBody SchoolClassUpdate schoolClassDTO) {
        Integer grade = schoolClassDTO.grade();
        String stream = schoolClassDTO.classStream();
        UUID teacherId = schoolClassDTO.classTeacherId();

        SchoolClass schoolClass = schoolClassRepository
                .findByClassIdAndSchoolId(schoolClassDTO.classId(), schoolClassDTO.schoolId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("class not found"));
        if (!schoolClass.getClassGrade().equals(grade)
                || !schoolClass.getClassStream().equals(stream)
                        && schoolClassRepository.existsByClassGradeAndClassStreamAndSchoolId(grade,
                                stream, schoolClassDTO.schoolId())) {
            throw new SchoolResourceExistsExceptionHandler("class already exists");
        }
        if (teacherId != null) {
            Users user = userRepository.findById(teacherId)
                    .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("teacher not found"));
            boolean teacherRoleAdded = false;
            if (!user.getRoles().contains(UserRoles.CLASSTEACHER)) {
                teacherRoleAdded = true;
                user.getRoles().add(UserRoles.CLASSTEACHER);
            }
            TeacherProfile teacherProfile = user.getTeacherProfile();
            if (teacherProfile == null) {
                throw new SchoolResourceNotFoundExceptionHandler("teacher profile not found");
            }
            if (teacherProfile.getSchoolClass() != null
                    && !Objects.equals(schoolClass.getClassId(), teacherProfile.getSchoolClass().getClassId())) {
                throw new SchoolResourceExistsExceptionHandler("Teacher already assigned to another class");
            }
            schoolClass.setTeacher(teacherProfile);
            teacherProfile.setSchoolClass(schoolClass);
            if (teacherRoleAdded) {
                userRepository.save(user);
            }
            teacherProfileRepository.save(teacherProfile);
        }

        if (grade != null) {
            schoolClass.setClassGrade(schoolClassDTO.grade());
        }
        if (stream != null) {
            schoolClass.setClassStream(schoolClassDTO.classStream());
        }

        schoolClassRepository.save(schoolClass);

        return SchoolApiResponse.success("class updated");
    }

    public SchoolApiResponse<?> unAssignClassTeacher(UnassignClassTeacherDTO unassignClassTeacherDTO) {
        SchoolClass classFound = schoolClassRepository.findByClassIdAndSchoolId(unassignClassTeacherDTO.classId(),
                unassignClassTeacherDTO.schoolId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("class not found"));
        TeacherProfile currenTeacher = classFound.getTeacher();
        if (currenTeacher == null) {
            throw new SchoolResourceNotFoundExceptionHandler("class has no assigned teacher");
        }
        Users user = currenTeacher.getTeacher();
        if (user.getRoles().contains(UserRoles.CLASSTEACHER)) {
            user.getRoles().remove(UserRoles.CLASSTEACHER);
        }
        userRepository.save(user);
        currenTeacher.setSchoolClass(null);
        classFound.setTeacher(null);
        schoolClassRepository.save(classFound);
        teacherProfileRepository.save(currenTeacher);
        return SchoolApiResponse.success("class teacher unassigned");
    }
}
