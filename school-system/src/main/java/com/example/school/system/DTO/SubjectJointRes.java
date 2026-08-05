package com.example.school.system.DTO;

import java.util.UUID;
import com.example.school.system.types.SubjectType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Setter
@Getter
public class SubjectJointRes {
    private UUID id;
    private String name;
    private SubjectType enrollmentMode;
    private String sharedSlotId;
}
