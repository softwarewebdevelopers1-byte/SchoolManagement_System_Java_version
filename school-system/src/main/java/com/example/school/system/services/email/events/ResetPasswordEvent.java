package com.example.school.system.services.email.events;

public record ResetPasswordEvent(String email, String token) {

}
