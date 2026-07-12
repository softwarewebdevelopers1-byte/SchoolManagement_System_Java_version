package com.example.school.system.services;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.school.system.DTO.OtpCreationDTO;
import com.example.school.system.DTO.OtpValidationDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.error.InvalidTokenExceptionHandler;
import com.example.school.system.models.OTP;
import com.example.school.system.repository.OtpRepository;
import com.example.school.system.security.PasswordHashing;
import com.example.school.system.services.email.EmailSender;

@Service
public class OtpService {
    private OtpRepository otpRepository;
    private PasswordHashing otpHashing;
    private EmailSender emailSender;
    private RandomValuesService randomValuesService;

    public OtpService(OtpRepository otpRepository, EmailSender emailSender, PasswordHashing otpHashing,
            RandomValuesService randomValue) {
        this.emailSender = emailSender;
        this.otpRepository = otpRepository;
        this.otpHashing = otpHashing;
        this.randomValuesService = randomValue;
    }

    @Transactional
    public SchoolApiResponse<?> GenerateOtp(OtpCreationDTO otpDTO) {
        if (otpDTO.email() != null) {
            otpRepository.deleteByEmail(otpDTO.email().trim().toLowerCase());
        }
        String email = otpDTO.email().trim().toLowerCase();
        String randomValue = randomValuesService.RandomValues(4);
        otpRepository.save(toOtp(otpDTO, otpHashing.PasswordEncoder().encode(randomValue)));
        otpEmailSender(email, randomValue);
        System.out.println(randomValue);
        return SchoolApiResponse.success("OTP sent successfully");
    }

    private void otpEmailSender(String email, String data) {
        StringBuilder emailDetails = new StringBuilder();
        emailDetails
                .append("Your" + " " + "<strong style='font-size:18px;'>authentication</strong>" + " " + "code" + "\n");
        emailDetails.append("<b style='font-size:20px;'>");
        emailDetails.append(data);
        emailDetails.append("</b>");
        emailSender.SendEmail(email, emailDetails);
    }

    private OTP toOtp(OtpCreationDTO otpDTO, String randomValue) {
        OTP otp = new OTP();
        otp.setEmail(otpDTO.email());
        otp.setValue(randomValue);
        return otp;
    }

    public String ValidateOtp(OtpValidationDTO otpDTO) {
        OTP otpFound = otpRepository.findOneByEmail(otpDTO.email())
                .orElseThrow(() -> new InvalidTokenExceptionHandler("Invalid Otp"));
        System.out.println("the otp in the database" + otpFound.getValue());
        if (!otpHashing.PasswordEncoder().matches(otpDTO.value(), otpFound.getValue()) || otpFound.isUsed()) {
            throw new InvalidTokenExceptionHandler("Invalid Otp");
        }
        otpFound.setUsed(true);
        otpRepository.save(otpFound);
        if (otpFound.getExpirationTime().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenExceptionHandler("Invalid Otp");
        }
        return "OTP verified successfully";

    }
}
