package com.example.school.system.services.archive;

import java.io.ByteArrayOutputStream;
import java.util.List;

import org.springframework.stereotype.Component;

import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.example.school.system.DTO.ParentResultsResponse;
import com.example.school.system.DTO.archive.ArchivedStudentResultSnapshot;

@Component
public class ArchivePdfGenerator {
    public byte[] generate(String title, List<String[]> rows) {
        return generateDocument(title, List.of(new Section(null, rows)));
    }

    private boolean isCurrentPeriod(
            ArchivedStudentResultSnapshot.Assessment assessment, ParentResultsResponse result) {
        return normalizePeriod(assessment.period()).equals(normalizePeriod(result.term().examType()));
    }

    private String normalizePeriod(String period) {
        return period == null ? "" : period.replaceAll("[^A-Za-z]", "").toUpperCase(java.util.Locale.ROOT);
    }

    public byte[] generateStudentResult(ArchivedStudentResultSnapshot snapshot) {
        ParentResultsResponse result = snapshot.result();
        ParentResultsResponse.Student student = result.student();
        List<Section> sections = new java.util.ArrayList<>();
        sections.add(new Section("Student", List.of(
                new String[] { "Name", text(student.name()) },
                new String[] { "Admission number", text(student.studentId()) },
                new String[] { "School", result.school() == null ? "" : text(result.school().name()) },
                new String[] { "Address", text(snapshot.schoolAddress()) },
                new String[] { "Email", result.school() == null ? "" : text(result.school().email()) },
                new String[] { "Phone", result.school() == null ? "" : text(result.school().phone()) },
                new String[] { "Motto", result.school() == null ? "" : text(result.school().motto()) },
                new String[] { "Class", text(student.className()) },
                new String[] { "Academic year, term and exam", result.term() == null ? "" : text(result.term().name()) },
                new String[] { "Published at", text(snapshot.publishedAt()) },
                new String[] { "Published by", text(snapshot.publishedBy()) })));
        sections.add(new Section("Subject results", subjectsTable(snapshot)));
        sections.add(new Section("Assessment components", assessmentsTable(snapshot.assessments())));
        if (snapshot.gradingScale() != null && !snapshot.gradingScale().isEmpty()) {
            sections.add(new Section("Grade descriptors", snapshot.gradingScale().stream()
                    .map(band -> new String[] {
                            band.grade(), band.description(), String.valueOf(band.points()),
                            band.minScore() + "-" + band.maxScore() + "%"
                    })
                    .toList()));
        }
        sections.add(new Section("Summary", List.of(
                new String[] { "Total marks", text(result.summary().totalMarks()) },
                new String[] { "Average", text(result.summary().average()) },
                new String[] { "Overall grade", text(result.summary().overallGrade()) },
                new String[] { "Class position", text(student.position()) },
                new String[] { "Students", text(student.totalStudents()) },
                new String[] { "Total points", text(result.subjects().stream()
                        .map(ParentResultsResponse.SubjectResult::points)
                        .filter(java.util.Objects::nonNull)
                        .mapToDouble(Double::doubleValue).sum()) })));
        if (result.attendance() != null && result.attendance().totalDays() > 0) {
            sections.add(new Section("Attendance", List.of(
                    new String[] { "Present", String.valueOf(result.attendance().present()) },
                    new String[] { "Absent", String.valueOf(result.attendance().absent()) },
                    new String[] { "Late", String.valueOf(result.attendance().late()) },
                    new String[] { "Recorded days", String.valueOf(result.attendance().totalDays()) })));
        }
        sections.add(new Section("Remarks and next term", List.of(
                new String[] { "Teacher", text(result.teacherComment()) },
                new String[] { "Principal", text(result.principalComment()) },
                new String[] { "Next term begins", text(result.nextTermBegins()) })));
        return generateDocument("Student Results - " + student.name(), sections);
    }

    public byte[] generateClassResults(
            String title, List<ArchivedStudentResultSnapshot> studentSnapshots) {
        List<String[]> rows = new java.util.ArrayList<>();
        rows.add(new String[] {
                "Student", "Admission", "Subject", "Mark", "Maximum", "Grade", "Points",
                "CAT 1", "CAT 2", "CAT 3", "Exam", "Position", "Average",
                "Teacher", "Remarks", "Previous", "Change"
        });
        for (ArchivedStudentResultSnapshot snapshot : studentSnapshots) {
            ParentResultsResponse result = snapshot.result();
            ParentResultsResponse.Student student = result.student();
            java.util.Map<java.util.UUID, ArchivedStudentResultSnapshot.Assessment> assessmentsBySubject =
                    snapshot.assessments().stream().collect(java.util.stream.Collectors.toMap(
                            ArchivedStudentResultSnapshot.Assessment::subjectId,
                            assessment -> assessment,
                            (first, second) -> isCurrentPeriod(second, result) ? second : first));
            for (ParentResultsResponse.SubjectResult subject : result.subjects()) {
                ArchivedStudentResultSnapshot.Assessment assessment = assessmentsBySubject.get(subject.id());
                rows.add(new String[] {
                        text(student.name()), text(student.studentId()), text(subject.name()),
                        text(subject.score()), text(subject.maxScore()),
                        text(subject.grade()), text(subject.points()),
                        assessment == null ? "" : component(assessment.cat1(), assessment.maxCat1()),
                        assessment == null ? "" : component(assessment.cat2(), assessment.maxCat2()),
                        assessment == null ? "" : component(assessment.cat3(), assessment.maxCat3()),
                        assessment == null ? "" : component(assessment.exam(), assessment.maxExam()),
                        text(student.position()), "",
                        text(subject.teacher()), text(subject.remarks()),
                        text(subject.previousScore()), text(subject.difference())
                });
            }
            rows.add(new String[] {
                    text(student.name()), text(student.studentId()), "OVERALL",
                    text(result.summary().totalMarks()), "", text(result.summary().overallGrade()), "",
                    "", "", "", "", text(student.position()), text(result.summary().average()),
                    text(result.teacherComment()),
                    text(result.principalComment()), "", ""
            });
        }
        return generateDocument(title, List.of(new Section("Published class results", rows)));
    }

    private List<String[]> subjectsTable(ArchivedStudentResultSnapshot snapshot) {
        List<ParentResultsResponse.SubjectResult> subjects = snapshot.result().subjects();
        List<String[]> rows = new java.util.ArrayList<>();
        rows.add(new String[] { "Field", "Value" });
        for (ParentResultsResponse.SubjectResult subject : subjects) {
            ArchivedStudentResultSnapshot.Assessment assessment = snapshot.assessments().stream()
                    .filter(item -> item.subjectId().equals(subject.id()))
                    .filter(item -> isCurrentPeriod(item, snapshot.result()))
                    .findFirst()
                    .orElse(null);
            rows.add(new String[] { "Subject", text(subject.name()) });
            rows.add(new String[] { "Mark / maximum", text(subject.score()) + " / " + text(subject.maxScore()) });
            rows.add(new String[] { "Grade / points", text(subject.grade()) + " / " + text(subject.points()) });
            rows.add(new String[] { "Teacher", text(subject.teacher()) });
            rows.add(new String[] { "Remarks", text(subject.remarks()) });
            rows.add(new String[] {
                    "Subject rank",
                    assessment == null || assessment.subjectPosition() == null
                            ? ""
                            : assessment.subjectPosition() + "/" + assessment.subjectStudentCount()
            });
            rows.add(new String[] { "Previous mark / change",
                    text(subject.previousScore()) + " / " + text(subject.difference()) });
        }
        return rows;
    }

    private List<String[]> assessmentsTable(List<ArchivedStudentResultSnapshot.Assessment> assessments) {
        List<String[]> rows = new java.util.ArrayList<>();
        rows.add(new String[] { "Assessment field", "Value" });
        for (ArchivedStudentResultSnapshot.Assessment assessment : assessments) {
            int maximum = value(assessment.maxCat1()) + value(assessment.maxCat2())
                    + value(assessment.maxCat3()) + value(assessment.maxExam());
            rows.add(new String[] { "Subject / period", text(assessment.subject()) + " / " + text(assessment.period()) });
            rows.add(new String[] { "Subject ID / teacher",
                    text(assessment.subjectId()) + " / " + text(assessment.teacher()) });
            rows.add(new String[] { "CAT 1 / maximum", component(assessment.cat1(), assessment.maxCat1()) });
            rows.add(new String[] { "CAT 2 / maximum", component(assessment.cat2(), assessment.maxCat2()) });
            rows.add(new String[] { "CAT 3 / maximum", component(assessment.cat3(), assessment.maxCat3()) });
            rows.add(new String[] { "Exam / maximum", component(assessment.exam(), assessment.maxExam()) });
            rows.add(new String[] { "Total / maximum", text(assessment.total()) + " / " + maximum });
            rows.add(new String[] { "Percent / grade / points",
                    text(assessment.percentage()) + "% / " + text(assessment.grade()) + " / "
                            + text(assessment.points()) });
            rows.add(new String[] { "Subject rank",
                    assessment.subjectPosition() == null
                            ? ""
                            : assessment.subjectPosition() + "/" + assessment.subjectStudentCount() });
        }
        return rows;
    }

    private String component(Integer value, Integer maximum) {
        return text(value) + " / " + text(maximum);
    }

    private String text(Object value) {
        return value == null ? "" : value.toString();
    }

    private int value(Integer value) {
        return value == null ? 0 : value;
    }

    private byte[] generateDocument(String title, List<Section> sections) {
        try {
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            Document document = new Document();
            PdfWriter.getInstance(document, output);
            document.open();
            document.add(new Paragraph(title));
            document.add(new Paragraph(" "));
            for (Section section : sections) {
                if (section.title() != null) {
                    document.add(new Paragraph(section.title()));
                }
                if (section.rows().isEmpty()) {
                    continue;
                }
                PdfPTable table = new PdfPTable(section.rows().getFirst().length);
                table.setWidthPercentage(100);
                for (String[] row : section.rows()) {
                    for (String cell : row) {
                        table.addCell(cell == null ? "" : cell);
                    }
                }
                document.add(table);
                document.add(new Paragraph(" "));
            }
            document.close();
            return output.toByteArray();
        } catch (com.lowagie.text.DocumentException exception) {
            throw new IllegalStateException("Unable to generate archive PDF", exception);
        }
    }

    private record Section(String title, List<String[]> rows) {
    }
}
