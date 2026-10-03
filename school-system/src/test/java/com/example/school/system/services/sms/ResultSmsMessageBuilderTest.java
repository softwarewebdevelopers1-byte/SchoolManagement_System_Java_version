package com.example.school.system.services.sms;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;

class ResultSmsMessageBuilderTest {
    private static final String URL = "https://edunex-org-v2.vercel.app/results/a8K4xP2m";

    @Test
    void buildsOneSubjectMessageWithoutAcademicDetails() {
        assertEquals("Results for John Doe. Eng 70%. Full results: " + URL,
                ResultSmsMessageBuilder.build(
                        "John Doe", List.of(new ResultSmsMessageBuilder.SubjectMark("English", 70)), URL));
    }

    @Test
    void buildsMultipleSubjectMessageWithCompactAbbreviations() {
        assertEquals("Results for John Doe. Eng 70%, Mat 80%, Kis 65%. Full results: " + URL,
                ResultSmsMessageBuilder.build("John Doe", List.of(
                        new ResultSmsMessageBuilder.SubjectMark("English", 70),
                        new ResultSmsMessageBuilder.SubjectMark("Mathematics", 80),
                        new ResultSmsMessageBuilder.SubjectMark("Kiswahili", 65)), URL));
    }

    @Test
    void keepsManySubjectsCompactAndMeasuresATypicalMessageAsOneSegment() {
        List<ResultSmsMessageBuilder.SubjectMark> marks = List.of(
                new ResultSmsMessageBuilder.SubjectMark("English", 70),
                new ResultSmsMessageBuilder.SubjectMark("Mathematics", 80),
                new ResultSmsMessageBuilder.SubjectMark("Kiswahili", 65),
                new ResultSmsMessageBuilder.SubjectMark("Science", 72),
                new ResultSmsMessageBuilder.SubjectMark("Social Studies", 81),
                new ResultSmsMessageBuilder.SubjectMark("Agriculture", 74),
                new ResultSmsMessageBuilder.SubjectMark("CRE", 79),
                new ResultSmsMessageBuilder.SubjectMark("Computer Studies", 88),
                new ResultSmsMessageBuilder.SubjectMark("Business Studies", 76),
                new ResultSmsMessageBuilder.SubjectMark("Geography", 69),
                new ResultSmsMessageBuilder.SubjectMark("History", 71),
                new ResultSmsMessageBuilder.SubjectMark("Physics", 85),
                new ResultSmsMessageBuilder.SubjectMark("Chemistry", 82),
                new ResultSmsMessageBuilder.SubjectMark("Biology", 78));
        String message = ResultSmsMessageBuilder.build("John Doe", marks, URL);
        assertTrue(message.contains("SST 81%"));
        assertTrue(message.contains("Agric 74%"));
        assertFalse(message.contains("Mathematics"));
        assertFalse(message.contains("Term"));

        String typicalMessage = ResultSmsMessageBuilder.build("Carlos Maina Wanjiku", marks.subList(0, 4), URL);
        SmsMessageMetrics.Metrics metrics = SmsMessageMetrics.measure(typicalMessage);
        assertEquals("GSM-7", metrics.encoding());
        assertEquals(1, metrics.segments());
        assertEquals(typicalMessage.codePointCount(0, typicalMessage.length()), metrics.characters());
    }

    @Test
    void abbreviatesUnknownSubjectsAndNormalizesKnownSubjectCasing() {
        assertEquals("Env Act", SubjectAbbreviation.abbreviate("Environmental Activities"));
        assertEquals("Eng", SubjectAbbreviation.abbreviate("English"));
        assertEquals("Eng", SubjectAbbreviation.abbreviate("english"));
        assertEquals("Eng", SubjectAbbreviation.abbreviate("ENGLISH"));
        assertEquals("Mat", SubjectAbbreviation.abbreviate("Mathematics"));
        assertEquals("Kis", SubjectAbbreviation.abbreviate("Kiswahili"));
        assertEquals("Sci", SubjectAbbreviation.abbreviate("Science"));
    }

    @Test
    void countsGsmAndUnicodeSegmentsUsingSmsConcatenationLimits() {
        assertEquals(1, SmsMessageMetrics.measure("x".repeat(160)).segments());
        assertEquals(2, SmsMessageMetrics.measure("x".repeat(161)).segments());
        SmsMessageMetrics.Metrics unicode = SmsMessageMetrics.measure("Ā".repeat(71));
        assertEquals("UCS-2", unicode.encoding());
        assertEquals(2, unicode.segments());
    }
}
