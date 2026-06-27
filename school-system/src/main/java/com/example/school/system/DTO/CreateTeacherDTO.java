package com.example.school.system.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateTeacherDTO(
                @NotBlank(message = "first name is missing") String firstName,
                @NotBlank(message = "last name is missing") String lastName,
                @NotBlank(message = "school name is missing") String schoolName,
                @NotBlank(message = "email is missing") 
                @Email
                String email,
                @NotBlank(message = "password is missing") 
                String password) {

}
