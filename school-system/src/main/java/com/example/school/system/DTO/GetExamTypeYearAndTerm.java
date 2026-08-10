package com.example.school.system.DTO;

import com.example.school.system.types.ExamType;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class GetExamTypeYearAndTerm {
    private String year;
    private Integer term;
    private ExamType examType;
    private String finalGrade;

}
