package com.example.school.system.controller.admin.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.school.system.DTO.TeacherProfileDto;
import com.example.school.system.DTO.UserDto;
import com.example.school.system.models.TeacherProfile;
import com.example.school.system.models.Users;
import com.example.school.system.repository.TeacherProfileRepository;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.types.UserRoles;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class Teachers {
    private final UserRepository userRepository;
    private final TeacherProfileRepository teacherProfileRepository;

    public List<UserDto> getTeachers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        List<Users> teachers = userRepository.findAllTeachers(UserRoles.STUDENT, pageable);
        List<UUID> teacherUserIds = teachers.stream().map(Users::getId).toList();
        Map<UUID, TeacherProfile> profilesByTeacherId = teacherProfileRepository.findAllByTeacherIdIn(teacherUserIds)
                .stream()
                .collect(Collectors.toMap(tp -> tp.getTeacher().getId(), Function.identity()));

        return teachers.stream()
                .map(t -> UserDto.builder()
                        .schoolId(t.getSchool() != null ? t.getSchool().getId() : null)
                        .userId(t.getId())
                        .email(t.getEmail())
                        .teacherProfileDto(toTeacherProfileDto(profilesByTeacherId.get(t.getId())))
                        .build())
                .toList();
    }

    private TeacherProfileDto toTeacherProfileDto(TeacherProfile teacherProfile) {
        if (teacherProfile == null) {
            return null;
        }
        return TeacherProfileDto.builder().firstName(teacherProfile.getFirstName())
                .lastName(teacherProfile.getLastName()).teacherProfileId(teacherProfile.getId()).build();
    }
}
