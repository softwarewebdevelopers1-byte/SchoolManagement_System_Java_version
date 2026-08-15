package com.example.school.system.DTO;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class GetClassSnapshot {
    String className;
    String classTeacherName;
    Integer studentsCount;
}
