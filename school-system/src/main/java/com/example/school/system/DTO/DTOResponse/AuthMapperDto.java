package com.example.school.system.DTO.DTOResponse;

import org.springframework.stereotype.Service;
import com.example.school.system.projection.LoginView;
import com.example.school.system.DTO.ClassDto;
import com.example.school.system.DTO.TeacherProfileDto;
import com.example.school.system.DTO.UserDto;

@Service
public class AuthMapperDto {
    public LoginResponse toLoginResponse(String token, LoginView user,String email) {
        return new LoginResponse(token, toUserDto(user));
    }

    public UserDto toUserDto(LoginView user) {
        String term = user.getCurrentSchoolTerm() != null ? user.getCurrentSchoolTerm().toString() : "1";
        String year = user.getAcademicYear() != null ? user.getAcademicYear() : String.valueOf(java.time.Year.now().getValue());
        return UserDto.builder().term(term)
                .year(year)
                .examType(user.getExamType())
                .userId(user.getUserId()).email(user.getEmail()).roles(user.getRoles())
                .schoolId(user.getSchoolId())
            .classGrade(user.getClassGrade() != null ? user.getClassGrade().toString() : null)
                .classStream(user.getClassStream())
                .teacherProfileDto(TeacherProfileDto.builder().firstName(user.getFirstName())
                        .lastName(user.getLastName()).teacherProfileId(user.getTeacherId())
                        .classDto(ClassDto.builder().id(user.getClassId()).stream(user.getClassStream())
                                .classGrade(user.getClassGrade()).build())
                        .build())
                .build();
    }

    // private TeacherProfileDto toTeacherProfileDto(TeacherProfile teacherProfile) {
    //     return TeacherProfileDto.builder().firstName(teacherProfile.getFirstName())
    //             .lastName(teacherProfile.getLastName())
    //             .classDto(teacherProfile.getSchoolClass() != null ? toClassDto(teacherProfile.getSchoolClass()) : null)
    //             .teacherProfileId(teacherProfile.getTeacher() != null ? teacherProfile.getId() : null)
    //             .build();
    // }

    // private ClassDto toClassDto(SchoolClass schoolClass) {
    //     return new ClassDto(schoolClass.getClassId(), schoolClass.getClassStream(), schoolClass.getClassGrade());
    // }
}
