package com.example.school.system.DTO.DTOResponse;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SchoolDtoRes {
    private String schoolName;
    private String schoolCode;
    private UUID schoolId;
    private Integer allUsers;
}
