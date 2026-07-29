package com.example.school.system.services.timetable;

import java.util.Set;
import java.util.UUID;

import com.example.school.system.models.SubjectRequirement;
import com.example.school.system.types.SubjectType;
import com.example.school.system.types.SubjectTimePreference;

public record LessonBlock(
        UUID requirementId,
        UUID classId,
        UUID subjectId,
        UUID teacherId,
        UUID subjectJointId,
        String subjectName,
        SubjectType subjectType,
        SubjectTimePreference timePreference,
        int length,
        int sequence,
        Set<UUID> electiveStudentIds) {

    static LessonBlock from(SubjectRequirement requirement, int length, int sequence, Set<UUID> electiveStudentIds) {
        var joint = requirement.getSubjectJoint();
        var subject = joint.getSubject();
        var teacher = joint.getTeacherProfile();
        return new LessonBlock(
                requirement.getId(),
                requirement.getSchoolClass().getClassId(),
                subject.getId(),
                teacher.getId(),
                joint.getId(),
                subject.getSubjectName(),
                joint.getSubjectType(),
                requirement.getTimePreference(),
                length,
                sequence,
                electiveStudentIds == null ? Set.of() : Set.copyOf(electiveStudentIds));
    }

    boolean isElective() {
        return subjectType == SubjectType.ELECTIVE;
    }
}
