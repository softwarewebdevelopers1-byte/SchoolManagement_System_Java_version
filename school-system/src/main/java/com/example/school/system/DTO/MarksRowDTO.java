package com.example.school.system.DTO;

import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MarksRowDTO {
    private UUID studentId;
    private String studentName;
    private String studentAdm;
    private Integer cat1;
    private Integer cat2;
    private Integer cat3;
    private Integer exam;
}
