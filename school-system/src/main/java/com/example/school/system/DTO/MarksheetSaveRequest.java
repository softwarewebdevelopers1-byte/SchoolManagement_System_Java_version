package com.example.school.system.DTO;

import java.util.List;
import java.util.UUID;

public record MarksheetSaveRequest(
        UUID subjectJointId,
        UUID schoolId,
        List<MarkInputDTO> markInputDTOs) {

}
