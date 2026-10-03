package com.example.school.system.services;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.school.system.DTO.ClassAttendanceDTO;
import com.example.school.system.DTO.DTOResponse.AuthenticatedUserContext;
import com.example.school.system.DTO.UserDto;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.repository.AttendanceRecordRepository;
import com.example.school.system.repository.AttendanceSheetRepository;
import com.example.school.system.repository.SchoolClassRepository;
import com.example.school.system.repository.StudentRepository;
import com.example.school.system.models.AttendanceSheet;
import com.example.school.system.models.SchoolClass;
import com.example.school.system.models.StudentProfile;
import com.example.school.system.types.WholeAttendanceSheetStatus;

@ExtendWith(MockitoExtension.class)
class AttendanceTenantScopeTest {
    @Mock private AttendanceSheetRepository attendanceSheetRepository;
    @Mock private AttendanceRecordRepository attendanceRecordRepository;
    @Mock private SchoolClassRepository schoolClassRepository;
    @Mock private StudentRepository studentRepository;
    @Mock private AuthenticatedUserService authenticatedUserService;

    private AttendanceService service;

    @BeforeEach
    void setUp() {
        service = new AttendanceService(
                attendanceSheetRepository, attendanceRecordRepository, schoolClassRepository,
                studentRepository, authenticatedUserService);
    }

    @Test
    void refusesToCreateAnAttendanceSheetForAnotherSchool() {
        UUID foreignClassId = UUID.randomUUID();
        UUID schoolId = UUID.randomUUID();
        when(authenticatedUserService.currentUser()).thenReturn(new AuthenticatedUserContext(
                UserDto.builder().schoolId(schoolId).build(), List.of()));
        when(schoolClassRepository.findByClassIdAndSchoolId(foreignClassId, schoolId))
                .thenReturn(Optional.empty());

        assertThrows(SchoolResourceNotFoundExceptionHandler.class,
                () -> service.getOrCreateSheet(ClassAttendanceDTO.builder().classId(foreignClassId).build()));
        verify(schoolClassRepository, never()).findByClassId(foreignClassId);
        verify(attendanceSheetRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void loadingLockedSheetDoesNotSynchronizeNewlyEnrolledStudents() {
        UUID classId = UUID.randomUUID();
        UUID schoolId = UUID.randomUUID();
        SchoolClass schoolClass = org.mockito.Mockito.mock(SchoolClass.class);
        AttendanceSheet lockedSheet = org.mockito.Mockito.mock(AttendanceSheet.class);
        StudentProfile newlyEnrolledStudent = org.mockito.Mockito.mock(StudentProfile.class);
        when(authenticatedUserService.currentUser()).thenReturn(new AuthenticatedUserContext(
                UserDto.builder().schoolId(schoolId).build(), List.of()));
        when(schoolClassRepository.findByClassIdAndSchoolId(classId, schoolId))
                .thenReturn(Optional.of(schoolClass));
        when(attendanceSheetRepository.findBySchoolClassClassIdAndSchoolClassSchoolIdAndDate(
                org.mockito.ArgumentMatchers.eq(classId),
                org.mockito.ArgumentMatchers.eq(schoolId),
                org.mockito.ArgumentMatchers.any()))
                .thenReturn(Optional.of(lockedSheet));
        when(lockedSheet.getStatus()).thenReturn(WholeAttendanceSheetStatus.LOCKED);
        when(lockedSheet.getAttendanceRecords()).thenReturn(List.of());
        when(lockedSheet.getSchoolClass()).thenReturn(schoolClass);
        org.mockito.Mockito.lenient().when(schoolClass.getStudent())
                .thenReturn(List.of(newlyEnrolledStudent));
        when(schoolClass.getClassGrade()).thenReturn(4);
        when(schoolClass.getClassStream()).thenReturn("East");

        var result = service.getOrCreateSheet(ClassAttendanceDTO.builder().classId(classId).build());

        assertEquals(0, result.getRecords().size());
        verify(schoolClass, never()).getStudent();
        verify(attendanceSheetRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }
}
