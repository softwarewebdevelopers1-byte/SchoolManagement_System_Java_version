package com.example.school.system.controller;

import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.projection.StudentSummaryProjection;
import com.example.school.system.projection.TeacherSummaryProjection;
import com.example.school.system.services.AuthenticatedUserService;
import com.example.school.system.services.GetStudentsService;
import com.example.school.system.services.TeachersService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Domain-specific list endpoints.  They replace the old all-data dashboard payload. */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class RosterController {
    private final AuthenticatedUserService authenticatedUserService;
    private final GetStudentsService getStudentsService;
    private final TeachersService teachersService;

    @GetMapping("/students/roster")
    @PreAuthorize("hasAnyRole('ADMIN','HEADTEACHER','CLASSTEACHER','DEPUTYTEACHER','SUBJECTTEACHER')")
    public ResponseEntity<?> students(@RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "50") int size) {
        Page<StudentSummaryProjection> roster = getStudentsService.getStudentRoster(
                authenticatedUserService.currentUser().user().getSchoolId(), page, size);
        return ResponseEntity.ok(SchoolApiResponse.success(roster, "student roster loaded"));
    }

    @GetMapping("/teachers/roster")
    @PreAuthorize("hasAnyRole('ADMIN','HEADTEACHER','DEPUTYTEACHER')")
    public ResponseEntity<?> teachers(@RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "50") int size) {
        Page<TeacherSummaryProjection> roster = teachersService.getTeacherRoster(
                authenticatedUserService.currentUser().user().getSchoolId(), page, size);
        return ResponseEntity.ok(SchoolApiResponse.success(roster, "teacher roster loaded"));
    }
}
