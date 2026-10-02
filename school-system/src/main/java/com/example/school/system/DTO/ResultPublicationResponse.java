package com.example.school.system.DTO;

import java.util.List;

public record ResultPublicationResponse(
        int publishedStudents,
        boolean previouslyPublished,
        List<ResultAccessResponse> accessLinks) {
}
