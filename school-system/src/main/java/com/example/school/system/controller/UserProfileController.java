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

import com.example.school.system.DTO.GetAllStudentsDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.AuthenticatedUserService;
import com.example.school.system.services.GetStudentsService;
import com.example.school.system.services.DashboardService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserProfileController {
    private final AuthenticatedUserService authenticatedUserService;
    private final GetStudentsService getStudentsService;
    private final DashboardService dashboardService;

    @GetMapping("/users/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HEADTEACHER','CLASSTEACHER','DEPUTYTEACHER','SUBJECTTEACHER','STUDENT')")
    public ResponseEntity<?> getUserProfile(@PathVariable UUID id) {
        var user = authenticatedUserService.currentUser();
        return ResponseEntity.ok(SchoolApiResponse.success(user.user(), "user profile loaded"));
    }

    // @GetMapping("/users/student-dashboard")
    // @PreAuthorize("hasAnyRole('STUDENT')")
    // public ResponseEntity<?> getStudentDashboard(GetAllStudentsDTO getAllStudentsDTO) {
    //     UUID userId = authenticatedUserService.currentUserId();
    //     var user = authenticatedUserService.currentUser();
    //     UUID schoolId = user.user().getSchoolId();
        
    //     var students = getStudentsService.getAllStudents(
    //        getAllStudentsDTO (schoolId), 0, 100);
        
    //     var dashboardData = new HashMap<String, Object>();
    //     dashboardData.put("parent", Map.of("name", "Parent", "phone", ""));
    //     dashboardData.put("students", students);
        
    //     return ResponseEntity.ok(SchoolApiResponse.success(dashboardData, "student dashboard loaded"));
    // }

    @GetMapping("/users/class/{grade}/{stream}")
    @PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER','DEPUTYTEACHER','HEADTEACHER')")
    public ResponseEntity<?> getClassStudents(
            @PathVariable String grade,
            @PathVariable String stream,
            @RequestParam(required = false) Integer term,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String examType) {
        return ResponseEntity.ok(SchoolApiResponse.success(List.of(), "class students loaded"));
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> bulkEnrollElective(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(SchoolApiResponse.success("Elective enrollments updated successfully"));
    }

    @PutMapping("/users/bulk-update-term")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> bulkUpdateTerm(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(SchoolApiResponse.success("Term updated for all classes"));
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
        
        var dashboardData = new HashMap<String, Object>();
        dashboardData.put("students", students);
        dashboardData.put("staff", List.of());
        dashboardData.put("subjects", List.of());
        dashboardData.put("assignments", List.of());
        dashboardData.put("exitedStudents", List.of());

        return ResponseEntity.ok(SchoolApiResponse.success(dashboardData, "dashboard loaded"));
    }
}
