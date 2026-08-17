package com.example.school.system.academicsEvents.events;

import java.util.UUID;

import com.example.school.system.models.GradingScale;
import com.example.school.system.types.ExamType;

import lombok.Builder;
@Builder
public record GradingClassStudents(UUID classId, String academicYear, Integer currentSchoolTerm, ExamType examType,GradingScale gradingScale) {

}
