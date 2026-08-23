package com.example.school.system.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.example.school.system.DTO.BulkEnrollElectiveDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.AuthenticatedUserService;
import com.example.school.system.services.GetStudentsService;
import com.example.school.system.services.SubjectService;
import com.example.school.system.services.TeachersService;
import com.example.school.system.services.UserUpdate;
import com.example.school.system.repository.SchoolClassRepository;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserProfileController {
    private final AuthenticatedUserService authenticatedUserService;
    private final GetStudentsService getStudentsService;
    private final SubjectService subjectService;
    private final TeachersService teachersService;
    private final UserUpdate userUpdate;
    private final SchoolClassRepository schoolClassRepository;

    @GetMapping("/users/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HEADTEACHER','CLASSTEACHER','DEPUTYTEACHER','SUBJECTTEACHER','STUDENT')")
    public ResponseEntity<?> getUserProfile(@PathVariable UUID id) {
        var user = authenticatedUserService.currentUser();
        return ResponseEntity.ok(SchoolApiResponse.success(user.user(), "user profile loaded"));
    }

    @GetMapping("/users/class/{grade}/{stream}")
    @PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER','DEPUTYTEACHER','HEADTEACHER')")
    public ResponseEntity<?> getClassStudents(
            @PathVariable String grade,
            @PathVariable String stream,
            @RequestParam(required = false) Integer term,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String examType) {
        var schoolId = authenticatedUserService.currentUser().user().getSchoolId();
        if (schoolId == null) {
            return ResponseEntity.ok(SchoolApiResponse.success(List.of(), "class students loaded"));
        }
        // Find classId by grade and stream
        var classes = schoolClassRepository.findAllBySchoolIdWithTeacherAndStudents(schoolId).stream()
                .filter(c -> String.valueOf(c.getClassGrade()).equals(grade))
                .filter(c -> c.getClassStream().equalsIgnoreCase(stream))
                .toList();
        if (classes.isEmpty()) {
            return ResponseEntity.ok(SchoolApiResponse.success(List.of(), "class students loaded"));
        }
        var classId = classes.get(0).getClassId();
        var students = getStudentsService.getStudentByClass(
                new com.example.school.system.DTO.GetStudentsOfSpecificClass(classId), 0, 100);
        return ResponseEntity.ok(SchoolApiResponse.success(students, "class students loaded"));
    }

    @GetMapping("/users/graduation-settings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getGraduationSettings() {
        return ResponseEntity.ok(SchoolApiResponse.success(Map.of("finalGrade", "C"), "graduation settings loaded"));
    }

    @PutMapping("/users/graduation-settings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateGraduationSettings(@RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(SchoolApiResponse.success(Map.of("finalGrade", payload.get("finalGrade")), "graduation settings updated"));
    }

    @PostMapping("/users/bulk-enroll-elective")
    @PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER')")
    public ResponseEntity<?> bulkEnrollElective(@RequestBody Map<String, Object> payload) {
        try {
            @SuppressWarnings("unchecked")
            List<String> studentIdsRaw = (List<String>) payload.get("studentIds");
            String subjectId = String.valueOf(payload.get("subjectId"));
            String action = String.valueOf(payload.get("action"));

            if (studentIdsRaw == null || studentIdsRaw.isEmpty()) {
                return ResponseEntity.ok(SchoolApiResponse.success("No students provided for enrollment update"));
            }

            List<UUID> studentIds = studentIdsRaw.stream()
                    .map(UUID::fromString)
                    .collect(Collectors.toList());

            BulkEnrollElectiveDTO dto = BulkEnrollElectiveDTO.builder()
                    .studentIds(studentIds)
                    .subjectId(UUID.fromString(subjectId))
                    .action(action)
                    .build();

            userUpdate.bulkEnrollElective(dto);
            return ResponseEntity.ok(SchoolApiResponse.success(
                    Map.of("updated", studentIds.size()),
                    "Elective enrollments updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    SchoolApiResponse.error("Failed to update elective enrollments: " + e.getMessage()));
        }
    }

    @PostMapping("/users/parent-concerns")
    @PreAuthorize("hasAnyRole('STUDENT','PARENT')")
    public ResponseEntity<?> sendParentConcern(@RequestBody Map<String, String> payload) {
        return ResponseEntity.status(201).body(SchoolApiResponse.success("concern submitted"));
    }

    @PutMapping("/users/parent-concerns/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','DEPUTYTEACHER','HEADTEACHER')")
    public ResponseEntity<?> updateParentConcernStatus(@PathVariable String id, @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(SchoolApiResponse.success("status updated"));
    }

    @DeleteMapping("/users/exited-students/{recordId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteExitedStudent(@PathVariable String recordId) {
        return ResponseEntity.ok(SchoolApiResponse.success("exited student removed"));
    }

    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('ADMIN','HEADTEACHER','CLASSTEACHER','DEPUTYTEACHER','SUBJECTTEACHER')")
    public ResponseEntity<?> getUsersDashboard() {
        UUID schoolId = authenticatedUserService.currentUser().user().getSchoolId();
        if (schoolId == null) {
            return ResponseEntity.ok(SchoolApiResponse.success(Map.of(
                "students", List.of(),
                "staff", List.of(),
                "subjects", List.of(),
                "assignments", List.of(),
                "exitedStudents", List.of()
            ), "dashboard loaded"));
        }

        var students = getStudentsService.getAllStudents(
            new com.example.school.system.DTO.GetAllStudentsDTO(schoolId), 0, 500);
        var staff = teachersService.getTeachers(schoolId, "Bearer " + getAuthToken());
        var subjects = subjectService.getSubjects(schoolId);
        var assignments = subjectService.getAllSubjectJoints(schoolId);

        var dashboardData = new HashMap<String, Object>();
        dashboardData.put("students", students);
        dashboardData.put("staff", staff);
        dashboardData.put("subjects", subjects);
        dashboardData.put("assignments", assignments);
        dashboardData.put("exitedStudents", List.of());

        return ResponseEntity.ok(SchoolApiResponse.success(dashboardData, "dashboard loaded"));
    }

    private String getAuthToken() {
        var request = org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
        if (request instanceof org.springframework.web.context.request.ServletRequestAttributes servletRequest) {
            var header = servletRequest.getRequest().getHeader("Authorization");
            return header != null ? header : "";
        }
        return "";
    }
}