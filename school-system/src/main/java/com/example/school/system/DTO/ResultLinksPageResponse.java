package com.example.school.system.DTO;

import java.util.List;

public record ResultLinksPageResponse(
        List<ResultLinkResponse> content,
        int number,
        int size,
        long totalElements,
        int totalPages) {
}
