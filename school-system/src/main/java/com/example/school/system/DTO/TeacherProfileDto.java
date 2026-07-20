package com.example.school.system.DTO;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Builder
public class TeacherProfileDto {
    private String firstName;
    private String lastName;
    private ClassDto classDto;
}
