package com.example.school.system.services;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.DTO.GetAllStudentsDTO;
import com.example.school.system.DTO.GetStudentsOfSpecificClass;
import com.example.school.system.DTO.pagination.PageResponse;
import com.example.school.system.DTO.student.StudentSummaryDTO;
import com.example.school.system.projection.StudentsLoaded;
import com.example.school.system.repository.StudentRepository;
import com.example.school.system.repository.StudentSubjectSelectionRepo;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.types.UserRoles;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class GetStudentsService {
        private final StudentRepository studentRepository;
        private final UserRepository userRepository;
        private final StudentSubjectSelectionRepo studentSubjectSelectionRepo;

        // BEFORE: 1 query for existence + 1 page query + N+1 for enrollments
        // AFTER:  1 page query + 1 batched enrollment query
        @Transactional(readOnly = true)
        public PageResponse<StudentSummaryDTO> getStudentByClass(GetStudentsOfSpecificClass schoolClassDTO, int page, int size) {
                size = Math.min(size, 100);
                Pageable pageable = PageRequest.of(page, size, Sort.by("studentFullName").ascending());

                // Query 1: Paginated student summaries (projection, no entity)
                Page<StudentSummaryDTO> studentPage = studentRepository.findSummariesByClassId(
                                schoolClassDTO.classId(), pageable);

                // Query 2: Batched enrollments for the class (flat pairs, zero Cartesian product)
                List<Object[]> enrollmentPairs = studentSubjectSelectionRepo.findEnrollmentPairsByClassId(
                                schoolClassDTO.classId());

                // Merge in memory
                Map<java.util.UUID, List<java.util.UUID>> enrollmentMap = enrollmentPairs.stream()
                                .collect(Collectors.groupingBy(
                                                arr -> (java.util.UUID) arr[0],
                                                Collectors.mapping(arr -> (java.util.UUID) arr[1], Collectors.toList())));

                List<StudentSummaryDTO> enriched = studentPage.getContent().stream()
                                .map(dto -> {
                                        List<java.util.UUID> subjects = enrollmentMap.getOrDefault(
                                                        dto.studentId(), List.of());
                                        return dto;
                                })
                                .toList();

                return new PageResponse<>(
                                enriched,
                                studentPage.getNumber(),
                                studentPage.getSize(),
                                studentPage.getTotalElements(),
                                studentPage.getTotalPages());
        }

        @Transactional(readOnly = true)
        public PageResponse<StudentSummaryDTO> getAllStudents(GetAllStudentsDTO getAllStudentsDTO, int page, int size) {
                Pageable pageable = PageRequest.of(page, size, Sort.by("fullName").ascending());
                Page<StudentsLoaded> studentPage = userRepository.findLiveStudentsBySchoolIdWithRole(
                                getAllStudentsDTO.schoolId(),
                                UserRoles.STUDENT,
                                pageable);

                List<StudentSummaryDTO> content = studentPage.getContent().stream()
                                .map(s -> new StudentSummaryDTO(
                                                s.getUserId(),
                                                s.getFullName(),
                                                s.getAdm(),
                                                s.getEmail(),
                                                s.getPhoneNumber(),
                                                s.getGuardianName(),
                                                s.getGender(),
                                                s.getStatus(),
                                                null,
                                                s.getClassGrade(),
                                                s.getClassStream(),s.getEnrolledSubjects()))
                                .toList();

                return new PageResponse<>(
                                content,
                                studentPage.getNumber(),
                                studentPage.getSize(),
                                studentPage.getTotalElements(),
                                studentPage.getTotalPages());
        }

        @Transactional(readOnly = true)
        public PageResponse<StudentSummaryDTO> getAllExitedStudents(GetAllStudentsDTO getAllStudentsDTO, int page, int size) {
                Pageable pageable = PageRequest.of(page, size, Sort.by("fullName").ascending());
                Page<StudentsLoaded> studentPage = userRepository.findExitedStudentsBySchoolIdWithRole(
                                getAllStudentsDTO.schoolId(),
                                UserRoles.STUDENT,
                                pageable);

                List<StudentSummaryDTO> content = studentPage.getContent().stream()
                                .map(s -> new StudentSummaryDTO(
                                                s.getUserId(),
                                                s.getFullName(),
                                                s.getAdm(),
                                                s.getEmail(),
                                                s.getPhoneNumber(),
                                                s.getGuardianName(),
                                                s.getGender(),
                                                s.getStatus(),
                                                null,
                                                s.getClassGrade(),
                                                s.getClassStream(),s.getEnrolledSubjects()))
                                .toList();

                return new PageResponse<>(
                                content,
                                studentPage.getNumber(),
                                studentPage.getSize(),
                                studentPage.getTotalElements(),
                                studentPage.getTotalPages());
        }
}
