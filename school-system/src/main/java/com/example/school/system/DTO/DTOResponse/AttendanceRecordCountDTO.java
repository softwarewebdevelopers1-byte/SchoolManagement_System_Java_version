package com.example.school.system.DTO.DTOResponse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Setter
@Getter
@AllArgsConstructor
public class AttendanceRecordCountDTO {
    private Long present;
    private Long absent;
    private Long total;
    private Double percentage;
}