package com.example.school.system.DTO;

import java.util.UUID;
import com.example.school.system.types.SubjectType;

public record UpdateSubjectJoint(UUID subjectJointId, SubjectType subjectType, String electiveCode) {
}
