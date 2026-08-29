package com.example.school.system.controller.superadmin;

import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.superadmin.SuperAdminService;
import com.example.school.system.types.AccountStatus;
import com.example.school.system.types.SchoolStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/superadmin")
@PreAuthorize("hasRole('SUPERADMIN')")
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    @GetMapping("/platform/statistics")
    public ResponseEntity<?> getPlatformStatistics() {
        return ResponseEntity.ok(SchoolApiResponse.success(superAdminService.getPlatformStatistics(),
                "Platform statistics loaded"));
    }

    @GetMapping("/schools")
    public ResponseEntity<?> getAllSchools() {
        var res = superAdminService.getAllSchools();
        return ResponseEntity.ok(SchoolApiResponse.success(res, "Schools loaded"));
    }

    @GetMapping("/schools/{schoolId}")
    public ResponseEntity<?> getSchoolDetails(@PathVariable UUID schoolId) {
        var res = superAdminService.getSchoolDetails(schoolId);
        return ResponseEntity.ok(SchoolApiResponse.success(res, "School loaded"));
    }

    @PatchMapping("/schools/{schoolId}/status")
    public ResponseEntity<?> updateSchoolStatus(@PathVariable UUID schoolId,
            @RequestParam SchoolStatus status) {
        var res = superAdminService.updateSchoolStatus(schoolId, status);
        return ResponseEntity.ok(SchoolApiResponse.success(res, "School status updated"));
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        var res = superAdminService.getAllUsers();
        return ResponseEntity.ok(SchoolApiResponse.success(res, "Users loaded"));
    }

    @GetMapping("/staff")
    public ResponseEntity<?> getStaff() {
        var res = superAdminService.getPlatformStaff();
        return ResponseEntity.ok(SchoolApiResponse.success(res, "Staff loaded"));
    }

    @GetMapping("/users/teachers")
    public ResponseEntity<?> getAllTeachersAndAdmins() {
        var res = superAdminService.getAllTeachersAndAdmins();
        return ResponseEntity.ok(SchoolApiResponse.success(res, "Teachers and admins loaded"));
    }

    @GetMapping("/invitations")
    public ResponseEntity<?> getInvitations() {
        var res = superAdminService.getInvitations();
        return ResponseEntity.ok(SchoolApiResponse.success(res, "Invitations loaded"));
    }

    @GetMapping("/schools/search")
    public ResponseEntity<?> searchSchools(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        var res = superAdminService.searchSchools(status, search);
        return ResponseEntity.ok(SchoolApiResponse.success(res, "Schools search completed"));
    }

    @GetMapping("/staff/search")
    public ResponseEntity<?> searchStaff(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search) {
        var res = superAdminService.searchStaff(status, role, search);
        return ResponseEntity.ok(SchoolApiResponse.success(res, "Staff search completed"));
    }

    @PostMapping("/invites")
    public ResponseEntity<?> createInvite(@Valid @RequestBody SuperAdminInviteRequest request) {
        return ResponseEntity.ok(SchoolApiResponse.success(superAdminService.createAdminInvite(request),
                "Admin invite generated"));
    }

    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable UUID userId,
            @RequestParam AccountStatus status) {
        var res = superAdminService.updateUserStatus(userId, status);
        return ResponseEntity.ok(SchoolApiResponse.success(res, "User status updated"));
    }
}
