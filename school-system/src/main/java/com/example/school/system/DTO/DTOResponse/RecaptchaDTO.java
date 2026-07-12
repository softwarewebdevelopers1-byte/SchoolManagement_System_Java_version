package com.example.school.system.DTO.DTOResponse;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class RecaptchaDTO {
    
    private boolean success;
    
    private String challenge_ts;
    
    private String hostname;
    
    private Double score;  // ✅ Use Double wrapper instead of double
    
    private String action;
    
    @JsonProperty("error-codes")
    private String[] errorCodes;
}