package com.example.school.system.DTO;

import jakarta.validation.constraints.Email;

public record UserUpdateDTO(@Email(message = "Invalid email") String email, String password) {

}
