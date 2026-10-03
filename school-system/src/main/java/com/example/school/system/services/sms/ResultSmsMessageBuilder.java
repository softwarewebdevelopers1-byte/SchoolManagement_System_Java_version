package com.example.school.system.services.sms;

import java.util.List;
import java.util.stream.Collectors;

public final class ResultSmsMessageBuilder {
    private ResultSmsMessageBuilder() {
    }

    public static String build(String studentName, List<SubjectMark> subjectMarks, String resultsUrl) {
        String marks = subjectMarks.stream()
                .map(mark -> SubjectAbbreviation.abbreviate(mark.subjectName()) + " "
                        + (mark.score() == null ? "N/A" : mark.score() + "%"))
                .collect(Collectors.joining(", "));
        return "Results for " + studentName + "."
                + (marks.isEmpty() ? "" : " " + marks + ".")
                + " Full results: " + resultsUrl;
    }

    public record SubjectMark(String subjectName, Integer score) {
    }
}
