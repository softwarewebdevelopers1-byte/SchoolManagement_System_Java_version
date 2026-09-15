package com.example.school.system.projection;

import java.util.UUID;

public interface PublicResultRow {
    UUID getStudentId();
    String getStudentName();
    String getStudentAdm();
    Integer getClassGrade();
    String getClassStream();
    String getSchoolName();
    String getSchoolEmail();
    String getSchoolMotto();
    String getSchoolPhone();
    String getAcademicYear();
    Integer getTerm();
    String getExamType();
    String getOverallGrade();
    Double getOverallTotalMarks();
    Integer getPosition();
    Integer getTotalStudents();
    UUID getSubjectId();
    String getSubjectName();
    Integer getScore();
    String getSubjectGrade();
    Double getPoints();
    String getTeacherName();
}
