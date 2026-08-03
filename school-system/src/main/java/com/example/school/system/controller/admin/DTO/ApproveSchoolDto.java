package com.example.school.system.controller.admin.DTO;

import java.util.UUID;

import com.example.school.system.types.SchoolStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ApproveSchoolDto(@NotNull(message = "school id cannot be empty") UUID schoolId,
        @NotBlank(message = "school name cannot be empty") String schoolName,@NotNull(message = "school acceptance field cannot be empty") SchoolStatus schoolStatus) {

}
