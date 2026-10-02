package com.example.school.system.DTO;

import java.util.Set;
import java.util.UUID;

public record ResultPublicationStatusResponse(Set<UUID> publishedClassIds) {
}
