package com.example.school.system.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.example.school.system.error.ResultAccessExpiredException;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.DTO.GradingClassStudents;
import com.example.school.system.DTO.ResultPublicationRequest;
import com.example.school.system.DTO.ResultPublicationResponse;
import com.example.school.system.models.ResultAccess;
import com.example.school.system.models.MarksRow;
import com.example.school.system.models.MarksSheet;
import com.example.school.system.models.GradingScale;
import com.example.school.system.models.SchoolClass;
import com.example.school.system.models.ClassTermResults;
import com.example.school.system.models.ExamSettings;
import com.example.school.system.models.School;
import com.example.school.system.models.SchoolSettings;
import com.example.school.system.models.Subject;
import com.example.school.system.models.SubjectJoint;
import com.example.school.system.models.StudentProfile;
import com.example.school.system.DTO.DTOResponse.AuthenticatedUserContext;
import com.example.school.system.DTO.UserDto;
import com.example.school.system.projection.PublicResultRow;
import com.example.school.system.projection.ClassHeaderProjection;
import com.example.school.system.repository.ClassTermResultsRepo;
import com.example.school.system.repository.MarksSheetRepo;
import com.example.school.system.repository.PublicResultsRepository;
import com.example.school.system.repository.ResultAccessRepository;
import com.example.school.system.repository.ResultSmsNotificationRepository;
import com.example.school.system.repository.SchoolClassRepository;
import com.example.school.system.repository.SchoolRepository;
import com.example.school.system.repository.StudentRepository;
import org.springframework.context.ApplicationEventPublisher;
import com.example.school.system.types.ExamType;
import com.example.school.system.types.MarksSheetStatus;

@ExtendWith(MockitoExtension.class)
class ResultAccessServiceTest {
    @Mock
    private ResultAccessRepository accessRepository;
    @Mock
    private ClassTermResultsRepo classTermResultsRepo;
    @Mock
    private MarksSheetRepo marksSheetRepo;
    @Mock
    private PublicResultsRepository publicResultsRepository;
    @Mock
    private SchoolClassRepository schoolClassRepository;
    @Mock
    private SchoolRepository schoolRepository;
    @Mock
    private AuthenticatedUserService authenticatedUserService;
    @Mock
    private GradingService gradingService;
    @Mock
    private RankingService rankingService;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private ResultSmsNotificationRepository resultSmsNotificationRepository;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    private ResultAccessService service;

    @BeforeEach
    void setUp() {
        service = new ResultAccessService(
                accessRepository,
                classTermResultsRepo,
                marksSheetRepo,
                publicResultsRepository,
                schoolClassRepository,
                schoolRepository,
                authenticatedUserService,
                gradingService,
                rankingService,
                studentRepository,
                resultSmsNotificationRepository,
                eventPublisher);
    }

    private void stubCurrentAcademicCycle(UUID schoolId) {
        ExamSettings examSettings = new ExamSettings();
        examSettings.setExamType(ExamType.ENDTERM);
        SchoolSettings schoolSettings = new SchoolSettings();
        schoolSettings.setAcademicYear("2026");
        schoolSettings.setCurrentSchoolTerm(1);
        schoolSettings.setExamSettings(examSettings);
        School school = new School();
        school.setSchoolSettings(schoolSettings);
        when(schoolRepository.findByIdWithSettings(schoolId)).thenReturn(Optional.of(school));
    }

    @Test
    void returnsOnlyClassesWhoseEntireResultSetIsPublished() {
        UUID schoolId = UUID.randomUUID();
        UUID publishedClassId = UUID.randomUUID();
        UUID unpublishedClassId = UUID.randomUUID();
        when(authenticatedUserService.currentUser())
                .thenReturn(new AuthenticatedUserContext(
                        UserDto.builder().schoolId(schoolId).build(), List.of()));
        stubCurrentAcademicCycle(schoolId);
        when(schoolClassRepository.findClassHeadersBySchoolId(schoolId)).thenReturn(List.of(
                new ClassHeaderProjection(publishedClassId, 1, "A", false),
                new ClassHeaderProjection(unpublishedClassId, 1, "B", false)));
        when(classTermResultsRepo.findPublicationCounts(
                List.of(publishedClassId, unpublishedClassId), "2026", 1, ExamType.ENDTERM))
                .thenReturn(List.of(
                        new Object[] { publishedClassId, 2L, 2L },
                        new Object[] { unpublishedClassId, 2L, 1L }));

        var status = service.getPublicationStatus();

        assertEquals(java.util.Set.of(publishedClassId), status.publishedClassIds());
        assertEquals("2026", status.academicYear());
        assertEquals(1, status.term());
        assertEquals(ExamType.ENDTERM, status.examType());
    }

    @Test
    void rejectsUnknownToken() {
        when(accessRepository.findByTokenHash(org.mockito.ArgumentMatchers.anyString()))
                .thenReturn(Optional.empty());

        assertThrows(SchoolResourceNotFoundExceptionHandler.class,
                () -> service.getPublishedResults("not-a-token"));
    }

    @Test
    void rejectsExpiredTokenWithGoneException() {
        ResultAccess access = access("expired-token");
        access.setExpiresAt(Instant.now().minusSeconds(1));
        when(accessRepository.findByTokenHash(org.mockito.ArgumentMatchers.anyString()))
                .thenReturn(Optional.of(access));

        assertThrows(ResultAccessExpiredException.class,
                () -> service.getPublishedResults("expired-token"));
    }

    @Test
    void renewsExpiredLinkAndReplacesItsToken() {
        UUID accessId = UUID.randomUUID();
        UUID schoolId = UUID.randomUUID();
        UUID adminId = UUID.randomUUID();
        ResultAccess access = access("expired-token");
        access.setId(accessId);
        access.setExpiresAt(Instant.now().minusSeconds(1));
        String oldHash = access.getTokenHash();

        ClassTermResults publication = new ClassTermResults();
        publication.setPublished(true);
        when(authenticatedUserService.currentUser())
                .thenReturn(new AuthenticatedUserContext(UserDto.builder().schoolId(schoolId).build(), List.of()));
        when(authenticatedUserService.currentUserId()).thenReturn(adminId);
        when(accessRepository.findByIdForSchool(accessId, schoolId)).thenReturn(Optional.of(access));
        when(classTermResultsRepo.findByStudentProfile_IdAndAcademicYearAndCurrentSchoolTermAndExamType(
                access.getStudentProfile().getId(), "2026", 2, ExamType.ENDTERM))
                .thenReturn(Optional.of(publication));
        when(accessRepository.save(access)).thenReturn(access);

        var response = service.renewLink(accessId);

        assertEquals("ACTIVE", response.status());
        assertNotEquals(oldHash, access.getTokenHash());
        assertNotNull(access.getEncryptedToken());
        assertEquals(adminId, access.getRenewedBy());
        assertNotNull(response.resultsUrl());
    }

    @Test
    void rejectsRenewalOfAnActiveLink() {
        UUID accessId = UUID.randomUUID();
        UUID schoolId = UUID.randomUUID();
        ResultAccess access = access("active-token");
        access.setId(accessId);
        access.setExpiresAt(Instant.now().plusSeconds(60));
        access.setEncryptedToken("existing-encrypted-token");

        when(authenticatedUserService.currentUser())
                .thenReturn(new AuthenticatedUserContext(UserDto.builder().schoolId(schoolId).build(), List.of()));
        when(accessRepository.findByIdForSchool(accessId, schoolId)).thenReturn(Optional.of(access));

        assertThrows(com.example.school.system.error.SchoolResourceExistsExceptionHandler.class,
                () -> service.renewLink(accessId));
    }

    @Test
    void repairsAnActiveLinkWithoutRecoverableToken() {
        UUID accessId = UUID.randomUUID();
        UUID schoolId = UUID.randomUUID();
        ResultAccess access = access("active-token");
        access.setId(accessId);
        access.setExpiresAt(Instant.now().plusSeconds(60));
        access.setEncryptedToken(null);

        ClassTermResults publication = new ClassTermResults();
        publication.setPublished(true);
        when(authenticatedUserService.currentUser())
                .thenReturn(new AuthenticatedUserContext(UserDto.builder().schoolId(schoolId).build(), List.of()));
        when(authenticatedUserService.currentUserId()).thenReturn(UUID.randomUUID());
        when(accessRepository.findByIdForSchool(accessId, schoolId)).thenReturn(Optional.of(access));
        when(classTermResultsRepo.findByStudentProfile_IdAndAcademicYearAndCurrentSchoolTermAndExamType(
                access.getStudentProfile().getId(), "2026", 2, ExamType.ENDTERM))
                .thenReturn(Optional.of(publication));
        when(accessRepository.save(access)).thenReturn(access);

        var response = service.renewLink(accessId);

        assertEquals("ACTIVE", response.status());
        assertNotNull(response.resultsUrl());
        assertNotNull(access.getEncryptedToken());
    }

    @Test
    void mapsOnlyThePublishedStudentRowsToParentResponse() {
        ResultAccess access = access("valid-token");
        when(accessRepository.findByTokenHash(org.mockito.ArgumentMatchers.anyString()))
                .thenReturn(Optional.of(access));

        PublicResultRow row = org.mockito.Mockito.mock(PublicResultRow.class);
        UUID studentId = UUID.randomUUID();
        UUID subjectId = UUID.randomUUID();
        access.getStudentProfile().setId(studentId);
        when(row.getStudentId()).thenReturn(studentId.toString().replace("-", ""));
        when(row.getStudentName()).thenReturn("student");
        when(row.getStudentAdm()).thenReturn("ADM001");
        when(row.getClassGrade()).thenReturn(8);
        when(row.getClassStream()).thenReturn("north");
        when(row.getSchoolName()).thenReturn("school");
        when(row.getAcademicYear()).thenReturn("2026");
        when(row.getTerm()).thenReturn(2);
        when(row.getExamType()).thenReturn("ENDTERM");
        when(row.getOverallGrade()).thenReturn("EE1");
        when(row.getOverallTotalMarks()).thenReturn(78d);
        when(row.getPosition()).thenReturn(1);
        when(row.getTotalStudents()).thenReturn(10);
        when(row.getSubjectId()).thenReturn(subjectId.toString().replace("-", ""));
        when(row.getSubjectName()).thenReturn("Mathematics");
        when(row.getScore()).thenReturn(78);
        when(row.getSubjectGrade()).thenReturn("EE1");
        when(row.getPoints()).thenReturn(8d);
        when(row.getTeacherName()).thenReturn("teacher");
        when(publicResultsRepository.findPublishedResults(
                studentId, "2026", 2, ExamType.ENDTERM.name(), null)).thenReturn(List.of(row));

        var response = service.getPublishedResults("valid-token");

        assertEquals(studentId, response.student().id());
        assertEquals(1, response.subjects().size());
        assertEquals("Mathematics", response.subjects().get(0).name());
        assertEquals(78d, response.summary().average());
    }

    @Test
    void resendNotificationIncludesPublishedExamMarksAndLink() {
        UUID accessId = UUID.randomUUID();
        UUID schoolId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();
        ResultAccess access = access("valid-token");
        access.setId(accessId);
        access.setEncryptedToken(ReflectionTestUtils.invokeMethod(service, "encryptToken", "valid-token"));
        ReflectionTestUtils.setField(service, "publicResultsUrl", "http://localhost:5173/results/");
        access.getStudentProfile().setId(studentId);
        access.getStudentProfile().setStudentFullName("Student");
        access.getStudentProfile().setPhoneNumber("+254700000001");
        ClassTermResults publication = new ClassTermResults();
        publication.setPublished(true);

        PublicResultRow row = org.mockito.Mockito.mock(PublicResultRow.class);
        when(row.getSubjectId()).thenReturn(UUID.randomUUID().toString().replace("-", ""));
        when(row.getSubjectName()).thenReturn("Mathematics");
        when(row.getScore()).thenReturn(78);
        when(authenticatedUserService.currentUser())
                .thenReturn(new AuthenticatedUserContext(
                        UserDto.builder().schoolId(schoolId).build(), List.of()));
        when(accessRepository.findByIdForSchool(accessId, schoolId)).thenReturn(Optional.of(access));
        when(classTermResultsRepo.findByStudentProfile_IdAndAcademicYearAndCurrentSchoolTermAndExamType(
                studentId, "2026", 2, ExamType.ENDTERM))
                .thenReturn(Optional.of(publication));
        when(publicResultsRepository.findPublishedResults(
                studentId, "2026", 2, ExamType.ENDTERM.name(), null))
                .thenReturn(List.of(row));
        when(resultSmsNotificationRepository.save(org.mockito.ArgumentMatchers.any()))
                .thenAnswer(invocation -> {
                    com.example.school.system.models.ResultSmsNotification notification =
                            invocation.getArgument(0);
                    notification.setId(UUID.randomUUID());
                    return notification;
                });

        service.resendResultNotification(accessId);

        org.mockito.ArgumentCaptor<com.example.school.system.models.ResultSmsNotification> notification =
                org.mockito.ArgumentCaptor.forClass(com.example.school.system.models.ResultSmsNotification.class);
        org.mockito.Mockito.verify(resultSmsNotificationRepository).save(notification.capture());
        String message = notification.getValue().getMessage();
        assertTrue(message.contains("Mathematics: 78%"));
        assertTrue(message.contains("2026 Term 2 ENDTERM"));
        assertTrue(message.contains("http://localhost:5173/results/valid-token"));
    }

    @Test
    void buildsResultsFromMarksBeforePublishingWhenNoResultsExist() {
        UUID schoolId = UUID.randomUUID();
        UUID classId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();
        UUID publisherId = UUID.randomUUID();
        ResultPublicationRequest request = new ResultPublicationRequest(classId);

        UserDto user = UserDto.builder().schoolId(schoolId).build();
        when(authenticatedUserService.currentUser())
                .thenReturn(new AuthenticatedUserContext(user, List.of()));
        stubCurrentAcademicCycle(schoolId);
        when(authenticatedUserService.currentUserId()).thenReturn(publisherId);
        when(schoolClassRepository.findByClassIdAndSchoolId(classId, schoolId))
                .thenReturn(Optional.of(new SchoolClass()));

        StudentProfile student = new StudentProfile();
        student.setId(studentId);
        MarksRow row = new MarksRow();
        row.setStudentProfile(student);
        row.setTotalMarks(78);
        row.setAverageMarksPercentage(78);
        Subject subject = new Subject();
        subject.setSubjectName("Mathematics");
        SubjectJoint subjectJoint = new SubjectJoint();
        subjectJoint.setSubject(subject);
        MarksSheet sheet = new MarksSheet();
        sheet.setMarks(List.of(row));
        sheet.setSubjectJoint(subjectJoint);
        when(marksSheetRepo.findAllByClassIdAndAcademicYearAndCurrentSchoolTermAndExamTypeAndStatus(
                classId, "2026", 1, ExamType.ENDTERM, MarksSheetStatus.SUBMITTED))
                .thenReturn(List.of(sheet));
        GradingScale gradingScale = new GradingScale();
        when(gradingService.getOrCreateDefaultScale(schoolId)).thenReturn(gradingScale);

        ClassTermResults generated = new ClassTermResults();
        generated.setStudentProfile(student);
        when(classTermResultsRepo.findAllByClassIdAndAcademicYearAndCurrentSchoolTermAndExamType(
                classId, "2026", 1, ExamType.ENDTERM)).thenReturn(List.of(generated));
        ResultAccess activeAccess = new ResultAccess();
        activeAccess.setStudentProfile(student);
        activeAccess.setAcademicYear("2026");
        activeAccess.setCurrentSchoolTerm(1);
        activeAccess.setExamType(ExamType.ENDTERM);
        activeAccess.setExpiresAt(Instant.now().plusSeconds(3600));
        when(accessRepository.findAllByStudentProfileIdInAndAcademicYearAndCurrentSchoolTermAndExamType(
                List.of(studentId), "2026", 1, ExamType.ENDTERM))
                .thenReturn(List.of(), List.of(activeAccess));
        when(accessRepository.saveAll(org.mockito.ArgumentMatchers.anyList()))
                .thenAnswer(invocation -> invocation.getArgument(0));
        var studentContact = contact(studentId, "student", "+254700000001");
        org.mockito.Mockito.when(studentRepository.findContactsByIdIn(List.of(studentId)))
                .thenReturn(List.of(studentContact));
        org.mockito.Mockito.when(resultSmsNotificationRepository.saveAll(org.mockito.ArgumentMatchers.anyList()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ResultPublicationResponse response = service.publishResults(request);

        assertEquals(1, response.publishedStudents());
        assertEquals(false, response.previouslyPublished());
        org.mockito.Mockito.verify(rankingService).StudentClassRanking(
                new GradingClassStudents(classId, ExamType.ENDTERM, "2026", 1, gradingScale));
        org.mockito.Mockito.verify(classTermResultsRepo, org.mockito.Mockito.times(1)).saveAll(List.of(generated));
        org.mockito.ArgumentCaptor<List<com.example.school.system.models.ResultSmsNotification>> notifications =
                org.mockito.ArgumentCaptor.forClass(List.class);
        org.mockito.Mockito.verify(resultSmsNotificationRepository).saveAll(notifications.capture());
        String message = notifications.getValue().get(0).getMessage();
        org.junit.jupiter.api.Assertions.assertTrue(message.contains("Mathematics: 78%"));
        org.junit.jupiter.api.Assertions.assertTrue(message.contains("Full results: "));

        ResultPublicationResponse republishedResponse = service.publishResults(request);
        assertEquals(true, republishedResponse.previouslyPublished());
        assertEquals(1, republishedResponse.publishedStudents());
        assertEquals(0, republishedResponse.accessLinks().size());
        org.mockito.Mockito.verify(rankingService, org.mockito.Mockito.times(1)).StudentClassRanking(
                new GradingClassStudents(classId, ExamType.ENDTERM, "2026", 1, gradingScale));
        org.mockito.Mockito.verify(classTermResultsRepo, org.mockito.Mockito.times(1))
                .saveAll(List.of(generated));
        org.mockito.Mockito.verify(resultSmsNotificationRepository, org.mockito.Mockito.times(1))
                .saveAll(org.mockito.ArgumentMatchers.anyList());
    }

    @Test
    void rejectsPublicationWhenSubmittedMarksAreAbsent() {
        UUID schoolId = UUID.randomUUID();
        UUID classId = UUID.randomUUID();
        when(authenticatedUserService.currentUser())
                .thenReturn(new AuthenticatedUserContext(
                        UserDto.builder().schoolId(schoolId).build(), List.of()));
        stubCurrentAcademicCycle(schoolId);
        when(schoolClassRepository.findByClassIdAndSchoolId(classId, schoolId))
                .thenReturn(Optional.of(new SchoolClass()));
        when(marksSheetRepo.findAllByClassIdAndAcademicYearAndCurrentSchoolTermAndExamTypeAndStatus(
                classId, "2026", 1, ExamType.ENDTERM, MarksSheetStatus.SUBMITTED))
                .thenReturn(List.of());

        assertThrows(SchoolResourceNotFoundExceptionHandler.class,
                () -> service.publishResults(new ResultPublicationRequest(classId)));
        org.mockito.Mockito.verifyNoInteractions(rankingService);
    }

    private ResultAccess access(String rawToken) {
        ResultAccess access = new ResultAccess();
        access.setStudentProfile(new com.example.school.system.models.StudentProfile());
        access.getStudentProfile().setId(UUID.randomUUID());
        access.setAcademicYear("2026");
        access.setCurrentSchoolTerm(2);
        access.setExamType(ExamType.ENDTERM);
        String hash = ReflectionTestUtils.invokeMethod(service, "hashToken", rawToken);
        access.setTokenHash(hash);
        return access;
    }

    private com.example.school.system.projection.StudentContactProjection contact(
            UUID studentId, String name, String phoneNumber) {
        com.example.school.system.projection.StudentContactProjection contact =
                org.mockito.Mockito.mock(com.example.school.system.projection.StudentContactProjection.class);
        when(contact.getStudentId()).thenReturn(studentId);
        when(contact.getStudentName()).thenReturn(name);
        when(contact.getPhoneNumber()).thenReturn(phoneNumber);
        return contact;
    }
}
