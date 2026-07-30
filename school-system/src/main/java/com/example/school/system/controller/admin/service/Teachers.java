package com.example.school.system.controller.admin.service;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.school.system.DTO.TeacherProfileDto;
import com.example.school.system.DTO.UserDto;
import com.example.school.system.models.TeacherProfile;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.types.UserRoles;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class Teachers {
    private final UserRepository userRepository;

    public List<UserDto> getTeachers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return userRepository.findAllTeachers(UserRoles.STUDENT, pageable).stream()
                .map(t -> UserDto.builder().schoolId(t.getSchool().getId()).userId(t.getId()).email(t.getEmail())
                        .teacherProfileDto(toTeacherProfileDto(t.getTeacherProfile()))
                        .build())
                .toList();
    }

    private TeacherProfileDto toTeacherProfileDto(TeacherProfile teacherProfile) {
        return TeacherProfileDto.builder().firstName(teacherProfile.getFirstName())
                .lastName(teacherProfile.getLastName()).teacherProfileId(teacherProfile.getId()).build();
    }
}
