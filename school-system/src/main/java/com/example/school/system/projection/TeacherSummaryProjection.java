package com.example.school.system.projection;

import java.util.Set;
import java.util.UUID;
import com.example.school.system.types.AccountStatus;
import com.example.school.system.types.UserRoles;
import lombok.Builder;

@Builder
public record TeacherSummaryProjection(
        UUID userId,
        String email,
        AccountStatus status,
        UserRoles role,
        String firstName,
        String lastName,
        String phoneNumber,
        UUID teacherId,
        UUID schoolId,
        String schoolName,
        Integer classGrade,
        String classStream
) {
    public UUID getUserId() { return userId; }
    public String getEmail() { return email; }
    public AccountStatus getStatus() { return status; }
    public Set<UserRoles> getRoles() { return role != null ? Set.of(role) : Set.of(); }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getPhoneNumber() { return phoneNumber; }
    public UUID getTeacherId() { return teacherId; }
    public UUID getSchoolId() { return schoolId; }
    public String getSchoolName() { return schoolName; }
    public Integer getClassGrade() { return classGrade; }
    public String getClassStream() { return classStream; }
}
