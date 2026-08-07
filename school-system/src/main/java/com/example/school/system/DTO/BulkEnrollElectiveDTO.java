package com.example.school.system.DTO;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class BulkEnrollElectiveDTO {
    private List<UUID> studentIds;
    private UUID subjectId;
    private Integer classGrade;
    private String classStream;
    @NotBlank(message = "action is required")
    private String action;
}