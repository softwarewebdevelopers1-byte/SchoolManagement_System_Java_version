package com.example.school.system.DTO;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FetchSingleDayStudentAttendance(@NotNull(message = "Date must be provided") LocalDate date,
        @NotBlank(message = "student adm is required") String studentAdm) {

}
