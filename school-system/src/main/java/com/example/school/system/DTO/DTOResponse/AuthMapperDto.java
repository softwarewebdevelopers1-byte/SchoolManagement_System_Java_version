package com.example.school.system.DTO.DTOResponse;

import org.springframework.stereotype.Service;

import com.example.school.system.DTO.ClassDto;
import com.example.school.system.DTO.TeacherProfileDto;
import com.example.school.system.DTO.UserDto;
import com.example.school.system.models.SchoolClass;
import com.example.school.system.models.TeacherProfile;
import com.example.school.system.models.Users;

@Service
public class AuthMapperDto {
    public LoginResponse toLoginResponse(String token, Users user) {
        return new LoginResponse(token, toUserDto(user));
    }

    public UserDto toUserDto(Users user) {
        return UserDto.builder().userId(user.getId()).email(user.getEmail()).roles(user.getRoles())
                .schoolId(user.getSchool().getId())
                .classGrade(user.getTeacherProfile().getSchoolClass().getClassGrade().toString())
                .classStream(user.getTeacherProfile().getSchoolClass().getClassStream())
                .teacherProfileDto(
                        user.getTeacherProfile() == null ? null : toTeacherProfileDto(user.getTeacherProfile()))
                .build();
    }

    private TeacherProfileDto toTeacherProfileDto(TeacherProfile teacherProfile) {
        return TeacherProfileDto.builder().firstName(teacherProfile.getFirstName())
                .lastName(teacherProfile.getLastName())
                .classDto(teacherProfile.getSchoolClass() != null ? toClassDto(teacherProfile.getSchoolClass()) : null).teacherProfileId(teacherProfile.getTeacher()!=null?teacherProfile.getId():null)
                .build();
    }

    private ClassDto toClassDto(SchoolClass schoolClass) {
        return new ClassDto(schoolClass.getClassId(), schoolClass.getClassStream(), schoolClass.getClassGrade());
    }
}
