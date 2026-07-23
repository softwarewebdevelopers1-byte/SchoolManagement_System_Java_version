package com.example.school.system.DTO;

import java.util.UUID;

public record MarkInputDTO(
        UUID studentId,
        Integer cat1,
        Integer cat2,
        Integer cat3,
        Integer exam) {

}
