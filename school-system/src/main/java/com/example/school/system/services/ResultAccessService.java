package com.example.school.system.services;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.Map;
import java.util.ArrayList;
import java.util.stream.Collectors;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.DTO.ParentResultsResponse;
import com.example.school.system.DTO.ResultAccessRequest;
import com.example.school.system.DTO.ResultAccessResponse;
import com.example.school.system.DTO.ResultPublicationRequest;
import com.example.school.system.DTO.ResultPublicationResponse;
import com.example.school.system.DTO.ResultLinkResponse;
import com.example.school.system.DTO.ResultLinksPageResponse;
import com.example.school.system.error.ResultAccessExpiredException;
import com.example.school.system.error.SchoolResourceExistsExceptionHandler;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.ClassTermResults;
import com.example.school.system.models.GradeBand;
import com.example.school.system.models.MarksSheet;
import com.example.school.system.models.ResultAccess;
import com.example.school.system.models.StudentProfile;
import com.example.school.system.models.ResultSmsNotification;
import com.example.school.system.projection.StudentContactProjection;
import com.example.school.system.projection.PublicResultRow;
import com.example.school.system.repository.ClassTermResultsRepo;
import com.example.school.system.repository.MarksSheetRepo;
import com.example.school.system.repository.PublicResultsRepository;
import com.example.school.system.repository.ResultAccessRepository;
import com.example.school.system.repository.ResultSmsNotificationRepository;
import com.example.school.system.repository.StudentRepository;
import com.example.school.system.services.sms.events.ResultSmsNotificationEvent;
import com.example.school.system.types.ExamType;
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
    private final StudentRepository studentRepository;
    private final ResultSmsNotificationRepository resultSmsNotificationRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Value("${results.public-url:http://localhost:5173/results/}")
    private String publicResultsUrl;

    @Value("${results.token.encryption-key:${jwt.secret}}")
    private String tokenEncryptionKey = "local-test-key";

    @Value("${results.token.expiration:7d}")
    private Duration tokenExpiration = Duration.ofDays(7);

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
        access.setEncryptedToken(encryptToken(rawToken));
        access.setExpiresAt(effectiveExpiry(request.expiresAt()));
        ResultAccess saved = accessRepository.save(access);

        return new ResultAccessResponse(
                saved.getId(),
                student.getId(),
                rawToken,
                buildResultsUrl(rawToken),
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
            access.setEncryptedToken(encryptToken(rawToken));
            access.setExpiresAt(effectiveExpiry(request.expiresAt()));
            access.setRevokedAt(null);
            accessToSave.add(access);
            links.add(new ResultAccessResponse(
                    access.getId(),
                    result.getStudentProfile().getId(),
                    rawToken,
                    buildResultsUrl(rawToken),
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
        Map<UUID, StudentProfile> studentsById = results.stream()
                .collect(Collectors.toMap(
                        result -> result.getStudentProfile().getId(),
                        ClassTermResults::getStudentProfile,
                        (first, ignored) -> first));
        queueResultNotifications(request, links, studentIds, studentsById);
        return new ResultPublicationResponse(results.size(), links);
    }

    private void queueResultNotifications(ResultPublicationRequest request,
            List<ResultAccessResponse> links, List<UUID> studentIds,
            Map<UUID, StudentProfile> studentsById) {
        if (links.isEmpty()) {
            return;
        }
        Map<UUID, StudentContactProjection> contacts = studentRepository.findContactsByIdIn(studentIds).stream()
                .filter(contact -> contact.getPhoneNumber() != null && !contact.getPhoneNumber().isBlank())
                .collect(Collectors.toMap(StudentContactProjection::getStudentId, contact -> contact,
                        (first, ignored) -> first));
        java.util.Set<UUID> alreadyQueued = resultSmsNotificationRepository
                .findAllByStudentProfileIdInAndAcademicYearAndCurrentSchoolTermAndExamType(
                        studentIds, request.academicYear(), request.term(), request.examType())
                .stream()
                .map(notification -> notification.getStudentProfile().getId())
                .collect(Collectors.toSet());
        List<ResultSmsNotification> notifications = new ArrayList<>();
        for (ResultAccessResponse link : links) {
            if (alreadyQueued.contains(link.studentId())) {
                continue;
            }
            StudentContactProjection contact = contacts.get(link.studentId());
            if (contact == null) {
                continue;
            }
            ResultSmsNotification notification = new ResultSmsNotification();
            notification.setStudentProfile(studentsById.get(link.studentId()));
            notification.setAcademicYear(request.academicYear());
            notification.setCurrentSchoolTerm(request.term());
            notification.setExamType(request.examType());
            notification.setRecipientPhone(contact.getPhoneNumber().trim());
            notification.setMessage("Results for " + contact.getStudentName()
                    + " are published. View results: " + link.url());
            notifications.add(notification);
        }
        if (notifications.isEmpty()) {
            return;
        }
        List<ResultSmsNotification> saved = resultSmsNotificationRepository.saveAll(notifications);
        eventPublisher.publishEvent(new ResultSmsNotificationEvent(
                saved.stream().map(ResultSmsNotification::getId).toList()));
    }

    @Transactional
    public void revokeAccess(UUID accessId) {
        ResultAccess access = accessRepository.findById(accessId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("results link not found"));
        access.setRevokedAt(Instant.now());
        accessRepository.save(access);
    }

    @Transactional(readOnly = true)
    public ResultLinksPageResponse listLinks(int page, int size, String search, String status,
            String sortField, String sortDirection) {
        UUID schoolId = authenticatedUserService.currentUser().user().getSchoolId();
        int normalizedPage = Math.max(0, page);
        int normalizedSize = Math.min(Math.max(1, size), 100);
        String normalizedSearch = search == null || search.isBlank() ? null : search.trim();
        String normalizedStatus = status == null || status.isBlank() ? null : status.trim().toUpperCase();
        String property = switch (sortField == null ? "" : sortField) {
            case "student" -> "studentProfile.studentFullName";
            case "expiresAt" -> "expiresAt";
            case "status" -> "revokedAt";
            default -> "createdAt";
        };
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDirection)
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(normalizedPage, normalizedSize, Sort.by(direction, property));
        Page<ResultAccess> result = accessRepository.findAllForSchool(
                schoolId, normalizedSearch, normalizedStatus, pageable);
        return new ResultLinksPageResponse(
                result.getContent().stream().map(this::toLinkResponse).toList(),
                result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    @Transactional(readOnly = true)
    public ResultLinkResponse getLink(UUID accessId) {
        ResultAccess access = findSchoolAccess(accessId);
        return toLinkResponse(access);
    }

    @Transactional
    public ResultLinkResponse renewLink(UUID accessId) {
        ResultAccess access = findSchoolAccess(accessId);
        Instant now = Instant.now();
        if (access.getRevokedAt() != null) {
            throw new SchoolResourceNotFoundExceptionHandler("results link not found");
        }

        if (access.getEncryptedToken() != null
                && access.getExpiresAt() != null
                && access.getExpiresAt().isAfter(now)) {
            throw new SchoolResourceExistsExceptionHandler("this results link is still active");
        }

        ClassTermResults publication = classTermResultsRepo
                .findByStudentProfile_IdAndAcademicYearAndCurrentSchoolTermAndExamType(
                        access.getStudentProfile().getId(),
                        access.getAcademicYear(),
                        access.getCurrentSchoolTerm(),
                        access.getExamType())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("published results not found"));
        if (!publication.isPublished()) {
            throw new SchoolResourceNotFoundExceptionHandler("this result is not currently published");
        }

        String rawToken = generateToken();
        access.setTokenHash(hashToken(rawToken));
        access.setEncryptedToken(encryptToken(rawToken));
        access.setExpiresAt(effectiveExpiry(null));
        access.setRevokedAt(null);
        access.setRenewedAt(now);
        access.setRenewedBy(authenticatedUserService.currentUserId());
        return toLinkResponse(accessRepository.save(access));
    }

    @Transactional
    public void resendResultNotification(UUID accessId) {
        ResultAccess access = findSchoolAccess(accessId);
        if (access.getRevokedAt() != null
                || (access.getExpiresAt() != null && !access.getExpiresAt().isAfter(Instant.now()))) {
            throw new SchoolResourceNotFoundExceptionHandler("results link is not active");
        }
        ClassTermResults publication = classTermResultsRepo
                .findByStudentProfile_IdAndAcademicYearAndCurrentSchoolTermAndExamType(
                        access.getStudentProfile().getId(),
                        access.getAcademicYear(),
                        access.getCurrentSchoolTerm(),
                        access.getExamType())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("published results not found"));
        if (!publication.isPublished()) {
            throw new SchoolResourceNotFoundExceptionHandler("results have not been published");
        }
        String phoneNumber = access.getStudentProfile().getPhoneNumber();
        if (phoneNumber == null || phoneNumber.isBlank()) {
            throw new SchoolResourceNotFoundExceptionHandler("student has no registered guardian phone number");
        }

        ResultSmsNotification notification = new ResultSmsNotification();
        notification.setStudentProfile(access.getStudentProfile());
        notification.setAcademicYear(access.getAcademicYear());
        notification.setCurrentSchoolTerm(access.getCurrentSchoolTerm());
        notification.setExamType(access.getExamType());
        notification.setRecipientPhone(phoneNumber.trim());
        notification.setMessage("Results for " + access.getStudentProfile().getStudentFullName()
                + " are published. View results: " + toLinkResponse(access).resultsUrl());
        ResultSmsNotification saved = resultSmsNotificationRepository.save(notification);
        eventPublisher.publishEvent(new ResultSmsNotificationEvent(List.of(saved.getId())));
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

        UUID studentId = access.getStudentProfile().getId();
        List<ClassTermResults> publishedExams =
                classTermResultsRepo.findAllByStudentProfile_IdAndAcademicYearAndCurrentSchoolTermAndPublishedTrue(
                        studentId, access.getAcademicYear(), access.getCurrentSchoolTerm());
        ExamType previousExam = publishedExams.stream()
                .map(ClassTermResults::getExamType)
                .filter(exam -> exam != null && exam.ordinal() < access.getExamType().ordinal())
                .max(Comparator.comparingInt(Enum::ordinal))
                .orElse(null);

        List<PublicResultRow> rows = publicResultsRepository.findPublishedResults(
                studentId,
                access.getAcademicYear(),
                access.getCurrentSchoolTerm(),
                access.getExamType().name(),
                previousExam == null ? null : previousExam.name());
        if (rows.isEmpty()) {
            throw new SchoolResourceNotFoundExceptionHandler("published results not found");
        }

        PublicResultRow first = rows.get(0);
        List<ParentResultsResponse.SubjectResult> subjects = rows.stream()
                .filter(row -> row.getSubjectId() != null)
                .map(row -> new ParentResultsResponse.SubjectResult(
                        uuidFromHex(row.getSubjectId()),
                        row.getSubjectName(),
                        row.getScore(),
                        100,
                        row.getSubjectGrade(),
                        row.getPoints(),
                        blankToNull(row.getTeacherName()),
                        blankToNull(row.getRemarks()),
                        row.getPreviousScore(),
                        row.getScore() == null || row.getPreviousScore() == null
                                ? null
                                : row.getScore() - row.getPreviousScore()))
                .toList();

        double average = subjects.stream()
                .map(ParentResultsResponse.SubjectResult::score)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0);
        String overallGrade = calculateOverallGrade(first, average);
        int totalMarks = first.getOverallTotalMarks() == null
                ? subjects.stream().map(ParentResultsResponse.SubjectResult::score)
                        .filter(Objects::nonNull).mapToInt(Integer::intValue).sum()
                : first.getOverallTotalMarks().intValue();
        String termName = first.getAcademicYear() + " Term " + first.getTerm()
                + " (" + first.getExamType() + ")";

        return new ParentResultsResponse(
                new ParentResultsResponse.Student(
                        uuidFromHex(first.getStudentId()),
                        first.getStudentName(),
                        first.getStudentAdm(),
                        String.valueOf(first.getClassGrade()),
                        first.getClassGrade() + " " + first.getClassStream(),
                        null,
                        average,
                        overallGrade,
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
                        null,
                        access.getExamType().name(),
                        previousExam == null ? null : previousExam.name()),
                subjects,
                new ParentResultsResponse.Summary(totalMarks, average, overallGrade),
                new ParentResultsResponse.Attendance(0, 0, 0, 0),
                null,
                null,
                null);
    }

    private String calculateOverallGrade(PublicResultRow first, double average) {
        if (first.getSchoolId() == null) {
            return first.getOverallGrade();
        }
        List<GradeBand> bands = gradingService.getOrCreateDefaultScale(uuidFromHex(first.getSchoolId())).getBands();
        return bands.stream()
                .filter(band -> average >= band.getMinScore() && average <= band.getMaxScore())
                .map(GradeBand::getGrade)
                .findFirst()
                .orElse(first.getOverallGrade());
    }

    private static String generateToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return TOKEN_ENCODER.encodeToString(bytes);
    }

    private ResultAccess findSchoolAccess(UUID accessId) {
        UUID schoolId = authenticatedUserService.currentUser().user().getSchoolId();
        return accessRepository.findByIdForSchool(accessId, schoolId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("results link not found"));
    }

    private ResultLinkResponse toLinkResponse(ResultAccess access) {
        Instant now = Instant.now();
        String status = access.getRevokedAt() != null
                ? "REVOKED"
                : access.getExpiresAt() != null && !access.getExpiresAt().isAfter(now)
                        ? "EXPIRED"
                        : "ACTIVE";
        String url = access.getEncryptedToken() == null
                ? null
                : buildResultsUrl(decryptToken(access.getEncryptedToken()));
        StudentProfile student = access.getStudentProfile();
        String className = student.getSchoolClass() == null
                ? null
                : "Grade " + student.getSchoolClass().getClassGrade()
                        + (student.getSchoolClass().getClassStream() == null
                                ? ""
                                : " " + student.getSchoolClass().getClassStream());
        return new ResultLinkResponse(
                access.getId(),
                student.getId(),
                student.getStudentFullName(),
                student.getStudentAdm(),
                className,
                access.getAcademicYear(),
                access.getCurrentSchoolTerm(),
                access.getExamType().name(),
                status,
                url,
                access.getCreatedAt(),
                access.getExpiresAt(),
                access.getRenewedAt());
    }

    private String buildResultsUrl(String token) {
        String baseUrl = publicResultsUrl == null ? "" : publicResultsUrl.trim();
        while (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        if (!baseUrl.endsWith("/results")) {
            baseUrl += "/results";
        }
        return baseUrl + "/" + token;
    }

    private Instant effectiveExpiry(Instant requestedExpiry) {
        return requestedExpiry != null ? requestedExpiry : Instant.now().plus(tokenExpiration);
    }

    private String encryptToken(String rawToken) {
        try {
            byte[] iv = new byte[12];
            SECURE_RANDOM.nextBytes(iv);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, encryptionKey(), new GCMParameterSpec(128, iv));
            byte[] ciphertext = cipher.doFinal(rawToken.getBytes(StandardCharsets.UTF_8));
            return TOKEN_ENCODER.encodeToString(iv) + "." + TOKEN_ENCODER.encodeToString(ciphertext);
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to protect results link", exception);
        }
    }

    private String decryptToken(String encryptedToken) {
        try {
            String[] parts = encryptedToken.split("\\.", 2);
            if (parts.length != 2) {
                throw new IllegalStateException("Invalid protected results link");
            }
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, encryptionKey(),
                    new GCMParameterSpec(128, Base64.getUrlDecoder().decode(parts[0])));
            return new String(cipher.doFinal(Base64.getUrlDecoder().decode(parts[1])), StandardCharsets.UTF_8);
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to recover results link", exception);
        }
    }

    private SecretKeySpec encryptionKey() {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(tokenEncryptionKey.getBytes(StandardCharsets.UTF_8));
            return new SecretKeySpec(digest, "AES");
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
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

    private static UUID uuidFromHex(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String hex = value.replace("-", "").trim();
        if (hex.length() != 32) {
            throw new IllegalStateException("Invalid UUID returned for published results");
        }
        String formatted = hex.substring(0, 8) + "-" + hex.substring(8, 12) + "-"
                + hex.substring(12, 16) + "-" + hex.substring(16, 20) + "-"
                + hex.substring(20);
        return UUID.fromString(formatted);
    }
}
