package com.example.school.system.projection;

import java.util.UUID;
import lombok.Builder;

@Builder
public record ClassHeaderProjection(
        UUID classId,
        Integer classGrade,
        String classStream,
        boolean completed
) {
    public UUID getClassId() { return classId; }
    public Integer getClassGrade() { return classGrade; }
    public String getClassStream() { return classStream; }
    public boolean isCompleted() { return completed; }
}
