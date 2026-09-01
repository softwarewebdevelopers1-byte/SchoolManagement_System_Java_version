package com.example.school.system.DTO.timetable;

import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonAlias;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SchoolBreakRequest(
        @JsonAlias({ "label" }) @NotBlank String name,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime) {
}
