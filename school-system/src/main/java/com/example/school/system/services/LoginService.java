package com.example.school.system.services;

import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.error.jwt.SchoolResourceLockedExceptionHandler;
import com.example.school.system.DTO.LoginUserDTO;
import com.example.school.system.DTO.DTOResponse.AuthMapperDto;
import com.example.school.system.DTO.DTOResponse.LoginResponse;
import com.example.school.system.projection.LoginData;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.security.PasswordHashing;
import com.example.school.system.types.AccountStatus;
import com.example.school.system.types.SchoolStatus;
import com.example.school.system.types.UserRoles;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LoginService {
    private final JwtCreationService jwtService;
    private final UserRepository userRepository;
    private final PasswordHashing passwordHashing;
    // private final RecaptchaService recaptchaService;
    private final AuthMapperDto authMapperDto;

    @Transactional(readOnly = true)
    public LoginResponse LoginUser(LoginUserDTO user) {
        String message = "Invalid email or password";

        LoginData userFound = userRepository.findLoginDataByEmail(user.email().trim().toLowerCase())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler(message));

        if (!passwordHashing.PasswordEncoder().matches(user.password(), userFound.getPassword())) {
            throw new SchoolResourceNotFoundExceptionHandler(message);
        }

        AccountStatus userStatus = userFound.getStatus();
        SchoolStatus schoolStatus = userFound.getSchoolStatus();

        Set<UserRoles> roles = Set.copyOf(userRepository.findRolesByUserId(userFound.getUserId()));
        userFound.setRoles(roles);

        boolean isSuperAdmin = roles.contains(UserRoles.SUPERADMIN);

        if (!isSuperAdmin && schoolStatus != SchoolStatus.ACTIVE) {
            throw new SchoolResourceLockedExceptionHandler("school is " + schoolStatus.toString().toLowerCase());
        }

        StringBuilder statusSender = new StringBuilder();
        if (userStatus.toString().contains("_")) {
            String[] userStatusSplitted = userStatus.toString().toLowerCase().split("_");
            statusSender.append(userStatusSplitted[0]);
            statusSender.append(" ");
            statusSender.append(userStatusSplitted[1]);
        } else {
            statusSender.append(userStatus.toString().toLowerCase());
        }

        if (!userStatus.equals(AccountStatus.ACTIVE)) {
            throw new SchoolResourceLockedExceptionHandler("Account is " + statusSender + " try again later");
        }

        var token = jwtService.GenerateToken(userFound);
        return authMapperDto.toLoginResponse(token, userFound, user.email());
    }
}
