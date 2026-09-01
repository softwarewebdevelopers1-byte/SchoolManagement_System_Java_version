import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface StudentReportSubjectRow {
  subject: string;
  marks: string;
  cbcBand: string;
  points: string | number;
  remark: string;
}

export interface StudentReportSlipData {
  studentName: string;
  admissionNo: string;
  classLabel?: string;
  term: number | string;
  year: number | string;
  examType: string;
  rank?: string | number;
  rankingLabel?: string;
  schoolName?: string;
  schoolAddress?: string;
  motto?: string;
  gradingScale?: Array<{
    grade: string;
    minScore: number;
    maxScore: number;
    points: number;
  }>;
  subjects: StudentReportSubjectRow[];
  totalMarks: string | number;
  totalPoints: string | number;
}

export const buildStudentReportSlipPdf = (data: StudentReportSlipData) => {
  const doc = new jsPDF();

  const schoolName = data.schoolName || "SCHOOL REPORT";
  const schoolAddress = data.schoolAddress || "";
  const motto = data.motto || "";

  doc.setFontSize(20);
  doc.setTextColor(201, 150, 61);
  doc.text(schoolName.toUpperCase(), 105, 18, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  if (schoolAddress) {
    doc.text(schoolAddress, 105, 26, { align: "center" });
  }
  if (motto) {
    doc.text(`Motto: ${motto}`, 105, schoolAddress ? 33 : 26, {
      align: "center",
    });
  }

  doc.setDrawColor(201, 150, 61);
  doc.line(20, schoolAddress || motto ? 38 : 31, 190, schoolAddress || motto ? 38 : 31);

  doc.setFontSize(17);
  doc.setTextColor(25, 25, 25);
  doc.text("STUDENT CBC REPORT SLIP", 105, schoolAddress || motto ? 48 : 41, {
    align: "center",
  });

  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  doc.text(`Name: ${data.studentName}`, 20, schoolAddress || motto ? 60 : 53);
  doc.text(`Admission No: ${data.admissionNo || "-"}`, 20, schoolAddress || motto ? 68 : 61);
  if (data.classLabel) {
    doc.text(`Class: ${data.classLabel}`, 20, schoolAddress || motto ? 76 : 69);
    doc.text(
      `Term: ${data.term} | Year: ${data.year} | Phase: ${String(data.examType).toUpperCase()}`,
      20,
      schoolAddress || motto ? 84 : 77,
    );
  } else {
    doc.text(
      `Term: ${data.term} | Year: ${data.year} | Phase: ${String(data.examType).toUpperCase()}`,
      20,
      schoolAddress || motto ? 76 : 69,
    );
  }

  const rankY = data.classLabel ? (schoolAddress || motto ? 92 : 85) : (schoolAddress || motto ? 84 : 77);
  const dividerY = data.rank || data.rankingLabel ? rankY + 6 : rankY;
  if (data.rank || data.rankingLabel) {
    doc.text(
      `Class Position: ${data.rank ?? "-"}${data.rankingLabel ? ` | Ranked by: ${data.rankingLabel}` : ""}`,
      20,
      rankY,
    );
  }
  doc.line(20, dividerY, 190, dividerY);

  autoTable(doc, {
    head: [["Subject", "Marks", "CBC Band", "Points", "Remark"]],
    body: [
      ...data.subjects.map((subject) => [
        subject.subject,
        subject.marks,
        subject.cbcBand,
        subject.points,
        subject.remark,
      ]),
      ["TOTAL", String(data.totalMarks), "", String(data.totalPoints), ""],
    ],
    startY: dividerY + 6,
    theme: "grid",
    headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255] },
    styles: { fontSize: 10, cellPadding: 4 },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 150;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Marks: ${data.totalMarks}`, 20, finalY + 15);
  doc.text(`Total Points: ${data.totalPoints}`, 20, finalY + 23);

  if (data.gradingScale && data.gradingScale.length) {
    const scaleStartY = finalY + 35;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(25, 25, 25);
    doc.text("CBC GRADING SCALE", 20, scaleStartY);
    doc.setFont("helvetica", "normal");
    autoTable(doc, {
      head: [["Grade", "Range", "Points"]],
      body: data.gradingScale.map((band) => [
        band.grade,
        `${band.minScore}-${band.maxScore}`,
        String(band.points),
      ]),
      startY: scaleStartY + 6,
      theme: "grid",
      headStyles: { fillColor: [201, 150, 61], textColor: [255, 255, 255] },
      styles: { fontSize: 9, cellPadding: 3 },
    });
  }

  return doc;
};
