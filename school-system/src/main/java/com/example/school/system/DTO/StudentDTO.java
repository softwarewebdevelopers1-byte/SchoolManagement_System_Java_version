package com.example.school.system.DTO;

import java.util.Date;

public record StudentDTO(Long adm, String fullName, Date Registration, String status, String PhoneNumber,String password) {

}
