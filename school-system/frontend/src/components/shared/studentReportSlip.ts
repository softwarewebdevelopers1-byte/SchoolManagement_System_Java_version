import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface StudentReportAssessment { label: string; marks: string | number | null | undefined; }
export interface StudentReportSubjectRow {
  subject: string; marks: string; cbcBand: string; points: string | number; remark: string;
  assessments?: StudentReportAssessment[]; development?: string | number; rank?: string | number;
  rankTotal?: string | number; teacher?: string;
}
export interface StudentReportSlipData {
  studentName: string; admissionNo: string; classLabel?: string; term: number | string; year: number | string; examType: string;
  rank?: string | number; rankingLabel?: string; schoolName?: string; schoolAddress?: string; schoolEmail?: string; phoneNumber?: string; motto?: string;
  classTeacherRemark?: string; principalRemark?: string;
  gradingScale?: Array<{ grade: string; minScore: number; maxScore: number; points: number }>;
  subjects: StudentReportSubjectRow[]; totalMarks: string | number; totalPoints: string | number;
}

const clean = (value: unknown) => value === null || value === undefined || value === "" ? "-" : String(value);
const numeric = (value: unknown) => { const parsed = Number(String(value).replace("%", "")); return Number.isFinite(parsed) ? parsed : null; };
const titleFor = (value: string) => {
  const label = String(value).replace(/[_-]/g, " ").toUpperCase();
  return label === "ENDTERM" ? "END OF TERM" : label === "MIDTERM" ? "MID TERM" : label || "ASSESSMENT";
};

export const buildStudentReportSlipPdf = (data: StudentReportSlipData) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const width = doc.internal.pageSize.getWidth(), margin = 10, contentWidth = width - margin * 2;
  const blue: [number, number, number] = [46, 171, 218], green: [number, number, number] = [45, 143, 65], pale: [number, number, number] = [244, 246, 249];
  const currentLabel = titleFor(data.examType);
  const allLabels = Array.from(new Set(data.subjects.flatMap((item) => item.assessments || []).map((item) => item.label).filter(Boolean)));
  const priorLabels = allLabels.filter((item) => item !== currentLabel).slice(0, 3);
  const count = data.subjects.length || 1, totalMarks = numeric(data.totalMarks) || 0, totalPoints = numeric(data.totalPoints) || 0;
  const meanMark = totalMarks / count, meanPoints = (totalPoints / count).toFixed(2);
  const level = data.gradingScale?.find((band) => meanMark >= band.minScore && meanMark <= band.maxScore)?.grade || "-";
  const maximumPoints = data.gradingScale?.length ? count * Math.max(...data.gradingScale.map((band) => band.points)) : null;

  doc.setFillColor(...green); doc.rect(2, 2, 6, 293, "F");
  doc.setFont("helvetica", "bold"); doc.setTextColor(...green); doc.setFontSize(15);
  doc.text((data.schoolName || "SCHOOL NAME").toUpperCase(), width / 2, 12, { align: "center" });
  doc.setTextColor(20, 20, 20); doc.setFontSize(8.5);
  const contacts = [data.schoolAddress && `Address: ${data.schoolAddress}`, data.phoneNumber && `Tel: ${data.phoneNumber}`, data.schoolEmail && `Email: ${data.schoolEmail}`].filter(Boolean);
  contacts.forEach((line, index) => doc.text(String(line), width / 2, 17 + index * 4.5, { align: "center" }));
  const bannerY = Math.max(29, 19 + contacts.length * 4.5);
  doc.setFillColor(...blue); doc.rect(margin, bannerY, contentWidth, 8, "F"); doc.setTextColor(255, 255, 255); doc.setFontSize(10.5);
  doc.text(`ACADEMIC REPORT FORM - ${data.classLabel || "CLASS"} - ${currentLabel} - (${data.year} TERM ${data.term})`, width / 2, bannerY + 5.4, { align: "center" });

  const summaryY = bannerY + 11;
  doc.setFillColor(118, 139, 172); doc.rect(margin, summaryY, 32, 31, "F"); doc.setTextColor(255, 255, 255); doc.setFontSize(7);
  doc.text("STUDENT", margin + 16, summaryY + 16, { align: "center" });
  doc.setTextColor(22, 22, 22); doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.text(data.studentName, margin + 35, summaryY + 5);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  [`ADM NO: ${clean(data.admissionNo)}`, `FORM: ${data.classLabel || "-"}`, `TERM: ${data.term}  YEAR: ${data.year}`, `POSITION: ${data.rank ? `${data.rank}${data.rankingLabel ? ` (${data.rankingLabel})` : ""}` : "-"}`]
    .forEach((line, index) => doc.text(line, margin + 35, summaryY + 10 + index * 5));
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.text("SUBJECT PERFORMANCE - STUDENT", 149, summaryY + 4, { align: "center" });
  const graphMarks = data.subjects.map((item) => numeric(item.marks) || 0), graphLeft = 108, graphTop = summaryY + 8, graphWidth = 82, graphHeight = 20;
  doc.setDrawColor(215, 220, 224); doc.rect(graphLeft, graphTop, graphWidth, graphHeight);
  doc.setDrawColor(0, 200, 30); doc.setLineWidth(0.7);
  graphMarks.forEach((mark, index) => {
    const x = graphLeft + (graphMarks.length === 1 ? graphWidth / 2 : index * graphWidth / (graphMarks.length - 1)), y = graphTop + graphHeight - mark / 100 * graphHeight;
    if (index) { const previousX = graphLeft + (index - 1) * graphWidth / (graphMarks.length - 1), previousY = graphTop + graphHeight - graphMarks[index - 1] / 100 * graphHeight; doc.line(previousX, previousY, x, y); }
    doc.setFillColor(0, 200, 30); doc.circle(x, y, 1, "F");
  });

  const cardsY = summaryY + 35, cardWidth = (contentWidth - 9) / 4;
  [["Performance\nLevel", level], ["Total Marks", `${clean(data.totalMarks)}/${count * 100}`], ["Total Points", `${clean(data.totalPoints)}${maximumPoints ? `/${maximumPoints}` : ""}`], ["Mean Points", meanPoints]].forEach(([label, value], index) => {
    const x = margin + index * (cardWidth + 3); doc.setFillColor(...pale); doc.rect(x, cardsY, cardWidth, 18, "F"); doc.setTextColor(15, 15, 15); doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.text(label, x + cardWidth / 2, cardsY + 6, { align: "center" }); doc.setFontSize(10); doc.text(value, x + cardWidth / 2, cardsY + 13, { align: "center" });
  });

  const headers = ["SUBJECT", ...priorLabels, `${currentLabel}\nMARKS`, "DEV.", "GR.", "RANK", "PERFORMANCE LEVEL", "TEACHER"];
  const body = data.subjects.map((subject) => {
    const assessments = new Map((subject.assessments || []).map((item) => [item.label, item.marks]));
    const current = numeric(subject.marks), previous = numeric(assessments.get(priorLabels[priorLabels.length - 1]));
    const development = subject.development ?? (current !== null && previous !== null ? current - previous : "-");
    return [subject.subject, ...priorLabels.map((label) => assessments.has(label) ? `${clean(assessments.get(label))}%` : "-"), current === null ? clean(subject.marks) : `${current}%`, typeof development === "number" ? `${development > 0 ? "+" : ""}${development}` : clean(development), subject.cbcBand, subject.rank ? `${subject.rank}/${subject.rankTotal || "-"}` : "-", subject.remark, subject.teacher || "-"];
  });
  const columnWidths = [25, ...priorLabels.map(() => 15), 15, 10, 10, 12, 40, 30];
  autoTable(doc, { head: [headers], body, startY: cardsY + 23, margin: { left: margin, right: margin }, theme: "grid", headStyles: { fillColor: pale, textColor: [95, 95, 95], fontStyle: "bold", fontSize: 6.8, halign: "center", valign: "middle" }, bodyStyles: { fontSize: 6.7, textColor: [18, 18, 18], cellPadding: 1.6, valign: "middle" }, columnStyles: Object.fromEntries(columnWidths.map((cellWidth, index) => [index, { cellWidth, halign: index > 0 && index < 6 ? "center" : "left" }])) });

  let y = ((doc as any).lastAutoTable?.finalY || cardsY + 70) + 4, remarkHeight = 28, half = (contentWidth - 3) / 2;
  [["Class Teacher Remarks:", data.classTeacherRemark || `${data.studentName.split(" ")[0] || "Learner"}, keep building on your progress through consistent effort and focus.`], ["Chief Principal Remarks:", data.principalRemark || "Your performance is noted. Maintain discipline, focus and a positive attitude towards learning."]].forEach(([heading, remark], index) => {
    const x = margin + index * (half + 3); doc.setDrawColor(30, 30, 30); doc.rect(x, y, half, remarkHeight); doc.setFillColor(...pale); doc.rect(x, y, half, 7, "F"); doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.text(heading, x + 2, y + 4.7); doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.text(doc.splitTextToSize(remark, half - 4), x + 2, y + 11); doc.setTextColor(115, 115, 115); doc.text("Signature:", x + 2, y + remarkHeight - 3); doc.setTextColor(20, 20, 20);
  });
  y += remarkHeight + 6; doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.text("GRADE DESCRIPTORS", margin + 1, y);
  autoTable(doc, { head: [["GRADE", "PERFORMANCE LEVEL", "POINTS", "RANGE (%)"]], body: (data.gradingScale || []).map((band) => [band.grade, band.grade.startsWith("EE") ? "Exceeding Expectations" : band.grade.startsWith("ME") ? "Meeting Expectations" : band.grade.startsWith("AE") ? "Approaching Expectations" : "Below Expectations", band.points, `${band.minScore}-${band.maxScore}`]), startY: y + 3, margin: { left: margin, right: margin }, theme: "grid", headStyles: { fillColor: pale, textColor: [30, 30, 30], fontSize: 7, fontStyle: "bold" }, bodyStyles: { fontSize: 7, cellPadding: 1.4 } });
  if (data.motto) { doc.setFillColor(...blue); doc.rect(122, 288, 78, 7, "F"); doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bolditalic"); doc.setFontSize(7.5); doc.text(`School Motto: ${data.motto}`, 198, 292.6, { align: "right" }); }
  return doc;
};
