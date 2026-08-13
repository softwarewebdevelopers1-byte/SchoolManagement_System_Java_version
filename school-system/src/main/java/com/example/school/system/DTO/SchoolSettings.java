package com.example.school.system.DTO;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class SchoolSettings {
    private String schoolName;
    private String schoolEmail;
    private String motto;
    private String schoolAddress;
    private String phoneNumber;
}
