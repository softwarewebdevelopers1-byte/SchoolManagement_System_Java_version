package com.example.school.system.controller;

import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.AssignSubjectTeacherDTO;
import com.example.school.system.DTO.RegMultipleStudentsToSubjectJoint;
import com.example.school.system.DTO.RegisterStudentsToSubjectDTO;
import com.example.school.system.DTO.RegisterSubjectJoint;
import com.example.school.system.DTO.SubjectDTO;
import com.example.school.system.DTO.SubjectUnassignment;
import com.example.school.system.DTO.SubjectUpdateDTO;
import com.example.school.system.DTO.UnenrollMultipleStudents;
import com.example.school.system.DTO.UnenrollStudent;
import com.example.school.system.DTO.UpdateSubjectJoint;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.SubjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class SubjectController {
    private final SubjectService subjectService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/school/subjects")
    public ResponseEntity<?> createSubject(@Valid @RequestBody SubjectDTO subjectCreationDTO) {
        var singleSubjectRes = subjectService.createSingleSubject(subjectCreationDTO);
        return ResponseEntity.status(201).body(singleSubjectRes);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/school/subjects/{id}")
    public ResponseEntity<?> updateSubject(@PathVariable UUID id, @Valid @RequestBody SubjectDTO subjectDTO) {
        SubjectUpdateDTO updateDTO = new SubjectUpdateDTO(subjectDTO.subjectName(), subjectDTO.schoolId(), id);
        var updateSubjectRes = subjectService.updateSubject(updateDTO);
        return ResponseEntity.ok(updateSubjectRes);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/school/subjects/{id}")
    public ResponseEntity<?> deleteSubject(@PathVariable UUID id) {
        subjectService.deleteSubject(id);
        return ResponseEntity.ok(SchoolApiResponse.success("subject deleted"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/assign/subject/teacher")
    public ResponseEntity<?> assignTeacher(@Valid @RequestBody AssignSubjectTeacherDTO assignSubjectTeacherDTO) {
        subjectService.subjectAssignment(assignSubjectTeacherDTO.subjectJointId(),
                assignSubjectTeacherDTO.teacherId());
        return ResponseEntity.status(201).body(SchoolApiResponse.success("teacher assigned"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/unassign/subject/teacher")
    public ResponseEntity<?> UnAssignTeacher(@Valid @RequestBody SubjectUnassignment subjectUnassignment) {
        subjectService.subjectUnassignment(subjectUnassignment.subjectJointId(), subjectUnassignment.teacherId());
        return ResponseEntity.status(201).body(SchoolApiResponse.success("teacher unassigned"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create/subject")
    public ResponseEntity<?> CreateSingleSubject(
            @Valid @RequestBody SubjectDTO subjectCreationDTO) {
        var singleSubjectRes = subjectService.createSingleSubject(subjectCreationDTO);
        return ResponseEntity.status(201).body(singleSubjectRes);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create/multiple/subjects")
    public ResponseEntity<?> createMultipleSubjects(
            @Valid @RequestBody List<SubjectDTO> subjects) {
        SchoolApiResponse<?> multiSchoolResponse = subjectService.createMultipleSubject(subjects);
        return ResponseEntity.status(201).body(multiSchoolResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/update/subject")
    public ResponseEntity<?> updateSubject(@Valid @RequestBody SubjectUpdateDTO subjectDTO) {
        var updateSubjectRes = subjectService.updateSubject(subjectDTO);
        return ResponseEntity.ok(updateSubjectRes);
    }

    @PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER')")
    @PatchMapping("/update/subject-joint")
    public ResponseEntity<?> updateSubjectJoint(@RequestBody UpdateSubjectJoint updateSubjectJoint) {
        subjectService.updateSubjectJointStatus(updateSubjectJoint.subjectJointId(),
                updateSubjectJoint.subjectType(), updateSubjectJoint.electiveCode());
        ;
        return ResponseEntity.ok(SchoolApiResponse.success("subject updated"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/getAll/subjects/{id}")
    public ResponseEntity<?> getSubjects(@PathVariable UUID id) {
        var response = subjectService.getSubjects(id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER')")
    @PostMapping("/register/subject-joint")
    public ResponseEntity<?> createSubjectJoint(@Valid @RequestBody RegisterSubjectJoint registerSubjectJoint) {
        subjectService.RegisterSubjectJoint(registerSubjectJoint);

        return ResponseEntity.ok(SchoolApiResponse.success("subject registered"));
    }

    @PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER')")
    @PostMapping("/register/singlestudent/subject-joint")
    public ResponseEntity<?> studentSubjectJointReg(
            @Valid @RequestBody RegisterStudentsToSubjectDTO registerStudentsToSubjectDTO) {
        subjectService.registerStudentsToSubject(registerStudentsToSubjectDTO.studentId(),
                registerStudentsToSubjectDTO.subjectJoint(), registerStudentsToSubjectDTO.schoolId(),
                registerStudentsToSubjectDTO.electiveCode());
        ;
        return ResponseEntity.ok(SchoolApiResponse.success("student registered successfully"));
    }

    @PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER')")
    @PostMapping("/register/multpile/students/subject-joint")
    public ResponseEntity<?> multipleStudentsSubjectJointReg(
            @Valid @RequestBody RegMultipleStudentsToSubjectJoint registerStudentsToSubjectDTO) {
        subjectService.registerMultipleStudentsToSubject(registerStudentsToSubjectDTO.studentsId(),
                registerStudentsToSubjectDTO.subjectId(), registerStudentsToSubjectDTO.schoolId(),
                registerStudentsToSubjectDTO.electiveCode());
        ;
        return ResponseEntity.ok(SchoolApiResponse.success("students registered successfully"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/get/all/subject-joints/{schoolId}")
    public ResponseEntity<?> getAllSubjectJoints(@PathVariable(required = true) UUID schoolId) {
        var res = subjectService.getAllSubjectJoints(schoolId);
        return ResponseEntity.ok(res);
    }

    @PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER')")
    @GetMapping("/class/subject/{id}")
    public ResponseEntity<?> getSubjectsJointForClass(@PathVariable(required = true) UUID id) {
        var res = subjectService.getSubjectJointForClass(id);
        return ResponseEntity.status(200).body(res);
    }

    @PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER')")
    @DeleteMapping("/delete/single/enrollment")
    public ResponseEntity<?> deleteSingleSubjectSelection(@Valid @RequestBody UnenrollStudent unenrollStudent) {
        subjectService.deleteSingleSubjectSelection(unenrollStudent.enrollmentCode(),
                unenrollStudent.studentId());
        return ResponseEntity.status(204).body(SchoolApiResponse.success("student unenrolled"));
    }

    @PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER')")
    @DeleteMapping("/delete/multiple/enrollment")
    public ResponseEntity<?> deleteMultipleSubjectSelection(
            @Valid @RequestBody UnenrollMultipleStudents unenrollStudents) {
        var deleteCount = subjectService.deleteMultipleSubjectSelection(unenrollStudents);
        return ResponseEntity.status(204).body(SchoolApiResponse.success(deleteCount, "student unenrolled"));
    }

    @PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER','SUBJECTTEACHER')")
    @GetMapping("/subjectJoint")
    public ResponseEntity<?> getSubjectJointsForSubjectJoint(@RequestParam UUID id, @RequestParam UUID profileId) {
        var res = subjectService.getSubjectJointForSubjectJointTeacher(profileId, id);
        return ResponseEntity.status(200).body(res);
    }
}
