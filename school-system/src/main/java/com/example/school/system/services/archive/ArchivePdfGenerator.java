package com.example.school.system.services.archive;

import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.example.school.system.DTO.archive.AttendanceSnapshot;
import com.example.school.system.DTO.archive.FrozenResultArchiveSnapshot;
import com.example.school.system.types.ClassAttendanceStatus;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Image;
import com.lowagie.text.Paragraph;
import com.lowagie.text.PageSize;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.example.school.system.DTO.ParentResultsResponse;
import com.example.school.system.DTO.archive.ArchivedStudentResultSnapshot;

@Component
public class ArchivePdfGenerator {
    private static final java.awt.Color GREEN = new java.awt.Color(37, 112, 78);
    private static final java.awt.Color GREEN_PALE = new java.awt.Color(236, 245, 239);
    private static final java.awt.Color INK = new java.awt.Color(35, 45, 40);
    private static final java.awt.Color MUTED = new java.awt.Color(100, 112, 106);
    private static final java.awt.Color RULE = new java.awt.Color(214, 223, 217);
    private static final java.awt.Color RED_PALE = new java.awt.Color(250, 239, 237);
    private static final java.awt.Color NAVY = new java.awt.Color(22, 39, 67);
    private static final java.awt.Color BLUE = new java.awt.Color(0, 126, 190);
    private static final java.awt.Color PALE = new java.awt.Color(243, 247, 250);
    private static final java.awt.Color HEADER_FILL = new java.awt.Color(231, 239, 245);
    private static final DateTimeFormatter REPORT_DATE = DateTimeFormatter.ofPattern("dd MMM yyyy", Locale.ENGLISH);
    private static final DateTimeFormatter MATRIX_DATE = DateTimeFormatter.ofPattern("dd MMM", Locale.ENGLISH);
    private static final int MAX_MATRIX_DATES = 10;

    public byte[] generate(String title, List<String[]> rows) {
        return generateDocument(title, List.of(new Section(null, rows)));
    }

    public byte[] generateAttendanceReport(
            AttendanceSnapshot snapshot, int version, Instant requestedAt) {
        try {
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4.rotate(), 30, 30, 28, 42);
            PdfWriter writer = PdfWriter.getInstance(document, output);
            BaseFont footerFont = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.WINANSI, false);
            writer.setPageEvent(new AttendancePageFooter(version, footerFont));
            document.addTitle("Attendance Report - " + snapshot.schoolName());
            document.addAuthor("Edunex");
            document.open();

            addAttendanceHeader(document, snapshot, version, requestedAt);

            int studentCount = snapshot.studentSummaries().size();
            int recordedDays = snapshot.days().size();
            int noSheetDays = snapshot.missingDates().size();
            int present = snapshot.days().stream().mapToInt(AttendanceSnapshot.Day::presentCount).sum();
            int absent = snapshot.days().stream().mapToInt(AttendanceSnapshot.Day::absentCount).sum();
            int recordedEntries = present + absent;
            Double rate = recordedEntries == 0 ? null : present * 100.0 / recordedEntries;

            Paragraph overviewTitle = new Paragraph("ATTENDANCE OVERVIEW", font(10, Font.BOLD, GREEN));
            overviewTitle.setSpacingBefore(5);
            overviewTitle.setSpacingAfter(7);
            document.add(overviewTitle);
            PdfPTable cards = new PdfPTable(4);
            cards.setWidthPercentage(100);
            cards.setWidths(new float[] { 1, 1, 1, 1 });
            cards.setSpacingAfter(7);
            addMetricCard(cards, "STUDENTS", Integer.toString(studentCount));
            addMetricCard(cards, "RECORDED DAYS", Integer.toString(recordedDays));
            addMetricCard(cards, "NO-SHEET DAYS", Integer.toString(noSheetDays));
            addMetricCard(cards, "ATTENDANCE RATE", rate == null ? "N/A" : formatPercent(rate));
            document.add(cards);

            addAttendanceRateBar(document, rate, recordedEntries);
            if (present > 0 || absent > 0) {
                PdfPTable statusSummary = new PdfPTable(2);
                statusSummary.setWidthPercentage(100);
                statusSummary.setWidths(new float[] { 1, 1 });
                statusSummary.setSpacingBefore(3);
                statusSummary.setSpacingAfter(8);
                if (present > 0) addStatusCard(statusSummary, "PRESENT", present, GREEN_PALE, GREEN);
                if (absent > 0) addStatusCard(statusSummary, "ABSENT", absent, RED_PALE,
                        new java.awt.Color(142, 61, 52));
                document.add(statusSummary);
            }

            List<LocalDate> dates = snapshot.startDate()
                    .datesUntil(snapshot.endDate().plusDays(1))
                    .toList();
            Map<LocalDate, AttendanceSnapshot.Day> dayByDate = snapshot.days().stream()
                    .collect(Collectors.toMap(AttendanceSnapshot.Day::date, day -> day));
            Map<UUID, Map<LocalDate, ClassAttendanceStatus>> statusByStudent = new HashMap<>();
            for (AttendanceSnapshot.Day day : snapshot.days()) {
                for (AttendanceSnapshot.StudentRecord student : day.students()) {
                    statusByStudent.computeIfAbsent(student.studentId(), ignored -> new HashMap<>())
                            .put(day.date(), student.status());
                }
            }
            Set<LocalDate> noSheetDates = Set.copyOf(snapshot.missingDates());
            List<AttendanceSnapshot.StudentSummary> students = snapshot.studentSummaries();

            for (int dateOffset = 0; dateOffset < dates.size(); dateOffset += MAX_MATRIX_DATES) {
                if (dateOffset > 0) document.newPage();
                int toIndex = Math.min(dateOffset + MAX_MATRIX_DATES, dates.size());
                List<LocalDate> panelDates = dates.subList(dateOffset, toIndex);
                Paragraph recordsTitle = new Paragraph(
                        "ATTENDANCE RECORDS" + (dates.size() > MAX_MATRIX_DATES
                                ? "  ·  DATES " + (dateOffset + 1) + "-" + toIndex + " OF " + dates.size()
                                : ""),
                        font(10, Font.BOLD, GREEN));
                recordsTitle.setSpacingBefore(dateOffset == 0 ? 2 : 10);
                recordsTitle.setSpacingAfter(7);
                document.add(recordsTitle);

                PdfPTable matrix = new PdfPTable(panelDates.size() + 1);
                matrix.setWidthPercentage(100);
                float[] widths = new float[panelDates.size() + 1];
                widths[0] = 2.5f;
                java.util.Arrays.fill(widths, 1, widths.length, 0.72f);
                matrix.setWidths(widths);
                matrix.setHeaderRows(1);
                matrix.setSplitRows(false);
                matrix.setSpacingAfter(5);
                addMatrixHeader(matrix, "STUDENT");
                for (LocalDate date : panelDates) {
                    String label = MATRIX_DATE.format(date);
                    if (date.getYear() != snapshot.startDate().getYear()) {
                        label += " '" + String.valueOf(date.getYear()).substring(2);
                    }
                    addMatrixHeader(matrix, label);
                }
                for (AttendanceSnapshot.StudentSummary student : students) {
                    PdfPCell studentCell = new PdfPCell();
                    studentCell.setPadding(5);
                    studentCell.setBorderColor(RULE);
                    studentCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                    Paragraph identity = new Paragraph(text(student.name()), font(8, Font.BOLD, INK));
                    if (student.admissionNumber() != null && !student.admissionNumber().isBlank()) {
                        identity.add(new Phrase("\n" + student.admissionNumber(), font(7, Font.NORMAL, MUTED)));
                    }
                    studentCell.addElement(identity);
                    matrix.addCell(studentCell);
                    Map<LocalDate, ClassAttendanceStatus> studentStatuses =
                            statusByStudent.getOrDefault(student.studentId(), Map.of());
                    for (LocalDate date : panelDates) {
                        ClassAttendanceStatus status = studentStatuses.get(date);
                        String code;
                        java.awt.Color fill = java.awt.Color.WHITE;
                        if (noSheetDates.contains(date) || !dayByDate.containsKey(date)) {
                            code = "—";
                            fill = new java.awt.Color(245, 247, 245);
                        } else if (status == ClassAttendanceStatus.PRESENT) {
                            code = "P";
                            fill = GREEN_PALE;
                        } else if (status == ClassAttendanceStatus.ABSENT) {
                            code = "A";
                            fill = RED_PALE;
                        } else {
                            code = "NR";
                        }
                        PdfPCell statusCell = new PdfPCell(new Phrase(code, font(8, Font.BOLD, INK)));
                        statusCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                        statusCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                        statusCell.setMinimumHeight(25);
                        statusCell.setPadding(4);
                        statusCell.setBackgroundColor(fill);
                        statusCell.setBorderColor(RULE);
                        matrix.addCell(statusCell);
                    }
                }
                document.add(matrix);
            }

            Paragraph legend = new Paragraph(
                    "P  Present     A  Absent     —  No attendance sheet     NR  No individual record",
                    font(8, Font.NORMAL, MUTED));
            legend.setSpacingBefore(6);
            document.add(legend);
            document.close();
            return output.toByteArray();
        } catch (com.lowagie.text.DocumentException | java.io.IOException exception) {
            throw new IllegalStateException("Unable to generate attendance archive PDF", exception);
        }
    }

    private void addAttendanceHeader(
            Document document, AttendanceSnapshot snapshot, int version, Instant requestedAt)
            throws com.lowagie.text.DocumentException {
        PdfPTable header = new PdfPTable(1);
        header.setWidthPercentage(100);
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(GREEN_PALE);
        cell.setBorderColor(RULE);
        cell.setBorderWidth(0.8f);
        cell.setPaddingTop(12);
        cell.setPaddingBottom(11);
        cell.setPaddingLeft(14);
        cell.setPaddingRight(14);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        Paragraph school = new Paragraph(text(snapshot.schoolName()).toUpperCase(Locale.ROOT),
                font(18, Font.BOLD, GREEN));
        school.setAlignment(Element.ALIGN_CENTER);
        school.setSpacingAfter(3);
        cell.addElement(school);
        Paragraph title = new Paragraph("ATTENDANCE REPORT", font(12, Font.BOLD, INK));
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(3);
        cell.addElement(title);
        Paragraph classAndDates = new Paragraph(
                "Class " + text(snapshot.className()) + "  ·  "
                        + REPORT_DATE.format(snapshot.startDate()) + " – " + REPORT_DATE.format(snapshot.endDate()),
                font(9, Font.NORMAL, INK));
        classAndDates.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(classAndDates);
        Paragraph metadata = new Paragraph(
                "Archive v" + version + "  ·  Requested "
                        + (requestedAt == null ? "date unavailable" : REPORT_DATE.format(
                                requestedAt.atZone(java.time.ZoneOffset.UTC).toLocalDate())),
                font(7, Font.NORMAL, MUTED));
        metadata.setAlignment(Element.ALIGN_CENTER);
        metadata.setSpacingBefore(4);
        cell.addElement(metadata);
        header.addCell(cell);
        header.setSpacingAfter(10);
        document.add(header);
    }

    private void addMetricCard(PdfPTable table, String label, String value) {
        PdfPCell card = new PdfPCell();
        card.setPadding(8);
        card.setBackgroundColor(java.awt.Color.WHITE);
        card.setBorderColor(RULE);
        Paragraph heading = new Paragraph(label, font(7, Font.BOLD, MUTED));
        heading.setAlignment(Element.ALIGN_CENTER);
        card.addElement(heading);
        Paragraph metric = new Paragraph(value, font(15, Font.BOLD, GREEN));
        metric.setAlignment(Element.ALIGN_CENTER);
        metric.setSpacingBefore(3);
        card.addElement(metric);
        table.addCell(card);
    }

    private void addAttendanceRateBar(Document document, Double rate, int recordedEntries)
            throws com.lowagie.text.DocumentException {
        Paragraph label = new Paragraph(
                "ATTENDANCE RATE  ·  " + (rate == null ? "Not available" : formatPercent(rate)),
                font(8, Font.BOLD, INK));
        label.setSpacingBefore(2);
        label.setSpacingAfter(4);
        document.add(label);
        PdfPTable bar = new PdfPTable(2);
        bar.setWidthPercentage(100);
        double boundedRate = rate == null ? 0 : Math.max(0, Math.min(100, rate));
        bar.setWidths(new float[] { (float) Math.max(0.1, boundedRate), (float) Math.max(0.1, 100 - boundedRate) });
        PdfPCell filled = new PdfPCell(new Phrase(" "));
        filled.setBorder(Rectangle.NO_BORDER);
        filled.setBackgroundColor(rate == null ? RULE : GREEN);
        filled.setFixedHeight(8);
        PdfPCell remaining = new PdfPCell(new Phrase(" "));
        remaining.setBorder(Rectangle.NO_BORDER);
        remaining.setBackgroundColor(RULE);
        remaining.setFixedHeight(8);
        bar.addCell(filled);
        bar.addCell(remaining);
        document.add(bar);
        Paragraph note = new Paragraph(
                recordedEntries + " recorded student entries counted; dates with no sheet are excluded.",
                font(7, Font.NORMAL, MUTED));
        note.setSpacingBefore(3);
        note.setSpacingAfter(5);
        document.add(note);
    }

    private void addStatusCard(
            PdfPTable table, String label, int count, java.awt.Color fill,
            java.awt.Color textColor) {
        PdfPCell cell = new PdfPCell(new Phrase(label + "  " + count, font(8, Font.BOLD, textColor)));
        cell.setBackgroundColor(fill);
        cell.setBorderColor(RULE);
        cell.setPadding(6);
        table.addCell(cell);
    }

    private void addMatrixHeader(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font(7, Font.BOLD, GREEN)));
        cell.setBackgroundColor(GREEN_PALE);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(6);
        cell.setBorderColor(RULE);
        table.addCell(cell);
    }

    private String formatPercent(double rate) {
        return String.format(Locale.ROOT, "%.1f%%", rate).replace(".0%", "%");
    }

    private static class AttendancePageFooter extends PdfPageEventHelper {
        private final int version;
        private final BaseFont font;

        private AttendancePageFooter(int version, BaseFont font) {
            this.version = version;
            this.font = font;
        }

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            var canvas = writer.getDirectContent();
            canvas.saveState();
            canvas.setColorStroke(RULE);
            canvas.setLineWidth(0.5f);
            canvas.moveTo(document.left(), document.bottom() - 15);
            canvas.lineTo(document.right(), document.bottom() - 15);
            canvas.stroke();
            canvas.beginText();
            canvas.setFontAndSize(font, 7);
            canvas.setColorFill(MUTED);
            canvas.setTextMatrix(document.left(), document.bottom() - 27);
            canvas.showText("Edunex Attendance Archive  ·  v" + version);
            canvas.showTextAligned(Element.ALIGN_RIGHT, "Page " + writer.getPageNumber(),
                    document.right(), document.bottom() - 27, 0);
            canvas.endText();
            canvas.restoreState();
        }
    }

    public byte[] generateStudentResult(ArchivedStudentResultSnapshot snapshot) {
        ParentResultsResponse result = snapshot.result();
        ParentResultsResponse.Student student = result.student();
        ParentResultsResponse.School school = result.school();
        ReportPeriod period = reportPeriod(result.term());
        String schoolName = school == null ? "School" : display(school.name());
        String periodLabel = period.label();
        try {
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 38, 38, 32, 46);
            PdfWriter writer = PdfWriter.getInstance(document, output);
            writer.setPageEvent(new ResultsPageFooter(schoolName, "Student Academic Report", periodLabel));
            document.addTitle("Student Academic Report - " + display(student.name()));
            document.addAuthor("Edunex");
            document.open();

            addResultsHeader(document, schoolName, school == null ? null : school.motto(),
                    snapshot.schoolAddress(), school == null ? null : school.email(),
                    school == null ? null : school.phone(), school == null ? null : school.logoUrl(),
                    "STUDENT ACADEMIC REPORT",
                    periodLabel + (snapshot.publishedAt() == null
                            ? ""
                            : "  ·  Published " + formatInstant(snapshot.publishedAt())));

            addSectionTitle(document, "STUDENT INFORMATION");
            PdfPTable identity = new PdfPTable(2);
            identity.setWidthPercentage(100);
            identity.setWidths(new float[] { 1, 1 });
            identity.setSpacingAfter(10);
            addInformationCell(identity, "STUDENT", student.name());
            addInformationCell(identity, "ADMISSION NO.", student.studentId());
            addInformationCell(identity, "CLASS", firstPresent(student.className(), student.grade()));
            addInformationCell(identity, "ACADEMIC YEAR", period.academicYear());
            addInformationCell(identity, "TERM", period.term());
            addInformationCell(identity, "ASSESSMENT", period.assessment());
            document.add(identity);

            List<Metric> metrics = new ArrayList<>();
            ParentResultsResponse.Summary summary = result.summary();
            Double average = summary != null && summary.average() != null
                    ? summary.average() : student.overallAverage();
            String overallGrade = summary != null && notBlank(summary.overallGrade())
                    ? summary.overallGrade() : student.overallGrade();
            if (average != null) metrics.add(new Metric("OVERALL AVERAGE", formatPercent(average)));
            if (notBlank(overallGrade)) metrics.add(new Metric("OVERALL GRADE", overallGrade));
            Double points = totalPoints(result.subjects());
            if (points != null) metrics.add(new Metric("TOTAL POINTS", formatNumber(points)));
            if (student.position() != null) {
                metrics.add(new Metric("CLASS POSITION", ordinal(student.position())));
            }
            if (student.totalStudents() != null) {
                metrics.add(new Metric("CLASS SIZE", student.totalStudents().toString()));
            }
            if (!metrics.isEmpty()) {
                addMetricCards(document, metrics, 5);
            }

            addSectionTitle(document, "SUBJECT RESULTS");
            List<ParentResultsResponse.SubjectResult> subjects = safeList(result.subjects());
            Map<String, ArchivedStudentResultSnapshot.Assessment> assessments =
                    currentAssessments(snapshot.assessments(), result.term());
            boolean[] includeComponent = componentColumns(assessments.values());
            boolean includeChange = subjects.stream()
                    .anyMatch(subject -> subject.previousScore() != null || subject.difference() != null);
            addStudentSubjectTable(document, subjects, assessments, includeComponent, includeChange);

            addStudentSubjectRemarks(document, subjects);
            if (result.attendance() != null && result.attendance().totalDays() > 0) {
                addStudentAttendance(document, result.attendance());
            }
            addRemarkBox(document, "TEACHER'S REMARK", result.teacherComment());
            addRemarkBox(document, "HEADTEACHER'S REMARK", result.principalComment());
            addGradingScale(document, snapshot.gradingScale());
            document.close();
            return output.toByteArray();
        } catch (com.lowagie.text.DocumentException | java.io.IOException exception) {
            throw new IllegalStateException("Unable to generate student results report", exception);
        }
    }

    public byte[] generateClassResults(ArchivePayload payload) {
        List<ArchivedStudentResultSnapshot> students = safeList(payload.students());
        ArchivedStudentResultSnapshot first = students.stream().findFirst().orElse(null);
        ParentResultsResponse firstResult = first == null ? null : first.result();
        ParentResultsResponse.School school = firstResult == null ? null : firstResult.school();
        String schoolName = firstPresent(payload.schoolName(), school == null ? null : school.name(), "School");
        String motto = school == null ? null : school.motto();
        String address = first == null ? null : first.schoolAddress();
        String email = school == null ? null : school.email();
        String phone = school == null ? null : school.phone();
        String logoUrl = school == null ? null : school.logoUrl();
        ReportPeriod period = reportPeriod(
                payload.academicYear(), payload.term(), payload.examType() == null ? null : payload.examType().name());
        String className = firstResult == null || firstResult.student() == null
                ? payload.className() : firstPresent(firstResult.student().className(), payload.className());

        try {
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4.rotate(), 32, 32, 30, 46);
            PdfWriter writer = PdfWriter.getInstance(document, output);
            writer.setPageEvent(new ResultsPageFooter(schoolName, "Class Results Report", period.label()));
            document.addTitle("Class Results Report - " + display(className));
            document.addAuthor("Edunex");
            document.open();

            addResultsHeader(document, schoolName, motto, address, email, phone, logoUrl,
                    "CLASS RESULTS REPORT",
                    display(className) + "  ·  " + period.label()
                            + (payload.requestedAt() == null ? "" : "  ·  Finalized " + formatInstant(payload.requestedAt())));
            addSectionTitle(document, "CLASS OVERVIEW");

            List<Double> averages = students.stream()
                    .map(ArchivePdfGenerator::studentAverage)
                    .filter(Objects::nonNull)
                    .toList();
            List<SubjectRef> classSubjects = collectSubjects(students);
            List<Metric> metrics = new ArrayList<>();
            metrics.add(new Metric("STUDENTS", Integer.toString(students.size())));
            if (!classSubjects.isEmpty()) metrics.add(new Metric("SUBJECTS", Integer.toString(classSubjects.size())));
            if (!averages.isEmpty()) {
                metrics.add(new Metric("CLASS AVERAGE", formatPercent(averages.stream()
                        .mapToDouble(Double::doubleValue).average().orElseThrow())));
                metrics.add(new Metric("HIGHEST AVERAGE", formatPercent(averages.stream()
                        .mapToDouble(Double::doubleValue).max().orElseThrow())));
                metrics.add(new Metric("LOWEST AVERAGE", formatPercent(averages.stream()
                        .mapToDouble(Double::doubleValue).min().orElseThrow())));
            }
            addMetricCards(document, metrics, 5);

            addClassSubjectSummary(document, students, classSubjects);
            addGradingScale(document, first == null ? List.of() : first.gradingScale());
            if (!students.isEmpty()) {
                List<List<SubjectRef>> subjectGroups = partition(classSubjects, 5);
                if (subjectGroups.isEmpty()) subjectGroups = List.of(List.of());
                for (int groupIndex = 0; groupIndex < subjectGroups.size(); groupIndex++) {
                    document.newPage();
                    addSectionTitle(document, "STUDENT PERFORMANCE"
                            + (subjectGroups.size() > 1
                                    ? "  ·  SUBJECTS " + (groupIndex + 1) + " OF " + subjectGroups.size()
                                    : ""));
                    addClassPerformanceTable(document, students, subjectGroups.get(groupIndex));
                }
                addClassRemarks(document, students);
            }
            document.close();
            return output.toByteArray();
        } catch (com.lowagie.text.DocumentException | java.io.IOException exception) {
            throw new IllegalStateException("Unable to generate class results report", exception);
        }
    }

    private void addResultsHeader(
            Document document, String schoolName, String motto, String address,
            String email, String phone, String logoUrl, String reportTitle, String subtitle)
            throws com.lowagie.text.DocumentException, java.io.IOException {
        Image logo = embeddedLogo(logoUrl);
        PdfPTable header = new PdfPTable(logo == null ? 1 : 2);
        header.setWidthPercentage(100);
        if (logo != null) {
            PdfPCell logoCell = new PdfPCell(logo, false);
            logoCell.setBorderColor(RULE);
            logoCell.setBackgroundColor(PALE);
            logoCell.setPadding(8);
            logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            logoCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            logoCell.setFixedHeight(82);
            header.addCell(logoCell);
        }
        PdfPCell content = new PdfPCell();
        content.setBorderColor(RULE);
        content.setBackgroundColor(PALE);
        content.setPaddingTop(9);
        content.setPaddingBottom(8);
        content.setPaddingLeft(12);
        content.setPaddingRight(12);
        Paragraph school = new Paragraph(display(schoolName).toUpperCase(Locale.ROOT),
                font(17, Font.BOLD, NAVY));
        school.setSpacingAfter(2);
        content.addElement(school);
        if (notBlank(motto)) {
            content.addElement(new Paragraph(motto.trim(), font(8, Font.ITALIC, MUTED)));
        }
        Paragraph heading = new Paragraph(reportTitle, font(12, Font.BOLD, BLUE));
        heading.setSpacingBefore(4);
        heading.setSpacingAfter(2);
        content.addElement(heading);
        content.addElement(new Paragraph(subtitle, font(9, Font.BOLD, INK)));
        String contact = joinPresent(java.util.Arrays.asList(address, phone, email), "  ·  ");
        if (!contact.isBlank()) {
            content.addElement(new Paragraph(contact, font(7.5f, Font.NORMAL, MUTED)));
        }
        if (logo != null) {
            header.setWidths(new float[] { 1, 6 });
            header.addCell(content);
        } else {
            header.addCell(content);
        }
        header.setSpacingAfter(10);
        document.add(header);
    }

    private Image embeddedLogo(String value) throws java.io.IOException {
        if (value == null || !value.startsWith("data:image/")) return null;
        int separator = value.indexOf(',');
        if (separator < 0 || !value.substring(0, separator).toLowerCase(Locale.ROOT).contains(";base64")) {
            throw new IllegalArgumentException("Frozen school logo must be an embedded base64 image");
        }
        byte[] imageBytes;
        try {
            imageBytes = Base64.getDecoder().decode(value.substring(separator + 1));
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Frozen school logo contains invalid base64 image data", exception);
        }
        Image image = Image.getInstance(imageBytes);
        image.scaleToFit(54, 58);
        return image;
    }

    private void addSectionTitle(Document document, String title) throws com.lowagie.text.DocumentException {
        Paragraph heading = new Paragraph(title, font(9.5f, Font.BOLD, BLUE));
        heading.setSpacingBefore(5);
        heading.setSpacingAfter(5);
        document.add(heading);
    }

    private void addMetricCards(Document document, List<Metric> metrics, int maxColumns)
            throws com.lowagie.text.DocumentException {
        if (metrics.isEmpty()) return;
        int columns = Math.min(maxColumns, metrics.size());
        PdfPTable cards = new PdfPTable(columns);
        cards.setWidthPercentage(100);
        cards.setSpacingAfter(8);
        float[] widths = new float[columns];
        java.util.Arrays.fill(widths, 1);
        cards.setWidths(widths);
        for (Metric metric : metrics) {
            PdfPCell cell = new PdfPCell();
            cell.setPaddingTop(7);
            cell.setPaddingBottom(7);
            cell.setPaddingLeft(5);
            cell.setPaddingRight(5);
            cell.setBackgroundColor(java.awt.Color.WHITE);
            cell.setBorderColor(RULE);
            Paragraph label = new Paragraph(metric.label(), font(7, Font.BOLD, MUTED));
            label.setAlignment(Element.ALIGN_CENTER);
            label.setSpacingAfter(3);
            cell.addElement(label);
            Paragraph value = new Paragraph(metric.value(), font(13, Font.BOLD, NAVY));
            value.setAlignment(Element.ALIGN_CENTER);
            cell.addElement(value);
            cards.addCell(cell);
        }
        document.add(cards);
    }

    private void addInformationCell(PdfPTable table, String label, String value) {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(7);
        cell.setBorderColor(RULE);
        cell.setBackgroundColor(java.awt.Color.WHITE);
        cell.addElement(new Paragraph(label, font(6.8f, Font.BOLD, MUTED)));
        cell.addElement(new Paragraph(display(value), font(9, Font.BOLD, INK)));
        table.addCell(cell);
    }

    private void addStudentSubjectTable(
            Document document,
            List<ParentResultsResponse.SubjectResult> subjects,
            Map<String, ArchivedStudentResultSnapshot.Assessment> assessments,
            boolean[] includeComponent,
            boolean includeChange) throws com.lowagie.text.DocumentException {
        List<String> headers = new ArrayList<>(List.of("SUBJECT"));
        String[] componentNames = { "CAT 1", "CAT 2", "CAT 3", "EXAM" };
        for (int index = 0; index < includeComponent.length; index++) {
            if (includeComponent[index]) headers.add(componentNames[index]);
        }
        headers.addAll(List.of("TOTAL", "GRADE", "POINTS", "POS."));
        if (includeChange) headers.add("PREVIOUS / CHANGE");
        PdfPTable table = new PdfPTable(headers.size());
        table.setWidthPercentage(100);
        table.setHeaderRows(1);
        table.setSplitRows(true);
        table.setSplitLate(true);
        table.setSpacingAfter(8);
        float[] widths = new float[headers.size()];
        for (int index = 0; index < headers.size(); index++) {
            String header = headers.get(index);
            widths[index] = switch (header) {
                case "SUBJECT" -> 2.25f;
                case "TOTAL" -> 1.25f;
                case "PREVIOUS / CHANGE" -> 1.5f;
                default -> 0.9f;
            };
            addTableHeader(table, header, false);
        }
        table.setWidths(widths);
        for (ParentResultsResponse.SubjectResult subject : subjects) {
            addBodyCell(table, display(subject.name()), Element.ALIGN_LEFT, true);
            ArchivedStudentResultSnapshot.Assessment assessment = assessments.get(subjectKey(subject.id(), subject.name()));
            Integer[] marks = assessment == null
                    ? new Integer[] { null, null, null, null }
                    : new Integer[] { assessment.cat1(), assessment.cat2(), assessment.cat3(), assessment.exam() };
            Integer[] maxima = assessment == null
                    ? new Integer[] { null, null, null, null }
                    : new Integer[] {
                        assessment.maxCat1(), assessment.maxCat2(), assessment.maxCat3(), assessment.maxExam()
                    };
            for (int index = 0; index < includeComponent.length; index++) {
                if (includeComponent[index]) {
                    addBodyCell(table, componentValue(marks[index], maxima[index]), Element.ALIGN_CENTER, false);
                }
            }
            addBodyCell(table, markValue(subject.score(), subject.maxScore()), Element.ALIGN_CENTER, true);
            addBodyCell(table, display(subject.grade()), Element.ALIGN_CENTER, true);
            addBodyCell(table, subject.points() == null ? "—" : formatNumber(subject.points()),
                    Element.ALIGN_CENTER, false);
            addBodyCell(table, assessment == null || assessment.subjectPosition() == null
                            ? "—" : ordinal(assessment.subjectPosition()),
                    Element.ALIGN_CENTER, false);
            if (includeChange) {
                addBodyCell(table, previousChange(subject), Element.ALIGN_CENTER, false);
            }
        }
        if (subjects.isEmpty()) {
            PdfPCell empty = new PdfPCell(new Phrase("No subject results are available in this archived report.",
                    font(8, Font.ITALIC, MUTED)));
            empty.setColspan(headers.size());
            empty.setPadding(10);
            empty.setBorderColor(RULE);
            table.addCell(empty);
        }
        document.add(table);
    }

    private void addStudentSubjectRemarks(
            Document document, List<ParentResultsResponse.SubjectResult> subjects)
            throws com.lowagie.text.DocumentException {
        List<ParentResultsResponse.SubjectResult> noted = subjects.stream()
                .filter(subject -> notBlank(subject.teacher()) || notBlank(subject.remarks()))
                .toList();
        if (noted.isEmpty()) return;
        addSectionTitle(document, "SUBJECT TEACHER NOTES");
        PdfPTable table = new PdfPTable(new float[] { 1.3f, 1.1f, 4.6f });
        table.setWidthPercentage(100);
        table.setHeaderRows(1);
        table.setSplitLate(true);
        for (String header : List.of("SUBJECT", "TEACHER", "REMARK")) addTableHeader(table, header, false);
        for (ParentResultsResponse.SubjectResult subject : noted) {
            addBodyCell(table, display(subject.name()), Element.ALIGN_LEFT, true);
            addBodyCell(table, display(subject.teacher()), Element.ALIGN_LEFT, false);
            addBodyCell(table, display(subject.remarks()), Element.ALIGN_LEFT, false);
        }
        document.add(table);
    }

    private void addStudentAttendance(Document document, ParentResultsResponse.Attendance attendance)
            throws com.lowagie.text.DocumentException {
        addSectionTitle(document, "ATTENDANCE");
        List<Metric> metrics = new ArrayList<>();
        metrics.add(new Metric("DAYS PRESENT", Integer.toString(attendance.present())));
        metrics.add(new Metric("DAYS ABSENT", Integer.toString(attendance.absent())));
        if (attendance.late() > 0) metrics.add(new Metric("DAYS LATE", Integer.toString(attendance.late())));
        metrics.add(new Metric("DAYS RECORDED", Integer.toString(attendance.totalDays())));
        addMetricCards(document, metrics, 4);
    }

    private void addRemarkBox(Document document, String title, String remark)
            throws com.lowagie.text.DocumentException {
        if (!notBlank(remark)) return;
        PdfPTable box = new PdfPTable(1);
        box.setWidthPercentage(100);
        box.setSpacingBefore(4);
        box.setSpacingAfter(5);
        box.setSplitLate(true);
        PdfPCell cell = new PdfPCell();
        cell.setPadding(8);
        cell.setBorderColor(RULE);
        cell.setBackgroundColor(PALE);
        cell.addElement(new Paragraph(title, font(7.5f, Font.BOLD, BLUE)));
        Paragraph body = new Paragraph(remark.trim(), font(9, Font.NORMAL, INK));
        body.setSpacingBefore(3);
        cell.addElement(body);
        box.addCell(cell);
        document.add(box);
    }

    private void addGradingScale(Document document, List<FrozenResultArchiveSnapshot.GradeDescriptor> scale)
            throws com.lowagie.text.DocumentException {
        if (scale == null || scale.isEmpty()) return;
        addSectionTitle(document, "GRADING SCALE");
        PdfPTable table = new PdfPTable(new float[] { 1, 1, 1.2f, 4.5f });
        table.setWidthPercentage(100);
        table.setHeaderRows(1);
        table.setSplitLate(true);
        for (String header : List.of("GRADE", "POINTS", "RANGE", "DESCRIPTOR")) addTableHeader(table, header, false);
        for (FrozenResultArchiveSnapshot.GradeDescriptor band : scale) {
            addBodyCell(table, display(band.grade()), Element.ALIGN_CENTER, true);
            addBodyCell(table, formatNumber(band.points()), Element.ALIGN_CENTER, false);
            addBodyCell(table, band.minScore() + "–" + band.maxScore() + "%", Element.ALIGN_CENTER, false);
            addBodyCell(table, display(band.description()), Element.ALIGN_LEFT, false);
        }
        document.add(table);
    }

    private void addClassSubjectSummary(
            Document document,
            List<ArchivedStudentResultSnapshot> students,
            List<SubjectRef> subjects) throws com.lowagie.text.DocumentException {
        if (subjects.isEmpty()) return;
        addSectionTitle(document, "SUBJECT PERFORMANCE");
        PdfPTable table = new PdfPTable(new float[] { 2.5f, 1.3f, 1.1f, 1.1f, 1.3f });
        table.setWidthPercentage(100);
        table.setHeaderRows(1);
        table.setSplitLate(true);
        for (String header : List.of("SUBJECT", "CLASS AVERAGE", "HIGHEST", "LOWEST", "ASSESSED"))
            addTableHeader(table, header, true);
        for (SubjectRef subject : subjects) {
            List<Double> scores = students.stream()
                    .map(snapshot -> findSubject(snapshot, subject))
                    .filter(Objects::nonNull)
                    .filter(mark -> mark.score() != null && mark.maxScore() != null && mark.maxScore() > 0)
                    .map(mark -> mark.score() * 100.0 / mark.maxScore())
                    .toList();
            addBodyCell(table, subject.name(), Element.ALIGN_LEFT, true);
            addBodyCell(table, scores.isEmpty() ? "—" : formatPercent(scores.stream()
                    .mapToDouble(Double::doubleValue).average().orElseThrow()), Element.ALIGN_CENTER, false);
            addBodyCell(table, scores.isEmpty() ? "—" : formatPercent(scores.stream()
                    .mapToDouble(Double::doubleValue).max().orElseThrow()), Element.ALIGN_CENTER, false);
            addBodyCell(table, scores.isEmpty() ? "—" : formatPercent(scores.stream()
                    .mapToDouble(Double::doubleValue).min().orElseThrow()), Element.ALIGN_CENTER, false);
            addBodyCell(table, Integer.toString(scores.size()), Element.ALIGN_CENTER, false);
        }
        document.add(table);
    }

    private void addClassPerformanceTable(
            Document document, List<ArchivedStudentResultSnapshot> students, List<SubjectRef> subjects)
            throws com.lowagie.text.DocumentException {
        PdfPTable table = new PdfPTable(6 + subjects.size());
        table.setWidthPercentage(100);
        table.setHeaderRows(1);
        table.setSplitLate(true);
        table.setSpacingAfter(8);
        float[] widths = new float[6 + subjects.size()];
        widths[0] = 0.55f;
        widths[1] = 2.4f;
        widths[2] = 1.55f;
        widths[3] = 1.0f;
        widths[4] = 0.9f;
        widths[5] = 1.0f;
        java.util.Arrays.fill(widths, 6, widths.length, 1.55f);
        table.setWidths(widths);
        for (String header : List.of("POS.", "STUDENT", "ADMISSION NO.", "AVERAGE", "GRADE", "POINTS"))
            addTableHeader(table, header, true);
        for (SubjectRef subject : subjects) addTableHeader(table, subject.name(), true);

        for (ArchivedStudentResultSnapshot snapshot : students) {
            ParentResultsResponse result = snapshot.result();
            ParentResultsResponse.Student student = result.student();
            addBodyCell(table, student.position() == null ? "—" : ordinal(student.position()),
                    Element.ALIGN_CENTER, false);
            addBodyCell(table, display(student.name()), Element.ALIGN_LEFT, true);
            addBodyCell(table, display(student.studentId()), Element.ALIGN_LEFT, false);
            Double average = studentAverage(snapshot);
            addBodyCell(table, average == null ? "—" : formatPercent(average), Element.ALIGN_CENTER, true);
            String grade = result.summary() == null ? student.overallGrade() : result.summary().overallGrade();
            addBodyCell(table, display(grade), Element.ALIGN_CENTER, true);
            Double points = totalPoints(result.subjects());
            addBodyCell(table, points == null ? "—" : formatNumber(points), Element.ALIGN_CENTER, false);
            for (SubjectRef subject : subjects) {
                ParentResultsResponse.SubjectResult mark = findSubject(snapshot, subject);
                ArchivedStudentResultSnapshot.Assessment assessment = currentAssessments(
                        snapshot.assessments(), result.term()).get(subject.key());
                PdfPCell cell = new PdfPCell();
                cell.setPadding(3);
                cell.setBorderColor(RULE);
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                if (mark == null) {
                    cell.addElement(new Paragraph("—", font(7.5f, Font.NORMAL, MUTED)));
                } else {
                    cell.addElement(new Paragraph(markValue(mark.score(), mark.maxScore()),
                            font(8, Font.BOLD, INK)));
                    String detail = joinPresent(java.util.Arrays.asList(
                            mark.grade(),
                            mark.points() == null ? null : formatNumber(mark.points()) + " pts"), " · ");
                    if (!detail.isBlank()) cell.addElement(new Paragraph(detail, font(7.2f, Font.NORMAL, MUTED)));
                    if (mark.previousScore() != null || mark.difference() != null) {
                        cell.addElement(new Paragraph(previousChange(mark), font(7.2f, Font.NORMAL, BLUE)));
                    }
                }
                table.addCell(cell);
            }
        }
        if (students.isEmpty()) {
            PdfPCell empty = new PdfPCell(new Phrase("No student results are available.",
                    font(8, Font.ITALIC, MUTED)));
            empty.setColspan(6 + subjects.size());
            empty.setPadding(9);
            empty.setBorderColor(RULE);
            table.addCell(empty);
        }
        document.add(table);
    }

    private void addClassRemarks(Document document, List<ArchivedStudentResultSnapshot> students)
            throws com.lowagie.text.DocumentException {
        LinkedHashMap<RemarkPair, List<ArchivedStudentResultSnapshot>> grouped = new LinkedHashMap<>();
        for (ArchivedStudentResultSnapshot snapshot : students) {
            ParentResultsResponse result = snapshot.result();
            String teacher = normalizeRemark(result.teacherComment());
            String principal = normalizeRemark(result.principalComment());
            if (!notBlank(teacher) && !notBlank(principal)) continue;
            grouped.computeIfAbsent(new RemarkPair(teacher, principal), ignored -> new ArrayList<>()).add(snapshot);
        }
        if (grouped.isEmpty()) return;
        addSectionTitle(document, "STUDENT REMARKS");
        PdfPTable table = new PdfPTable(new float[] { 3.2f, 3.4f, 3.4f });
        table.setWidthPercentage(100);
        table.setHeaderRows(1);
        table.setSplitLate(true);
        for (String header : List.of("STUDENT(S)", "TEACHER'S REMARK", "HEADTEACHER'S REMARK"))
            addTableHeader(table, header, true);
        for (Map.Entry<RemarkPair, List<ArchivedStudentResultSnapshot>> entry : grouped.entrySet()) {
            String names = entry.getValue().stream()
                    .map(item -> display(item.result().student().name()))
                    .collect(Collectors.joining(", "));
            addBodyCell(table, names, Element.ALIGN_LEFT, true);
            addBodyCell(table, display(entry.getKey().teacher()), Element.ALIGN_LEFT, false);
            addBodyCell(table, display(entry.getKey().principal()), Element.ALIGN_LEFT, false);
        }
        document.add(table);
    }

    private void addTableHeader(PdfPTable table, String value, boolean landscape) {
        PdfPCell cell = new PdfPCell(new Phrase(value, font(landscape ? 7.2f : 7.5f, Font.BOLD, NAVY)));
        cell.setBackgroundColor(HEADER_FILL);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(5);
        cell.setBorderColor(RULE);
        table.addCell(cell);
    }

    private void addBodyCell(PdfPTable table, String value, int alignment, boolean bold) {
        PdfPCell cell = new PdfPCell(new Phrase(value, font(7.7f, bold ? Font.BOLD : Font.NORMAL, INK)));
        cell.setHorizontalAlignment(alignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(4);
        cell.setBorderColor(RULE);
        table.addCell(cell);
    }

    private boolean[] componentColumns(
            java.util.Collection<ArchivedStudentResultSnapshot.Assessment> assessments) {
        boolean[] present = new boolean[4];
        for (ArchivedStudentResultSnapshot.Assessment item : assessments) {
            present[0] |= item.cat1() != null || item.maxCat1() != null;
            present[1] |= item.cat2() != null || item.maxCat2() != null;
            present[2] |= item.cat3() != null || item.maxCat3() != null;
            present[3] |= item.exam() != null || item.maxExam() != null;
        }
        return present;
    }

    private Map<String, ArchivedStudentResultSnapshot.Assessment> currentAssessments(
            List<ArchivedStudentResultSnapshot.Assessment> assessments, ParentResultsResponse.Term term) {
        String period = term == null ? null : term.examType();
        return safeList(assessments).stream()
                .filter(item -> normalizePeriod(item.period()).equals(normalizePeriod(period)))
                .collect(Collectors.toMap(
                        item -> subjectKey(item.subjectId(), item.subject()),
                        item -> item,
                        (first, second) -> second,
                        LinkedHashMap::new));
    }

    private static String normalizePeriod(String period) {
        return period == null ? "" : period.replaceAll("[^A-Za-z]", "").toUpperCase(Locale.ROOT);
    }

    private List<SubjectRef> collectSubjects(List<ArchivedStudentResultSnapshot> students) {
        Map<String, SubjectRef> subjects = new LinkedHashMap<>();
        for (ArchivedStudentResultSnapshot snapshot : students) {
            for (ParentResultsResponse.SubjectResult subject : safeList(snapshot.result().subjects())) {
                String key = subjectKey(subject.id(), subject.name());
                subjects.putIfAbsent(key, new SubjectRef(key, display(subject.name())));
            }
        }
        return subjects.values().stream()
                .sorted(Comparator.comparing(SubjectRef::name, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    private ParentResultsResponse.SubjectResult findSubject(
            ArchivedStudentResultSnapshot snapshot, SubjectRef subject) {
        return safeList(snapshot.result().subjects()).stream()
                .filter(item -> subjectKey(item.id(), item.name()).equals(subject.key()))
                .findFirst()
                .orElse(null);
    }

    private static String subjectKey(UUID id, String name) {
        return id == null ? "name:" + (name == null ? "" : name.trim().toLowerCase(Locale.ROOT)) : id.toString();
    }

    private List<List<SubjectRef>> partition(List<SubjectRef> items, int size) {
        if (items.isEmpty()) return List.of();
        List<List<SubjectRef>> groups = new ArrayList<>();
        for (int start = 0; start < items.size(); start += size) {
            groups.add(items.subList(start, Math.min(start + size, items.size())));
        }
        return groups;
    }

    private ReportPeriod reportPeriod(ParentResultsResponse.Term term) {
        String id = term == null ? null : term.id();
        String termName = term == null ? null : term.name();
        String year = firstMatch(id, "(?:^|\\D)(\\d{4})(?:\\D|$)");
        if (year == null) year = firstMatch(termName, "(?:^|\\D)(\\d{4})(?:\\D|$)");
        String termNumber = firstMatch(id, "-([1-3])(?:-|$)");
        if (termNumber == null) termNumber = firstMatch(termName, "(?i)term\\s*([1-3])");
        String assessment = term == null ? null : term.examType();
        if (!notBlank(assessment) && term != null) assessment = term.name();
        return reportPeriod(year, termNumber == null ? null : Integer.valueOf(termNumber), assessment);
    }

    private ReportPeriod reportPeriod(String year, Integer term, String assessment) {
        String yearValue = notBlank(year) ? year.trim() : "—";
        String termValue = term == null ? "—" : "Term " + term;
        String assessmentValue = friendlyExam(assessment);
        String label = joinPresent(java.util.Arrays.asList(
                notBlank(year) ? yearValue : null,
                term == null ? null : termValue,
                notBlank(assessmentValue) ? assessmentValue : null), "  ·  ");
        return new ReportPeriod(yearValue, termValue, assessmentValue,
                label.isBlank() ? "Academic period unavailable" : label);
    }

    private String firstMatch(String input, String regex) {
        if (input == null) return null;
        var matcher = java.util.regex.Pattern.compile(regex).matcher(input);
        return matcher.find() ? matcher.group(1) : null;
    }

    private String friendlyExam(String value) {
        if (!notBlank(value)) return "";
        return switch (value.trim().replaceAll("[\\s_-]+", "").toUpperCase(Locale.ROOT)) {
            case "ENDTERM" -> "End of Term Assessment";
            case "MIDTERM" -> "Midterm Assessment";
            case "OPENER" -> "Opener Assessment";
            default -> value.trim().replace('_', ' ').replace('-', ' ');
        };
    }

    private static Double studentAverage(ArchivedStudentResultSnapshot snapshot) {
        ParentResultsResponse result = snapshot.result();
        ParentResultsResponse.Summary summary = result.summary();
        if (summary != null && summary.average() != null) return summary.average();
        return result.student() == null ? null : result.student().overallAverage();
    }

    private Double totalPoints(List<ParentResultsResponse.SubjectResult> subjects) {
        List<Double> values = safeList(subjects).stream()
                .map(ParentResultsResponse.SubjectResult::points)
                .filter(Objects::nonNull)
                .toList();
        return values.isEmpty() ? null : values.stream().mapToDouble(Double::doubleValue).sum();
    }

    private static Double studentAverage(ParentResultsResponse result) {
        if (result.summary() != null && result.summary().average() != null) return result.summary().average();
        return result.student() == null ? null : result.student().overallAverage();
    }

    private String previousChange(ParentResultsResponse.SubjectResult subject) {
        String previous = subject.previousScore() == null ? null : formatNumber(subject.previousScore());
        String change = subject.difference() == null ? null : signedNumber(subject.difference());
        if (previous == null && change == null) return "—";
        if (previous == null) return change;
        if (change == null) return "Prev " + previous;
        return "Prev " + previous + " · " + change;
    }

    private String signedNumber(Double value) {
        if (value == 0) return "No change";
        return (value > 0 ? "+" : "") + formatNumber(value);
    }

    private String componentValue(Integer value, Integer maximum) {
        if (value == null) return "—";
        return maximum == null ? value.toString() : value + "/" + maximum;
    }

    private String markValue(Integer value, Integer maximum) {
        if (value == null) return "—";
        return maximum == null ? value.toString() : value + "/" + maximum;
    }

    private String formatNumber(double value) {
        return String.format(Locale.ROOT, "%.1f", value).replaceAll("\\.0$", "");
    }

    private String formatInstant(Instant value) {
        return REPORT_DATE.format(value.atZone(java.time.ZoneOffset.UTC).toLocalDate());
    }

    private String ordinal(int value) {
        int mod100 = Math.abs(value) % 100;
        String suffix = mod100 >= 11 && mod100 <= 13 ? "th" : switch (Math.abs(value) % 10) {
            case 1 -> "st";
            case 2 -> "nd";
            case 3 -> "rd";
            default -> "th";
        };
        return value + suffix;
    }

    private String firstPresent(String... values) {
        for (String value : values) if (notBlank(value)) return value.trim();
        return "";
    }

    private String joinPresent(List<String> values, String delimiter) {
        return values.stream().filter(this::notBlank).map(String::trim).collect(Collectors.joining(delimiter));
    }

    private boolean notBlank(String value) {
        return value != null && !value.isBlank();
    }

    private String display(Object value) {
        if (value == null) return "—";
        String string = value.toString().trim();
        return string.isEmpty() ? "—" : string;
    }

    private String normalizeRemark(String value) {
        return value == null ? "" : value.trim();
    }

    private <T> List<T> safeList(List<T> values) {
        return values == null ? List.of() : values;
    }

    private Font font(float size, int style, java.awt.Color color) {
        return FontFactory.getFont(FontFactory.HELVETICA, BaseFont.WINANSI, size, style, color);
    }

    private record Metric(String label, String value) {}
    private record SubjectRef(String key, String name) {}
    private record RemarkPair(String teacher, String principal) {}
    private record ReportPeriod(String academicYear, String term, String assessment, String label) {}

    private static class ResultsPageFooter extends PdfPageEventHelper {
        private final String schoolName;
        private final String reportName;
        private final String period;
        private final BaseFont baseFont;

        private ResultsPageFooter(String schoolName, String reportName, String period)
                throws com.lowagie.text.DocumentException, java.io.IOException {
            this.schoolName = schoolName;
            this.reportName = reportName;
            this.period = period;
            this.baseFont = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.WINANSI, false);
        }

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            var canvas = writer.getDirectContent();
            canvas.saveState();
            canvas.setColorStroke(RULE);
            canvas.setLineWidth(0.5f);
            canvas.moveTo(document.left(), document.bottom() - 14);
            canvas.lineTo(document.right(), document.bottom() - 14);
            canvas.stroke();
            canvas.beginText();
            canvas.setFontAndSize(baseFont, 7);
            canvas.setColorFill(MUTED);
            canvas.setTextMatrix(document.left(), document.bottom() - 27);
            String footer = schoolName + "  ·  " + reportName + "  ·  " + period;
            float maxWidth = document.right() - document.left() - 55;
            while (baseFont.getWidthPoint(footer, 7) > maxWidth && footer.length() > 4) {
                footer = footer.substring(0, footer.length() - 4) + "...";
            }
            canvas.showText(footer);
            canvas.showTextAligned(Element.ALIGN_RIGHT, "Page " + writer.getPageNumber(),
                    document.right(), document.bottom() - 27, 0);
            canvas.endText();
            canvas.restoreState();
        }
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
