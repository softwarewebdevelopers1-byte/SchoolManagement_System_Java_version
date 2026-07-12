package com.example.school.system.DTO.DTOResponse;

import java.util.List;

public record RecaptchaDTO(boolean success,
        double score, String action, List<String> errorCodes) {
}
