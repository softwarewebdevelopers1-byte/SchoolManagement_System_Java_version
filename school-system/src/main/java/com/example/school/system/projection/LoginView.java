package com.example.school.system.projection;

import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import com.example.school.system.types.AccountStatus;
import com.example.school.system.types.ExamType;
import com.example.school.system.types.SchoolStatus;
import com.example.school.system.types.UserRoles;

public interface LoginView {
    @Value("#{target.id}")
    UUID getUserId();

    String getEmail();

    @Value("#{target.teacherProfile?.id}")
    UUID getTeacherId();

    @Value("#{target.teacherProfile?.firstName}")
    String getFirstName();

    @Value("#{target.teacherProfile?.lastName}")
    String getLastName();

    @Value("#{target.teacherProfile?.schoolClass?.classId}")
    UUID getClassId();

    @Value("#{target.teacherProfile?.schoolClass?.classStream}")
    String getClassStream();

    @Value("#{target.teacherProfile?.schoolClass?.classGrade}")
    Integer getClassGrade();

    @Value("#{target.school?.id}")
    UUID getSchoolId();

    @Value("#{target.school?.schoolSettings?.examSettings?.examType}")
    ExamType getExamType();

    @Value("#{target.school?.schoolSettings?.academicYear}")
    String getAcademicYear();

    @Value("#{target.school?.schoolSettings?.currentSchoolTerm}")
    Integer getCurrentSchoolTerm();

    @Value("#{target.school?.status}")
    SchoolStatus getSchoolStatus();

    String getPassword();

    AccountStatus getStatus();

    Set<UserRoles> getRoles();
}
