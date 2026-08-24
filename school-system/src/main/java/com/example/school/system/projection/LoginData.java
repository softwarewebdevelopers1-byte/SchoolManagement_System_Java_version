package com.example.school.system.projection;

import java.util.Set;
import java.util.UUID;
import com.example.school.system.types.AccountStatus;
import com.example.school.system.types.ExamType;
import com.example.school.system.types.SchoolStatus;
import com.example.school.system.types.UserRoles;

public class LoginData implements LoginView {
    private final UUID userId;
    private final String email;
    private final UUID teacherId;
    private final String firstName;
    private final String lastName;
    private final UUID classId;
    private final String classStream;
    private final Integer classGrade;
    private final UUID schoolId;
    private final ExamType examType;
    private final String academicYear;
    private final Integer currentSchoolTerm;
    private final SchoolStatus schoolStatus;
    private final String password;
    private final AccountStatus status;
    private Set<UserRoles> roles;

    public LoginData(UUID userId, String email, UUID teacherId, String firstName, String lastName,
            UUID classId, String classStream, Integer classGrade, UUID schoolId, ExamType examType,
            String academicYear, Integer currentSchoolTerm, SchoolStatus schoolStatus, String password,
            AccountStatus status) {
        this.userId = userId;
        this.email = email;
        this.teacherId = teacherId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.classId = classId;
        this.classStream = classStream;
        this.classGrade = classGrade;
        this.schoolId = schoolId;
        this.examType = examType;
        this.academicYear = academicYear;
        this.currentSchoolTerm = currentSchoolTerm;
        this.schoolStatus = schoolStatus;
        this.password = password;
        this.status = status;
    }

    public void setRoles(Set<UserRoles> roles) {
        this.roles = roles;
    }

    @Override
    public UUID getUserId() { return userId; }

    @Override
    public String getEmail() { return email; }

    @Override
    public UUID getTeacherId() { return teacherId; }

    @Override
    public String getFirstName() { return firstName; }

    @Override
    public String getLastName() { return lastName; }

    @Override
    public UUID getClassId() { return classId; }

    @Override
    public String getClassStream() { return classStream; }

    @Override
    public Integer getClassGrade() { return classGrade; }

    @Override
    public UUID getSchoolId() { return schoolId; }

    @Override
    public ExamType getExamType() { return examType; }

    @Override
    public String getAcademicYear() { return academicYear; }

    @Override
    public Integer getCurrentSchoolTerm() { return currentSchoolTerm; }

    @Override
    public SchoolStatus getSchoolStatus() { return schoolStatus; }

    @Override
    public String getPassword() { return password; }

    @Override
    public AccountStatus getStatus() { return status; }

    @Override
    public Set<UserRoles> getRoles() { return roles; }
}
