package com.example.school.system.DTO;

import java.util.UUID;

import com.example.school.system.models.GradingScale;
import com.example.school.system.types.ExamType;

public record GradingStreamStudents(UUID schoolId, ExamType examType, String academicYear, Integer currentSchoolTerm,
        GradingScale gradingScale,Integer grade) {

}
