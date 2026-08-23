package com.example.school.system.projection;

import java.util.UUID;

public interface CredentialsView {
    UUID getUserId();

    String getEmail();

    String getPassword();
}
