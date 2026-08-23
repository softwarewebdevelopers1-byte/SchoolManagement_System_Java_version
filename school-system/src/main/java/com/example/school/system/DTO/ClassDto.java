package com.example.school.system.DTO;

import java.util.UUID;

import lombok.Builder;

@Builder
public record ClassDto(UUID id, String stream, Integer classGrade) {

}
