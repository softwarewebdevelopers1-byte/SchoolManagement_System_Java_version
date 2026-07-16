package com.example.school.system.DTO;

import jakarta.validation.constraints.NotBlank;

public record TeacherAddProfile(
        @NotBlank(message = "first name must not be blank") String firstName,
        @NotBlank(message = "last name must not be blank") String lastName) {

}
