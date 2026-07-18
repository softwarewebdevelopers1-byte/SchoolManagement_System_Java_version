package com.example.school.system.services;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.DTO.CreateSchoolDTO;
import com.example.school.system.DTO.OtpCreationDTO;
import com.example.school.system.DTO.OtpValidationDTO;
import com.example.school.system.DTO.UpdateSchoolDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.error.SchoolResourceExistsExceptionHandler;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.error.SchoolResourceRestrictedException;
import com.example.school.system.models.School;
import com.example.school.system.models.SchoolSettings;
import com.example.school.system.repository.SchoolRepository;
import com.example.school.system.repository.SchoolSettingsRepository;
import com.example.school.system.security.jwt.JwtValidator;
import com.example.school.system.types.OtpPurpose;
import com.example.school.system.types.SchoolStatus;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SchoolService {
    private final SchoolSettingsRepository schoolSettingsRepository;
    private final SchoolRepository schoolRepository;
    private final OtpService otpService;
    private final RandomValuesService randomValues;
    private final JwtValidator jwtValidator;

    public SchoolApiResponse<?> getSchool(String code) {
        School schoolName = schoolRepository.findBySchoolCode(code)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("School not found"));
        StringBuilder schoolFoundName = new StringBuilder();
        schoolFoundName.append(schoolName.getSchoolName());
        return SchoolApiResponse.success(schoolFoundName, "school found");

    }

    @Transactional
    public SchoolApiResponse<?> registerSchool(CreateSchoolDTO schoolDto) {
        if (schoolRepository.existsBySchoolName(schoolDto.schoolName())
                || schoolRepository.existsByEmail(schoolDto.schoolEmail()))
            throw new SchoolResourceExistsExceptionHandler("school with that name or email already exists");

        School school = toSchool(schoolDto);
        StringBuilder code = new StringBuilder();
        code.append(randomValues.RandomValues(7));
        school.setSchoolCode(code.toString());

        school = schoolRepository.save(school);
        SchoolSettings settings = new SchoolSettings();
        settings.setSchool(school);
        schoolSettingsRepository.save(settings);
        code.insert(0, "Your school code:");
        code.insert(17, " ");
        return SchoolApiResponse.success(code, "School registered successfully");
    }

    private School toSchool(CreateSchoolDTO dto) {
        School school = new School();
        school.setSchoolName(dto.schoolName());
        school.setEmail(dto.schoolEmail());
        school.setAddress(dto.schoolAddress());
        school.setPhoneNumber(dto.phoneNumber());
        if (dto.motto() != null) {
            school.setSchoolMotto(dto.motto());
        }
        return school;
    }

    @Transactional
    public SchoolApiResponse<?> UpdateExistingSchool(UpdateSchoolDTO schoolData, String authHeader) {
        Claims userToken = jwtValidator.validateTokenIssued(authHeader);
        if (!userToken.get("school").equals(schoolData.schoolId().toString())) {
            throw new SchoolResourceRestrictedException("Forbidden");
        }
        System.out.println(userToken.get("school"));
        School schoolToUpdate = schoolRepository.findById(schoolData.schoolId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school with that Id does not exists"));
        if (!schoolToUpdate.getStatus().equals(SchoolStatus.ACTIVE)) {
            throw new SchoolResourceRestrictedException("school cannot be updated");
        }
        String schoolEmail = schoolData.schoolEmail();
        String schoolName = schoolData.schoolName();
        String schoolAddress = schoolData.schoolAddress();
        String phoneNumber = schoolData.phoneNumber();
        String schoolMotto = schoolData.motto();

        if (schoolEmail != null) {
            schoolEmail = schoolEmail.trim().toLowerCase();
            if (!schoolRepository.existsByEmail(schoolEmail) && !schoolEmail.equals(schoolToUpdate.getEmail()))
                schoolToUpdate.setEmail(schoolEmail);
        }
        if (schoolName != null) {
            schoolName = schoolName.trim().toLowerCase();
            if (!schoolName.equals(schoolToUpdate.getSchoolName())
                    && schoolRepository.existsBySchoolName(schoolData.schoolName())) {
                throw new SchoolResourceExistsExceptionHandler("School with that name already exists");
            }
            schoolToUpdate.setSchoolName(schoolName);

        }
        if (schoolAddress != null) {
            if (!schoolAddress.equals(schoolToUpdate.getAddress())) {
                schoolToUpdate.setAddress(schoolAddress);
            }
        }
        if (phoneNumber != null) {
            if (!phoneNumber.equals(schoolToUpdate.getPhoneNumber())) {
                schoolToUpdate.setPhoneNumber(phoneNumber);
            }
        }

        if (schoolMotto != null) {
            if (!schoolMotto.equals(schoolToUpdate.getSchoolMotto())) {
                schoolToUpdate.setSchoolMotto(schoolMotto);
            }
        }

        // String previousSchoolName = schoolToUpdate.getSchoolName();
        schoolRepository.save(schoolToUpdate);

        return SchoolApiResponse
                .success("Saved");
    }

    private void tokenValidator(UUID id, String authHeader) {
        Claims userToken = jwtValidator.validateTokenIssued(authHeader);
        if (!userToken.get("school").equals(id.toString())) {
            throw new SchoolResourceRestrictedException("Forbidden");
        }
    }

    public SchoolApiResponse<?> deleteRequestverifier(String authHeader, UUID id) {
        tokenValidator(id, authHeader);
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school not found"));
        OtpCreationDTO otpEmail = new OtpCreationDTO(school.getEmail());
        otpService.GenerateOtp(otpEmail, OtpPurpose.DELETE_SCHOOL);

        return SchoolApiResponse.success("OTP sent successfully");
    }

    // send otp first attach it to the frontend delete request
    public SchoolApiResponse<?> deleteSchool(OtpValidationDTO otpValidationDTO, String authHeader) {
        tokenValidator(otpValidationDTO.schoolId(), authHeader);
        School schoolFound = schoolRepository.findById(otpValidationDTO.schoolId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school with that id does not exist"));
        String otpValidationMessage = otpService.ValidateOtp(otpValidationDTO, OtpPurpose.DELETE_SCHOOL);
        schoolRepository.delete(schoolFound);
        return SchoolApiResponse.success(otpValidationMessage + " " + "and school deleted successfully");
    }
}
