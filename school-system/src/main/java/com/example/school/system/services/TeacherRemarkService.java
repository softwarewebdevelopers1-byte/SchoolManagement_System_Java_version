package com.example.school.system.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.DTO.TeacherRemarkDTO;
import com.example.school.system.DTO.TeacherRemarkResponse;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.School;
import com.example.school.system.models.Subject;
import com.example.school.system.models.TeacherProfile;
import com.example.school.system.models.TeacherRemark;
import com.example.school.system.repository.SchoolRepository;
import com.example.school.system.repository.SubjectRepository;
import com.example.school.system.repository.TeacherProfileRepository;
import com.example.school.system.repository.TeacherRemarkRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TeacherRemarkService {
    private final TeacherRemarkRepository teacherRemarkRepository;
    private final SchoolRepository schoolRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherProfileRepository teacherProfileRepository;

    @Transactional(readOnly = true)
    public List<TeacherRemark> getRemarks(UUID schoolId, UUID subjectId, UUID teacherId) {
        return teacherRemarkRepository.findAllBySchoolIdAndSubjectIdAndTeacherId(schoolId, subjectId, teacherId);
    }

        @Transactional(readOnly = true)
        public List<TeacherRemarkResponse> getSubjectRemarks(UUID schoolId, UUID subjectId) {
                return teacherRemarkRepository.findAllBySchoolIdAndSubjectId(schoolId, subjectId).stream()
                                .map(remark -> new TeacherRemarkResponse(remark.getGradeBand(), remark.getRemark()))
                                .toList();
        }

    @Transactional
    public TeacherRemark upsertRemark(TeacherRemarkDTO dto) {
        School school = schoolRepository.findById(dto.schoolId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school not found"));
        Subject subject = subjectRepository.findById(dto.subjectId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("subject not found"));
        TeacherProfile teacher = teacherProfileRepository.findById(dto.teacherId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("teacher not found"));

        TeacherRemark remark = teacherRemarkRepository
                .findBySchoolIdAndSubjectIdAndTeacherIdAndGradeBand(dto.schoolId(), dto.subjectId(), dto.teacherId(), dto.gradeBand())
                .orElse(new TeacherRemark());

        remark.setSchool(school);
        remark.setSubject(subject);
        remark.setTeacher(teacher);
        remark.setGradeBand(dto.gradeBand());
        remark.setRemark(dto.remark());
        return teacherRemarkRepository.save(remark);
    }
}
