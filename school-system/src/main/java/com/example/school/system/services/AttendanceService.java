package com.example.school.system.services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.DTO.ClassAttendanceDTO;
import com.example.school.system.DTO.FetchSingleDayStudentAttendance;
import com.example.school.system.DTO.LoadAttendaceSheetSpecificDate;
import com.example.school.system.DTO.StudentAttendanceDTO;
import com.example.school.system.DTO.DTOResponse.AttendanceRecordDTO;
import com.example.school.system.DTO.DTOResponse.AttendanceSheetDTO;
import com.example.school.system.DTO.DTOResponse.SingleDayStudentAttendanceRecord;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.error.jwt.SchoolResourceLockedExceptionHandler;
import com.example.school.system.models.AttendanceRecords;
import com.example.school.system.models.AttendanceSheet;
import com.example.school.system.models.SchoolClass;
import com.example.school.system.models.StudentProfile;
import com.example.school.system.repository.AttendanceRecordRepository;
import com.example.school.system.repository.AttendanceSheetRepository;
import com.example.school.system.repository.SchoolClassRepository;
import com.example.school.system.repository.StudentRepository;
import com.example.school.system.types.ClassAttendanceStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttendanceService {
        private final AttendanceSheetRepository attendanceSheetRepository;
        private final AttendanceRecordRepository attendanceRecordRepository;
        private final SchoolClassRepository schoolClassRepository;
        private final StudentRepository studentRepository;

        @Transactional
        public AttendanceSheetDTO getOrCreateSheet(ClassAttendanceDTO classAttendanceDTO) {
                SchoolClass schoolClass = schoolClassRepository.findById(classAttendanceDTO.classId())
                                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("class not found"));
                if (schoolClass.getTeacher() == null) {
                        throw new SchoolResourceLockedExceptionHandler("assign class teacher first");
                }
                if (!schoolClass.getTeacher().getId().equals(classAttendanceDTO.teacherId())) {
                        throw new SchoolResourceLockedExceptionHandler("You're not the class teacher");
                }
                LocalDate timeNow = LocalDate.now();
                AttendanceSheet sheet = attendanceSheetRepository.findBySchoolClassAndDate(schoolClass, timeNow)
                                .orElseGet(() -> createNewSheet(schoolClass, timeNow));
                return toAttendanceSheetDto(sheet);
        }

        private AttendanceSheetDTO toAttendanceSheetDto(AttendanceSheet sheet) {

                List<AttendanceRecordDTO> records = sheet.getAttendanceRecords().stream().map(r -> {
                        AttendanceRecordDTO recordDTO = AttendanceRecordDTO.builder()
                                        .studentName(r.getStudent().getStudentFullName()).status(r.getStatus()).build();
                        return recordDTO;
                }).toList();

                StringBuilder className = new StringBuilder();
                className.append(sheet.getSchoolClass().getClassGrade());
                className.append(" ");
                className.append(sheet.getSchoolClass().getClassStream());
                AttendanceSheetDTO sheetDTO = AttendanceSheetDTO.builder().sheetId(sheet.getId())
                                .className(className.toString())
                                .date(sheet.getDate()).records(records).build();
                return sheetDTO;
        }

        private AttendanceSheet createNewSheet(SchoolClass schoolClass, LocalDate date) {

                AttendanceSheet sheet = new AttendanceSheet();
                sheet.setSchoolClass(schoolClass);
                sheet.setDate(date);
                List<AttendanceRecords> records = schoolClass.getStudent().stream().map((s) -> {
                        AttendanceRecords r = new AttendanceRecords();
                        r.setStudent(s);
                        r.setSheet(sheet);
                        r.setStatus(ClassAttendanceStatus.PRESENT);
                        r.setDate(date);
                        return r;
                }).toList();
                sheet.setAttendanceRecords(records);
                return attendanceSheetRepository.save(sheet);
        }

        @Transactional
        public void updateStudentAttendance(StudentAttendanceDTO studentAttendanceDTO) {
                AttendanceRecords studentRecord = attendanceRecordRepository
                                .findById(studentAttendanceDTO.attendanceRecord())
                                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler(
                                                "attendance record for this student is missing"));
                studentRecord.setStatus(studentAttendanceDTO.status());
                attendanceRecordRepository.save(studentRecord);

        }

        @Transactional
        public SingleDayStudentAttendanceRecord getStudentSingleDayRecord(
                        FetchSingleDayStudentAttendance fetchSingleDayStudentAttendance) {
                dateValidator(fetchSingleDayStudentAttendance.date());

                StudentProfile student = studentRepository
                                .findByStudentAdm(fetchSingleDayStudentAttendance.studentAdm())
                                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("student not found"));
                if (student.getSchoolClass().getTeacher() == null) {
                        throw new SchoolResourceLockedExceptionHandler("assign class teacher first");
                }
                if (!student.getSchoolClass().getTeacher().getId()
                                .equals(fetchSingleDayStudentAttendance.teacherId())) {
                        throw new SchoolResourceLockedExceptionHandler("Not your student");
                }
                AttendanceRecords recordFound = attendanceRecordRepository.findByStudentAndDate(student,
                                fetchSingleDayStudentAttendance.date())
                                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler(
                                                "student record not found"));
                return SingleDayStudentAttendanceRecord.builder().recordDate(recordFound.getDate())
                                .studentName(student.getStudentFullName()).studentAdm(student.getStudentAdm())
                                .status(recordFound.getStatus()).build();

        }

        public AttendanceSheetDTO getAttendaceSheetSPecificDate(
                        LoadAttendaceSheetSpecificDate attendaceSheetSpecificDate) {
                dateValidator(attendaceSheetSpecificDate.date());
                SchoolClass classFound = schoolClassRepository.findById(attendaceSheetSpecificDate.classId())
                                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("class not found"));

                if (!classFound.getTeacher().getId().equals(attendaceSheetSpecificDate.teacherId())) {
                        throw new SchoolResourceLockedExceptionHandler("Not your class");
                }
                AttendanceSheet sheet = attendanceSheetRepository
                                .findBySchoolClassAndDate(classFound, attendaceSheetSpecificDate.date())
                                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler(
                                                "attendance sheet not found"));
                return toAttendanceSheetDto(sheet);
        }

        private void dateValidator(LocalDate date) {
                if (date.isAfter(LocalDate.now())) {
                        throw new SchoolResourceLockedExceptionHandler("Cannot get attendance for future date");
                }
        }

}
