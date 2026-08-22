package com.example.school.system.services.admin;

import java.util.List;
import org.springframework.stereotype.Service;
import com.example.school.system.DTO.DTOResponse.SchoolDtoRes;
import com.example.school.system.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class GetAllSchools {
    private final SchoolRepository schoolRepo;

    public List<SchoolDtoRes> getAllSchools() {
        return schoolRepo.findAllSchoolSummaries().stream()
                .map(s -> SchoolDtoRes.builder()
                        .schoolId(s.id())
                        .schoolCode(s.schoolCode())
                        .schoolName(s.schoolName())
                        .build())
                .toList();
    }
}
