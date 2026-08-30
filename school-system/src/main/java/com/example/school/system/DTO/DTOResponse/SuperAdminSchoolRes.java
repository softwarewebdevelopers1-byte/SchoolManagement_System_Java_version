package com.example.school.system.DTO.DTOResponse;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SuperAdminSchoolRes {
    private UUID schoolId;
    private String schoolName;
    private String schoolCode;
    private String address;
    private String email;
    private String phoneNumber;
    private String status;
    private Long totalStaff;
    private Long totalStudents;
    private Long totalUsers;
    private Long activeUsers;
    private String registeredDate;
}
