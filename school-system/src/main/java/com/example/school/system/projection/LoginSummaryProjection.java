package com.example.school.system.projection;

import java.util.UUID;
import com.example.school.system.types.AccountStatus;
import com.example.school.system.types.ExamType;
import com.example.school.system.types.SchoolStatus;
import lombok.Builder;

@Builder
public record LoginSummaryProjection(
        UUID userId,
        String email,
        String password,
        AccountStatus status,
        UUID schoolId,
        String schoolName,
        SchoolStatus schoolStatus,
        Integer currentSchoolTerm,
        String academicYear,
        ExamType examType
) {
    public UUID getUserId() { return userId; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public AccountStatus getStatus() { return status; }
    public UUID getSchoolId() { return schoolId; }
    public String getSchoolName() { return schoolName; }
    public SchoolStatus getSchoolStatus() { return schoolStatus; }
    public Integer getCurrentSchoolTerm() { return currentSchoolTerm; }
    public String getAcademicYear() { return academicYear; }
    public ExamType getExamType() { return examType; }
}
