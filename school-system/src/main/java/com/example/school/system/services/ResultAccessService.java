package com.example.school.system.services;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.DTO.ParentResultsResponse;
import com.example.school.system.DTO.ResultAccessRequest;
import com.example.school.system.DTO.ResultAccessResponse;
import com.example.school.system.DTO.ResultPublicationRequest;
import com.example.school.system.DTO.ResultPublicationResponse;
import com.example.school.system.error.ResultAccessExpiredException;
import com.example.school.system.error.SchoolResourceExistsExceptionHandler;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.ClassTermResults;
import com.example.school.system.models.MarksSheet;
import com.example.school.system.models.ResultAccess;
import com.example.school.system.models.StudentProfile;
import com.example.school.system.projection.PublicResultRow;
import com.example.school.system.repository.ClassTermResultsRepo;
import com.example.school.system.repository.MarksSheetRepo;
import com.example.school.system.repository.PublicResultsRepository;
import com.example.school.system.repository.ResultAccessRepository;
import com.example.school.system.repository.SchoolClassRepository;
import com.example.school.system.types.MarksSheetStatus;
import com.example.school.system.DTO.GradingClassStudents;
import com.example.school.system.services.AuthenticatedUserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ResultAccessService {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final Base64.Encoder TOKEN_ENCODER = Base64.getUrlEncoder().withoutPadding();

    private final ResultAccessRepository accessRepository;
    private final ClassTermResultsRepo classTermResultsRepo;
    private final MarksSheetRepo marksSheetRepo;
    private final PublicResultsRepository publicResultsRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final AuthenticatedUserService authenticatedUserService;
    private final GradingService gradingService;
    private final RankingService rankingService;

    @Value("${results.public-url:http://localhost:5173/results/}")
    private String publicResultsUrl;

    @Transactional
    public ResultAccessResponse createAccess(ResultAccessRequest request) {
        ClassTermResults publication = classTermResultsRepo
                .findByStudentProfile_IdAndAcademicYearAndCurrentSchoolTermAndExamType(
                        request.studentId(), request.academicYear(), request.term(), request.examType())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler(
                        "published results not found"));
        if (!publication.isPublished()) {
            throw new SchoolResourceNotFoundExceptionHandler("results have not been published");
        }

        ResultAccess existing = accessRepository
                .findByStudentProfileIdAndAcademicYearAndCurrentSchoolTermAndExamType(
                request.studentId(), request.academicYear(), request.term(), request.examType())
                .orElse(null);
        if (existing != null
                && existing.getRevokedAt() == null
                && (existing.getExpiresAt() == null || existing.getExpiresAt().isAfter(Instant.now()))) {
            throw new SchoolResourceExistsExceptionHandler("an active results link already exists");
        }

        String rawToken = generateToken();
        ResultAccess access = existing != null ? existing : new ResultAccess();
        if (existing != null) {
            existing.setRevokedAt(null);
        }
        StudentProfile student = publication.getStudentProfile();
        access.setStudentProfile(student);
        access.setAcademicYear(request.academicYear());
        access.setCurrentSchoolTerm(request.term());
        access.setExamType(request.examType());
        access.setTokenHash(hashToken(rawToken));
        access.setExpiresAt(request.expiresAt());
        ResultAccess saved = accessRepository.save(access);

        return new ResultAccessResponse(
                saved.getId(),
                student.getId(),
                rawToken,
                publicResultsUrl + rawToken,
                saved.getExpiresAt());
    }

    @Transactional
    public ResultPublicationResponse publishResults(ResultPublicationRequest request) {
        UUID schoolId = authenticatedUserService.currentUser().user().getSchoolId();
        schoolClassRepository.findByClassIdAndSchoolId(request.classId(), schoolId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("class not found"));

        List<MarksSheet> markSheets = marksSheetRepo
                .findAllByClassIdAndAcademicYearAndCurrentSchoolTermAndExamTypeAndStatus(
                        request.classId(), request.academicYear(), request.term(), request.examType(),
                        MarksSheetStatus.SUBMITTED);
        if (markSheets.isEmpty() || markSheets.stream()
                .noneMatch(sheet -> sheet.getMarks() != null && !sheet.getMarks().isEmpty())) {
            throw new SchoolResourceNotFoundExceptionHandler(
                    "no marks found for the selected class, academic year, term, and examination period");
        }

        rankingService.StudentClassRanking(new GradingClassStudents(
                request.classId(),
                request.examType(),
                request.academicYear(),
                request.term(),
                gradingService.getOrCreateDefaultScale(schoolId)));

        UUID publisherId = authenticatedUserService.currentUserId();
        List<ClassTermResults> results = classTermResultsRepo
                .findAllByClassIdAndAcademicYearAndCurrentSchoolTermAndExamType(
                        request.classId(), request.academicYear(), request.term(), request.examType());
        if (results.isEmpty()) {
            throw new SchoolResourceNotFoundExceptionHandler(
                    "results could not be built from the available marks");
        }

        Instant now = Instant.now();
        List<ResultAccessResponse> links = new java.util.ArrayList<>();
        List<UUID> studentIds = results.stream()
                .map(result -> result.getStudentProfile().getId())
                .toList();
        java.util.Map<UUID, ResultAccess> existingAccess = accessRepository
                .findAllByStudentProfileIdInAndAcademicYearAndCurrentSchoolTermAndExamType(
                        studentIds, request.academicYear(), request.term(), request.examType())
                .stream()
                .collect(java.util.stream.Collectors.toMap(
                        access -> access.getStudentProfile().getId(), access -> access, (first, ignored) -> first));
        List<ResultAccess> accessToSave = new java.util.ArrayList<>();
        for (ClassTermResults result : results) {
            result.setPublished(true);
            result.setPublishedAt(result.getPublishedAt() == null ? now : result.getPublishedAt());
            result.setPublishedBy(publisherId);

            ResultAccess access = existingAccess.get(result.getStudentProfile().getId());
            if (access != null
                    && access.getRevokedAt() == null
                    && (access.getExpiresAt() == null || access.getExpiresAt().isAfter(now))) {
                continue;
            }

            String rawToken = generateToken();
            if (access == null) {
                access = new ResultAccess();
            }
            access.setStudentProfile(result.getStudentProfile());
            access.setAcademicYear(request.academicYear());
            access.setCurrentSchoolTerm(request.term());
            access.setExamType(request.examType());
            access.setTokenHash(hashToken(rawToken));
            access.setExpiresAt(request.expiresAt());
            access.setRevokedAt(null);
            accessToSave.add(access);
            links.add(new ResultAccessResponse(
                    access.getId(),
                    result.getStudentProfile().getId(),
                    rawToken,
                    publicResultsUrl + rawToken,
                    access.getExpiresAt()));
        }
        List<ResultAccess> savedAccess = accessRepository.saveAll(accessToSave);
        for (int i = 0; i < links.size(); i++) {
            ResultAccessResponse link = links.get(i);
            ResultAccess saved = savedAccess.get(i);
            links.set(i, new ResultAccessResponse(
                    saved.getId(), link.studentId(), link.token(), link.url(), link.expiresAt()));
        }
        classTermResultsRepo.saveAll(results);
        return new ResultPublicationResponse(results.size(), links);
    }

    @Transactional
    public void revokeAccess(UUID accessId) {
        ResultAccess access = accessRepository.findById(accessId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("results link not found"));
        access.setRevokedAt(Instant.now());
        accessRepository.save(access);
    }

    @Transactional(readOnly = true)
    public ParentResultsResponse getPublishedResults(String rawToken) {
        ResultAccess access = accessRepository.findByTokenHash(hashToken(rawToken))
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("results link not found"));

        if (access.getRevokedAt() != null) {
            throw new SchoolResourceNotFoundExceptionHandler("results link not found");
        }
        if (access.getExpiresAt() != null && !access.getExpiresAt().isAfter(Instant.now())) {
            throw new ResultAccessExpiredException();
        }

        List<PublicResultRow> rows = publicResultsRepository.findPublishedResults(
                access.getStudentProfile().getId(),
                access.getAcademicYear(),
                access.getCurrentSchoolTerm(),
                access.getExamType().ordinal());
        if (rows.isEmpty()) {
            throw new SchoolResourceNotFoundExceptionHandler("published results not found");
        }

        PublicResultRow first = rows.get(0);
        List<ParentResultsResponse.SubjectResult> subjects = rows.stream()
                .filter(row -> row.getSubjectId() != null)
                .map(row -> new ParentResultsResponse.SubjectResult(
                        row.getSubjectId(),
                        row.getSubjectName(),
                        row.getScore(),
                        100,
                        row.getSubjectGrade(),
                        row.getPoints(),
                        blankToNull(row.getTeacherName()),
                        null))
                .toList();

        double average = subjects.stream()
                .map(ParentResultsResponse.SubjectResult::score)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0);
        int totalMarks = first.getOverallTotalMarks() == null
                ? subjects.stream().map(ParentResultsResponse.SubjectResult::score)
                        .filter(Objects::nonNull).mapToInt(Integer::intValue).sum()
                : first.getOverallTotalMarks().intValue();
        String termName = first.getAcademicYear() + " Term " + first.getTerm()
                + " (" + first.getExamType() + ")";

        return new ParentResultsResponse(
                new ParentResultsResponse.Student(
                        first.getStudentId(),
                        first.getStudentName(),
                        first.getStudentAdm(),
                        String.valueOf(first.getClassGrade()),
                        first.getClassGrade() + " " + first.getClassStream(),
                        null,
                        average,
                        first.getOverallGrade(),
                        first.getPosition(),
                        first.getTotalStudents()),
                new ParentResultsResponse.School(
                        first.getSchoolName(),
                        first.getSchoolEmail(),
                        first.getSchoolMotto(),
                        first.getSchoolPhone(),
                        null),
                new ParentResultsResponse.Term(
                        first.getAcademicYear() + "-" + first.getTerm() + "-" + first.getExamType(),
                        termName,
                        null,
                        null),
                subjects,
                new ParentResultsResponse.Summary(totalMarks, average, first.getOverallGrade()),
                new ParentResultsResponse.Attendance(0, 0, 0, 0),
                null,
                null,
                null);
    }

    private static String generateToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return TOKEN_ENCODER.encodeToString(bytes);
    }

    private static String hashToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new SchoolResourceNotFoundExceptionHandler("results link not found");
        }
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(rawToken.getBytes(StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder(64);
            for (byte value : digest) {
                result.append(String.format("%02x", value));
            }
            return result.toString();
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
