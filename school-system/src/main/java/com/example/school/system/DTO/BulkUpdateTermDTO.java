package com.example.school.system.DTO;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class BulkUpdateTermDTO {
    @NotNull(message = "term is required")
    private Integer term;
    @NotNull(message = "year is required")
    private Integer year;
    private String examType;
}