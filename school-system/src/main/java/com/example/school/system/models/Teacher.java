package com.example.school.system.models;

import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;

public class Teacher {
    @Column(name = "first_name")
    @NotBlank(message = "First name is missing")
    String firstName;

    @Column(name = "last_name")
    @NotBlank(message = "Last name is missing")
    String lastName;

    @Column(name = "available_connections")
    Integer connections = 6;
}
