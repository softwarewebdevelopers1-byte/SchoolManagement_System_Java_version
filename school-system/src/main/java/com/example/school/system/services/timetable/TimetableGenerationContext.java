package com.example.school.system.services.timetable;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.example.school.system.models.School;
import com.example.school.system.models.SchoolSettings;
import com.example.school.system.models.SubjectJoint;
import com.example.school.system.models.SubjectRequirement;

public record TimetableGenerationContext(
        School school,
        SchoolSettings settings,
        List<SubjectRequirement> requirements,
        List<GeneratedSlot> weeklySlots,
        Map<UUID, SubjectJoint> subjectJointsById) {

    public GeneratedSlot slot(DayOfWeek dayOfWeek, Integer periodNumber) {
        return weeklySlots.stream()
                .filter(slot -> slot.dayOfWeek() == dayOfWeek && slot.periodNumber().equals(periodNumber))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Generated slot not found"));
    }

    public SubjectJoint subjectJoint(UUID subjectJointId) {
        var joint = subjectJointsById.get(subjectJointId);
        if (joint == null) {
            throw new IllegalArgumentException("Subject allocation not found in generation context");
        }
        return joint;
    }
}
