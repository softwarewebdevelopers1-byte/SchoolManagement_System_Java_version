package com.example.school.system.services;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;
import com.example.school.system.DTO.GetAllClassesDTO;
import com.example.school.system.DTO.GetClassSnapshot;
import com.example.school.system.DTO.SchoolClassCreateDTO;
import com.example.school.system.DTO.SchoolClassUpdate;
import com.example.school.system.DTO.StudentsOfSpecificClassRes;
import com.example.school.system.DTO.UnassignClassTeacherDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.error.SchoolResourceBadInputExceptionHandler;
import com.example.school.system.error.SchoolResourceExistsExceptionHandler;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.ClassHistory;
import com.example.school.system.models.School;
import com.example.school.system.models.SchoolClass;
import com.example.school.system.models.SchoolSettings;
import com.example.school.system.models.TeacherProfile;
import com.example.school.system.models.Users;
import com.example.school.system.repository.ClassHistoryRepository;
import com.example.school.system.repository.SchoolClassRepository;
import com.example.school.system.repository.SchoolRepository;
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
    private final ClassHistoryRepository classHistoryRepository;

    @Transactional
    public SchoolApiResponse<?> getAllClasses(UUID schoolId) {
        List<SchoolClass> classes = schoolClassRepository.findBySchoolId(schoolId);
        Map<UUID, Long> studentCounts = studentRepository.countBySchoolIdAsMap(schoolId);
        List<GetAllClassesDTO> allClasses = classes.stream().filter(classFound -> classFound.isCompleted() == false)
                .map(c -> {
                    long allStudents = studentCounts.getOrDefault(c.getClassId(), 0L);
                    return GetAllClassesDTO.builder().classId(c.getClassId()).grade(c.getClassGrade().toString())
                            .stream(c.getClassStream())
                            .className(c.getClassGrade().toString() + " " + c.getClassStream())
                            // teacher user id is the one passed not teacherProfileId
                            .classTeacherId(
                                    c.getTeacher() != null && c.getTeacher().getTeacher() != null
                                            ? c.getTeacher().getTeacher().getId()
                                            : null)
                            .classTeacher(
                                    c.getTeacher() != null
                                            ? c.getTeacher().getFirstName() + " " + c.getTeacher().getLastName()
                                            : null)
                            .totalStudents(allStudents).build();
                }).toList();
        return SchoolApiResponse.success(allClasses, "all classes loaded");
    }

    @Transactional
    public SchoolApiResponse<?> updateSchoolClassCycle(UUID schoolId) {
        School schoolFound = schoolRepository.findByIdWithSettings(schoolId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school not found"));
        int currentYear = LocalDate.now().getYear();
        int settingsYear = Integer.parseInt(schoolFound.getSchoolSettings().getAcademicYear());
        if (settingsYear == currentYear) {
            log.info("{} cannot be updated from {} to {}", schoolFound.getSchoolName(), settingsYear, currentYear);
            throw new SchoolResourceBadInputExceptionHandler(
                    "Cannot update school since we are on current year " + currentYear);
        }
        String academicYear = schoolFound.getSchoolSettings().getAcademicYear();

        List<SchoolClass> classes = schoolClassRepository.findBySchoolId(schoolId).stream()
                .filter(s -> s.isCompleted() == false).toList();
        if (!classes.isEmpty()) {
            for (SchoolClass c : classes) {
                ClassHistory classHistory = new ClassHistory();

                if (c.getStudent() == null || c.getStudent().isEmpty()) {
                    continue;
                }

                if (c.getClassGrade() >= schoolFound.getSchoolSettings().getFinalGrade()) {
                    c.setCompleted(true);
                    if (c.getTeacher() != null) {
                        c.getTeacher().setSchoolClass(null);
                    }
                    c.setClassStream(c.getClassStream() + "-" + academicYear);
                    continue;
                }
                classHistory.setCode(c.getClassGrade().toString() + " " + c.getClassStream() + "-"
                        + academicYear);

                classHistory.setCreatedAt(LocalDate.now());

                classHistory.setSchool(schoolFound);

                if (c.getStudent() != null) {
                    classHistory.setStudentProfiles(c.getStudent().stream().map(s -> s.getId()).toList());
                }

                if (c.getTeacher() != null) {
                    classHistory.setClassTeacher(c.getTeacher().getFirstName() + " " + c.getTeacher().getLastName());
                }

                classHistory.setLinkedClass(c.getClassId());
                classHistoryRepository.save(classHistory);
                c.setClassGrade(c.getClassGrade() + 1);
                c.setUpdatedAt(LocalDate.now());
            }
        }
        SchoolSettings settings = schoolFound.getSchoolSettings();
        settings.setAcademicYear(String.valueOf(currentYear));
        settings.setCurrentSchoolTerm(1);
        settings.getExamSettings().setExamType(ExamType.OPENER);
        ;
        schoolFound.setClasses(classes);
        return SchoolApiResponse.success("classes updated and student class history recorded");
    }

    public List<GetClassSnapshot> getAllClassHistoriesSnaphots(UUID schoolId) {
        List<GetClassSnapshot> getClassSnapshots = classHistoryRepository.findBySchoolId(schoolId).stream().map(c -> {
            return GetClassSnapshot.builder().classHistoryId(c.getId()).className(c.getCode())
                    .classTeacherName(c.getClassTeacher() != null ? c.getClassTeacher() : null)
                    .studentsCount(c.getStudentProfiles().size()).build();
        }).toList();
        return getClassSnapshots;
    }

    public List<GetClassSnapshot> getClassHistoriesSnaphots(UUID classId) {
        List<GetClassSnapshot> getClassSnapshots = classHistoryRepository.findByLinkedClass(classId).stream().map(c -> {
            return GetClassSnapshot.builder().classHistoryId(c.getId()).className(c.getCode())
                    .classTeacherName(c.getClassTeacher() != null ? c.getClassTeacher() : null)
                    .studentsCount(c.getStudentProfiles().size()).build();
        }).toList();
        return getClassSnapshots;
    }

    public List<StudentsOfSpecificClassRes> getClassHistoriesStudentsForClass(UUID classHistoryId) {
        ClassHistory classHistory = classHistoryRepository.findById(classHistoryId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("class history not found"));
        List<UUID> studentIds = classHistory.getStudentProfiles();
        return studentRepository.findAllById(studentIds).stream().map(s -> {
            return StudentsOfSpecificClassRes.builder().studentId(s.getId()).fullName(s.getStudentFullName())
                    .Adm(s.getStudentAdm()).build();
        }).toList();
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
                && !schoolClass.getClassStream().equals(stream)
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
