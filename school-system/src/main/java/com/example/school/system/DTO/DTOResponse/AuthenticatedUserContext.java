package com.example.school.system.DTO.DTOResponse;

import java.util.List;

import com.example.school.system.DTO.UserDto;

public record AuthenticatedUserContext(UserDto user, List<String> permissions) {
}
