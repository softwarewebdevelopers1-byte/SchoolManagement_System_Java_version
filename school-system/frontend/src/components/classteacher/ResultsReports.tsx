import React, { useEffect, useState, useCallback } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { api, getSchoolId, request } from "../../lib/api";
import { DlIcon } from "./shared/Icons";
import { C, FONT } from "./shared/constants";
import {
  gradeBg,
  gradeColor,
  getSubjectRemark,
  getSubId,
  isStudentSubject,
  marksForStudentSubjects,
  sum,
  sumPoints,
} from "./shared/helpers";
import { Avatar } from "./shared/Avatar";
import { resolveCbcBand, useCbcGradingBands } from "../../lib/cbcGrading";
import { buildStudentReportSlipPdf } from "../shared/studentReportSlip";

interface ResultsReportsProps {
  students: any[];
  subjects: any[];
  classGrade: string;
  classStream: string;
  term?: number;
  year?: number;
  examType?: string;
  onViewStudent?: (student: any, rank?: number) => void;
}

const thStyle: React.CSSProperties = {
  padding: "11px 16px",
  textAlign: "left",
  fontFamily: FONT.sans,
  fontSize: 10.5,
  fontWeight: 700,
  color: C.textFaint,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontFamily: FONT.sans,
  fontSize: 13,
  color: C.textMid,
};

const SectionHeader: React.FC<{
  eyebrow: string;
  title: string;
  sub?: string;
}> = ({ eyebrow, title, sub }) => (
  <div style={{ marginBottom: "1.6rem" }}>
    <p
      style={{
        fontFamily: FONT.sans,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.09em",
        textTransform: "uppercase",
        color: C.gold,
        margin: "0 0 5px",
      }}
    >
      {eyebrow}
    </p>
    <h2
      style={{
        fontFamily: FONT.serif,
        fontSize: "1.9rem",
        fontWeight: 600,
        color: C.text,
        margin: "0 0 4px",
      }}
    >
      {title}
    </h2>
    {sub && (
      <p
        style={{
          fontFamily: FONT.sans,
          fontSize: 13,
          color: C.textMuted,
          margin: 0,
        }}
      >
        {sub}
      </p>
    )}
  </div>
);

export const ResultsReports: React.FC<ResultsReportsProps> = ({
  students,
  subjects,
  classGrade,
  classStream,
  term = 1,
  year = 2024,
  examType = "opener",
  onViewStudent,
}) => {
  const { bands: cbcBands } = useCbcGradingBands();
  const [msg, setMsg] = React.useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [rankingMode, setRankingMode] = React.useState<
    "total_points" | "total_marks"
  >("total_points");
  const [isSendingWhatsapp, setIsSendingWhatsapp] = React.useState(false);
  const [marksLoading, setMarksLoading] = React.useState(true);
  const [studentsWithMarks, setStudentsWithMarks] =
    React.useState<any[]>(students);
  const [schoolProfile, setSchoolProfile] = useState<{
    schoolName?: string;
    schoolAddress?: string;
    schoolEmail?: string;
    phoneNumber?: string;
    motto?: string;
  }>({});
  const [remarksBySubject, setRemarksBySubject] = useState<
    Record<string, Record<string, string>>
  >({});

  useEffect(() => {
    const loadRemarks = async () => {
      const schoolId = getSchoolId();
      if (!schoolId || !subjects.length) return;
      const entries = await Promise.all(
        subjects.map(async (subject: any) => {
          const subjectId = getSubId(
            subject?.subjectId || subject?.id || subject?._id,
          );
          if (!subjectId) return null;
          try {
            const data = await api.get<any[]>("/teacher-remarks", {
              schoolId,
              subjectId,
            });
            return [
              subjectId,
              Object.fromEntries(
                (data || []).map((item) => [item.gradeBand, item.remark]),
              ),
            ] as const;
          } catch {
            return null;
          }
        }),
      );
      setRemarksBySubject(Object.fromEntries(entries.filter(Boolean) as any));
    };
    void loadRemarks();
  }, [subjects]);

  useEffect(() => {
    const loadSchoolProfile = async () => {
      const schoolId = getSchoolId();
      if (!schoolId) return;

      try {
        const data: any = await request(
          `/schools/settings?schoolId=${encodeURIComponent(schoolId)}`,
        );
        setSchoolProfile({
          schoolName: data?.schoolName,
          schoolAddress: data?.schoolAddress,
          schoolEmail: data?.schoolEmail,
          phoneNumber: data?.phoneNumber,
          motto: data?.motto,
        });
      } catch {
        setSchoolProfile({});
      }
    };

    void loadSchoolProfile();
  }, []);

  // Load marks from backend for each subject and attach to students
  const loadMarks = useCallback(async () => {
    if (!students.length || !subjects.length) {
      setStudentsWithMarks(students);
      setMarksLoading(false);
      return;
    }

    setMarksLoading(true);
    try {
      // Build a map of studentId -> { subjectId -> mark }
      const marksByStudent: Record<string, Record<string, number>> = {};

      // Normalize examType to match backend expectations
      const normalizedExamType = String(examType || "OPENER")
        .replace(/[^a-z]/gi, "")
        .toUpperCase();

      // Fetch marks for each subject
      const subjectResults = await Promise.allSettled(
        subjects.map(async (subject: any) => {
          const subjectId = getSubId(subject?.id || subject?._id);
          if (!subjectId) return null;
          try {
            // Fetch marks for the specific term, year, and exam type
            const data: any = await api.get("/marks", { 
              subjectId,
              term: String(term),
              year: String(year),
              examType: normalizedExamType
            });
            return { subjectId, data: Array.isArray(data) ? data : [] };
          } catch (err) {
            console.warn(`Failed to load marks for subject ${subjectId}:`, err);
            return { subjectId, data: [] };
          }
        }),
      );
      subjectResults.forEach((result) => {
        if (result.status !== "fulfilled" || !result.value) return;
        const { subjectId, data } = result.value;
        if (!data.length) {
          console.warn(`No marks data returned for subject ${subjectId} - term ${term}, year ${year}, examType ${normalizedExamType}`);
          return;
        }
        (data as any[]).forEach((row: any) => {
          const studentId = String(row.studentId || "");
          if (!studentId) {
            console.debug("Row missing studentId:", row);
            return;
          }
          const finalScore = row.marks?.finalScore;
          const totalMarks = row.marks?.totalMarks;
          const avgPercentage = row.marks?.avgPercentage;
          let mark: number | null = null;
          if (avgPercentage !== null && avgPercentage !== undefined) {
            const parsed = parseFloat(String(avgPercentage).replace("%", ""));
            if (!Number.isNaN(parsed)) mark = parsed;
          } else if (
            finalScore !== null &&
            finalScore !== undefined &&
            finalScore !== ""
          ) {
            mark = Number(finalScore);
          } else if (
            totalMarks !== null &&
            totalMarks !== undefined &&
            totalMarks !== ""
          ) {
            mark = Number(totalMarks);
          }
          if (mark !== null && !Number.isNaN(mark)) {
            marksByStudent[studentId] = marksByStudent[studentId] || {};
            marksByStudent[studentId][subjectId] = mark;
          }
        });
      });

      // Attach marks to students
      const enrichedStudents = students.map((student: any) => {
        const studentId = String(student.studentId || student.userId || "");
        return {
          ...student,
          marks: marksByStudent[studentId] || {},
        };
      });

      // Debug: Check if marks were actually loaded
      const studentsWithLoadedMarks = enrichedStudents.filter(
        (s) => Object.keys(s.marks).length > 0
      ).length;
      console.log(
        `Loaded marks for term=${term}, year=${year}, examType=${normalizedExamType}: ${studentsWithLoadedMarks}/${enrichedStudents.length} students have marks`
      );

      setStudentsWithMarks(enrichedStudents);
    } catch (err) {
      console.error("Error loading marks:", err);
      // Fall back to students without marks
      setStudentsWithMarks(students);
    } finally {
      setMarksLoading(false);
    }
  }, [students, subjects, classGrade, classStream, term, year, examType]);

  useEffect(() => {
    void loadMarks();
  }, [loadMarks]);

  const buildMetrics = (student: any) => {
    const marks = marksForStudentSubjects(student, subjects);
    const attempted = Object.keys(marks).length;
    const totalMarks = sum(marks);
    const totalPoints = sumPoints(marks, cbcBands);
    return { marks, attempted, totalMarks, totalPoints };
  };

  // Sort strictly by the chosen ranking field only
  const sortedStudents = [...studentsWithMarks].sort((a, b) => {
    const left = buildMetrics(a);
    const right = buildMetrics(b);

    let diff = 0;
    if (rankingMode === "total_marks") {
      diff = right.totalMarks - left.totalMarks;
    } else {
      diff = right.totalPoints - left.totalPoints;
    }

    return (
      diff || String(a.fullName || "").localeCompare(String(b.fullName || ""))
    );
  });

  // Dense ranking: ties share the same rank, next position is consecutive (not skipped)
  let rank = 0;
  let previousValue: number | null = null;
  const rankedStudents = sortedStudents.map((student) => {
    const metrics = buildMetrics(student);
    const currentValue =
      rankingMode === "total_marks" ? metrics.totalMarks : metrics.totalPoints;

    if (currentValue !== previousValue) {
      rank += 1;
      previousValue = currentValue;
    }
    return { ...student, rank, metrics };
  });

  const topStudent = rankedStudents[0] || null;
  const leastStudent = rankedStudents[rankedStudents.length - 1] || null;

  const handleSendWhatsappMarks = async () => {
    setIsSendingWhatsapp(true);
    setMsg(null);
    try {
      const response = await api.post<{ message?: string }>(
        "/marks/whatsapp/class",
        {
          classGrade,
          classStream,
          term,
          year,
          examType,
        },
      );
      setMsg({
        text: response.message || "WhatsApp marks have been queued.",
        type: "success",
      });
    } catch (error: any) {
      setMsg({
        text: error?.message || "Unable to queue WhatsApp marks.",
        type: "error",
      });
    } finally {
      setIsSendingWhatsapp(false);
    }
  };

  const handleDownload = async (type: string, studentName?: string) => {
    try {
      if (
        type === "Full Merit List" ||
        type === "Full class report" ||
        type === "Subject summary"
      ) {
        const doc = new jsPDF("landscape");
        doc.setTextColor(201, 150, 61);
        doc.setFontSize(18);
        doc.text(schoolProfile.schoolName || "School Report", 14, 16);
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(9);
        if (schoolProfile.schoolAddress) {
          doc.text(schoolProfile.schoolAddress, 14, 23);
        }
        if (schoolProfile.motto) {
          doc.text(`Motto: ${schoolProfile.motto}`, 14, schoolProfile.schoolAddress ? 30 : 23);
        }
        doc.setFontSize(12);
        doc.text(
          `CBC Class Merit List - Term ${term}, ${year} (${examType.toUpperCase()})`,
          14,
          schoolProfile.schoolAddress || schoolProfile.motto ? 40 : 30,
        );
        doc.setFontSize(10);
        doc.text(
          `Ranked by: ${rankingMode === "total_marks" ? "Total Marks" : "Total Points"} | Generated on ${new Date().toLocaleDateString()}`,
          14,
          schoolProfile.schoolAddress || schoolProfile.motto ? 47 : 37,
        );

        autoTable(doc, {
          head: [
            [
              "Rank",
              "Student",
              "ADM",
              ...subjects.map((s) => s.name.slice(0, 3).toUpperCase()),
              "Total Points",
              "Total Marks",
            ],
          ],
          body: rankedStudents.map((student) => [
            student.rank,
            student.fullName,
            student.adm ||
              student.admissionNumber ||
              student.admissionNo ||
              "-",
            ...subjects.map((subject) => {
              const mark = isStudentSubject(student, subject)
                ? student.metrics.marks[getSubId(subject.id)]
                : null;
              if (mark == null) return "-";
              return `${mark}%`;
            }),
            student.metrics.totalPoints,
            student.metrics.totalMarks,
          ]),
          startY: schoolProfile.schoolAddress || schoolProfile.motto ? 54 : 43,
          theme: "grid",
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: {
            fillColor: [30, 30, 30],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
        });
        doc.save(`CBC_MeritList_Term${term}_${Date.now()}.pdf`);
      } else if (type === "Excel Report") {
        const worksheetData = rankedStudents.map((student) => ({
          Rank: student.rank,
          "Student Name": student.fullName,
          ADM:
            student.adm ||
            student.admissionNumber ||
            student.admissionNo ||
            "-",
          ...Object.fromEntries(
            subjects.map((subject) => {
              const mark = isStudentSubject(student, subject)
                ? student.metrics.marks[getSubId(subject.id)]
                : null;
              if (mark == null) return [subject.name, "N/A"];
              return [subject.name, `${mark}%`];
            }),
          ),
          "Total Points": student.metrics.totalPoints,
          "Total Marks": student.metrics.totalMarks,
          "Ranked By":
            rankingMode === "total_marks" ? "Total Marks" : "Total Points",
        }));
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, worksheet, "CBC Class Report");
        XLSX.writeFile(wb, `CBC_Term${term}_Report_${Date.now()}.xlsx`);
      } else if (type === "Report Slip" || type === "Individual result slips") {
        const slip = rankedStudents.find(
          (student) => student.fullName === studentName,
        );
        console.log("slip ", slip);
        if (!slip) {
          setMsg({
            text: "Individual slip download requires a student selection.",
            type: "error",
          });
          setTimeout(() => setMsg(null), 3500);
          return;
        }
        // The login payload can contain the assessment cycle from when the
        // teacher signed in. Always use the school setting that was active when
        // the marks were entered, so a Mid Term download can find its Opener.
        let reportTerm = term;
        let reportYear = year;
        let reportExamType = examType;
        const schoolId = getSchoolId();
        if (schoolId) {
          try {
            const cycle: any = await request(
              `/schools/get/term/exam/${encodeURIComponent(schoolId)}`,
            );
            reportTerm = cycle?.term ?? reportTerm;
            reportYear = cycle?.year ?? reportYear;
            reportExamType = cycle?.examType ?? reportExamType;
          } catch {
            // The values supplied by the dashboard remain a safe fallback.
          }
        }
        const slipSubjects = subjects.filter(
          (s) =>
            (s?.enrollmentMode === "ELECTIVE" &&
              slip?.enrolledSubjects?.includes(s.id)) ||
            s?.enrollmentMode === "COMPULSORY",
        );
        // A report slip must show the actual marks from each assessment in the
        // term. Fetching these at download time also keeps older reports intact
        // when the school moves to a new assessment cycle.
        const allAssessmentPeriods = [
          { apiValue: "OPENER", label: "OPENER" },
          { apiValue: "MIDTERM", label: "MID TERM" },
          { apiValue: "ENDTERM", label: "END OF TERM" },
        ];
        const normalizedExamType = String(reportExamType || "OPENER")
          .replace(/[^a-z]/gi, "")
          .toUpperCase();
        const activePeriodIndex = allAssessmentPeriods.findIndex(
          (period) => period.apiValue === normalizedExamType,
        );
        // Only completed assessments can contribute to a development trend.
        // The active assessment remains the only score used in totals, points
        // and class ranking elsewhere in this report.
        const assessmentPeriods = allAssessmentPeriods.slice(
          0,
          activePeriodIndex >= 0 ? activePeriodIndex + 1 : 1,
        );
        console.log("[ReportSlip] Downloading for:", slip.fullName, "term:", term, "year:", year, "examType:", examType, "classGrade:", classGrade, "classStream:", classStream, "studentId:", slip.studentId || slip.userId);
        console.log("[ReportSlip] Assessment periods to fetch:", assessmentPeriods.map(p => p.label));
        console.log("[ReportSlip] Subjects:", slipSubjects.map(s => ({ id: getSubId(s.id || s._id), name: s.name })));
        const historyResponses = await Promise.all(
          slipSubjects.flatMap((subject) =>
            assessmentPeriods.map(async (period) => {
              const subjectId = getSubId(subject.id || subject._id);
              if (!subjectId) return null;
              try {
                const query = new URLSearchParams({
                  subjectId,
                  classGrade,
                  classStream,
                  term: String(reportTerm),
                  year: String(reportYear),
                  examType: period.apiValue,
                });
                const url = `/marks?${query.toString()}`;
                console.log(`[ReportSlip] Fetching ${period.label} marks:`, url);
                const rows = await request<any[]>(url);
                console.log(`[ReportSlip] ${period.label} response:`, rows?.length || 0, "rows");
                const row = (Array.isArray(rows) ? rows : []).find(
                  (item) => String(item.studentId) === String(slip.studentId || slip.userId),
                );
                const raw = row?.avgPercentage ?? row?.finalScore ?? row?.totalMarks;
                const score = raw == null ? null : Number(String(raw).replace("%", ""));
                console.log(`[ReportSlip] ${period.label} score for ${slip.fullName}:`, score);
                return { subjectId, label: period.label, score: Number.isFinite(score) ? score : null };
              } catch (err) {
                console.error(`[ReportSlip] Error fetching ${period.label}:`, err);
                return null;
              }
            }),
          ),
        );
        const historicalMarks = new Map<string, Map<string, number | null>>();
        historyResponses.filter(Boolean).forEach((item: any) => {
          const periods = historicalMarks.get(item.subjectId) || new Map<string, number | null>();
          periods.set(item.label, item.score);
          historicalMarks.set(item.subjectId, periods);
        });
        const doc = buildStudentReportSlipPdf({
          studentName: slip.fullName,
          admissionNo:
            slip.adm || slip.admissionNumber || slip.admissionNo || "-",
          classLabel: [`Grade ${slip.grade || ""}`.trim(), slip.stream]
            .filter(Boolean)
            .join(" "),
          term: reportTerm,
          year: reportYear,
          examType: reportExamType,
          rank: slip.rank,
          rankingLabel:
            rankingMode === "total_marks" ? "Total Marks" : "Total Points",
          schoolName: schoolProfile.schoolName,
          schoolAddress: schoolProfile.schoolAddress,
          schoolEmail: schoolProfile.schoolEmail,
          phoneNumber: schoolProfile.phoneNumber,
          motto: schoolProfile.motto,
          gradingScale: cbcBands.map((band) => ({
            grade: band.grade,
            minScore: band.minScore,
            maxScore: band.maxScore,
            points: band.points,
          })),
          subjects: slipSubjects.map((subject) => {
            const subjectId = getSubId(subject.id || subject._id);
            const mark = slip.metrics.marks[subjectId];
            const resolved =
              mark != null ? resolveCbcBand(mark, cbcBands) : null;
            const currentSubjectMarks = rankedStudents
              .map((student) => ({
                student,
                mark: student.metrics.marks[subjectId],
              }))
              .filter((item) => typeof item.mark === "number")
              .sort((left, right) => right.mark - left.mark);
            const subjectPosition = currentSubjectMarks.findIndex(
              (item) => String(item.student.studentId || item.student.userId) === String(slip.studentId || slip.userId),
            );
            const assessments = assessmentPeriods.map((period) => ({
              label: period.label,
              marks: historicalMarks.get(subjectId)?.get(period.label),
            }));
            return {
              subject: subject.name,
              marks: mark != null ? `${mark}%` : "-",
              cbcBand: resolved?.cbcBand || "-",
              points: resolved?.points ?? "-",
              assessments,
              rank: subjectPosition >= 0 ? subjectPosition + 1 : "-",
              rankTotal: currentSubjectMarks.length,
              teacher: subject.teacherName || subject.teacher || subject.assignedTeacherName || "-",
              remark:
                mark != null
                  ? remarksBySubject[
                      getSubId(subject.subjectId || subject.id)
                    ]?.[
                      resolved?.cbcBand || ""
                    ] || getSubjectRemark(mark, cbcBands)
                  : "-",
            };
          }),
          totalMarks: slip.metrics.totalMarks,
          totalPoints: slip.metrics.totalPoints,
        });
        doc.save(`${slip.fullName.replace(/\s+/g, "_")}_CBC_Report.pdf`);
      }
      setMsg({
        text: `Successfully downloaded ${type}${studentName ? ` for ${studentName}` : ""}`,
        type: "success",
      });
    } catch (_err) {
      setMsg({ text: `Failed to download ${type}`, type: "error" });
      console.log(_err);
      
    }
    setTimeout(() => setMsg(null), 3500);
  };

  return (
    <div className="ct-anim" style={{ display: "grid", gap: 30 }}>
      <SectionHeader
        eyebrow="Reports"
        title="Results & reports"
        sub={`Download and review CBC summaries for Term ${term}, ${year} (${examType}).`}
      />

      {marksLoading && (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            color: C.textMuted,
            fontFamily: FONT.sans,
            fontSize: 13,
          }}
        >
          Loading marks data...
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div />
        <button
          onClick={handleSendWhatsappMarks}
          disabled={!classGrade || !classStream || isSendingWhatsapp}
          style={{
            padding: "11px 18px",
            borderRadius: 10,
            border: "none",
            background: "var(--gold)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            cursor:
              !classGrade || !classStream || isSendingWhatsapp
                ? "not-allowed"
                : "pointer",
            opacity:
              !classGrade || !classStream || isSendingWhatsapp ? 0.55 : 1,
          }}
        >
          {isSendingWhatsapp ? "Queueing..." : "Send WhatsApp marks"}
        </button>
      </div>

      {msg && (
        <div
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            background: msg.type === "success" ? "#eaf3de" : "#fdeaea",
            color: msg.type === "success" ? "#3b6d11" : "#a32d2d",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {msg.text}
        </div>
      )}

      {/* Ranking Mode Selector */}
      <div
        style={{
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          padding: "1rem 1.4rem",
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontFamily: FONT.sans,
            fontSize: 13,
            fontWeight: 700,
            color: C.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Ranking Basis:
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          {(
            [
              ["total_points", "Total Points"],
              ["total_marks", "Total Marks"],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setRankingMode(val)}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: `2px solid ${rankingMode === val ? C.gold : C.border}`,
                background: rankingMode === val ? C.gold : C.sand,
                color: rankingMode === val ? "#fff" : C.text,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.18s",
                fontFamily: FONT.sans,
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <span
          style={{ fontSize: 12, color: C.textMuted, fontFamily: FONT.sans }}
        >
          {rankingMode === "total_marks"
            ? "Students ranked by sum of percentage marks across their subjects."
            : "Students ranked by sum of CBC points across their subjects."}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {[
          "Full class report",
          "Individual result slips",
          "Subject summary",
        ].map((title) => (
          <div
            key={title}
            style={{
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: "1.4rem",
            }}
          >
            <h3
              style={{
                fontFamily: FONT.serif,
                fontSize: "1.15rem",
                fontWeight: 600,
                color: C.text,
                marginTop: 0,
              }}
            >
              {title}
            </h3>
            <p
              style={{
                fontFamily: FONT.sans,
                fontSize: 13,
                color: C.textMuted,
                lineHeight: 1.6,
              }}
            >
              Subject CBC bands, points, and totals for configured subjects.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="ct-actionbtn"
                onClick={() =>
                  handleDownload(
                    title === "Individual result slips"
                      ? title
                      : "Excel Report",
                  )
                }
                style={{
                  flex: 1,
                  padding: "9px 12px",
                  background: C.sand,
                  border: `1px solid ${C.border}`,
                  borderRadius: 9,
                  cursor: "pointer",
                }}
              >
                <DlIcon />{" "}
                {title === "Individual result slips" ? "Download PDF" : "Excel"}
              </button>
              {title !== "Individual result slips" && (
                <button
                  className="ct-actionbtn"
                  onClick={() => handleDownload(title)}
                  style={{
                    flex: 1,
                    padding: "9px 12px",
                    background: C.white,
                    border: `1px solid ${C.border}`,
                    borderRadius: 9,
                    cursor: "pointer",
                  }}
                >
                  <DlIcon /> PDF
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {topStudent && leastStudent && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {(
            [
              [`Top Student`, topStudent, C.greenLight, C.green],
              [
                `Lowest ${rankingMode === "total_marks" ? "Total Marks" : "Total Points"}`,
                leastStudent,
                "#fdeaea",
                C.dangerText,
              ],
            ] as any[]
          ).map(([label, student, bg, color]: any) => (
            <div
              key={label}
              style={{
                background: bg,
                border: `1px solid ${color}`,
                padding: 16,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Avatar name={student.fullName} size={40} />
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    fontWeight: 700,
                    color,
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </p>
                <h4
                  style={{
                    margin: "2px 0",
                    fontSize: 16,
                    color: C.text,
                    fontFamily: FONT.serif,
                  }}
                >
                  {student.fullName}
                </h4>
                <p style={{ margin: 0, fontSize: 13, color: C.textMuted }}>
                  Points: <strong>{student.metrics.totalPoints}</strong>
                  {rankingMode === "total_marks" && (
                    <>
                      {" "}
                      | Marks: <strong>{student.metrics.totalMarks}</strong>
                    </>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          background: C.white,
          border: `2px solid ${C.text}`,
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            padding: "18px 24px",
            borderBottom: `2px solid ${C.text}`,
            background: "#f8f9fa",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: FONT.serif,
                fontSize: "1.4rem",
                fontWeight: 700,
                color: C.text,
                margin: 0,
              }}
            >
              CBC Performance Index
            </h3>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 12,
                color: C.textMuted,
                fontFamily: FONT.sans,
              }}
            >
              Ranked by:{" "}
              <strong>
                {rankingMode === "total_marks" ? "Total Marks" : "Total Points"}
              </strong>
              {onViewStudent && (
                <>
                  {" "}
                  | <em>Click any student row to view detailed performance</em>
                </>
              )}
            </p>
          </div>
          <button
            onClick={() => handleDownload("Full Merit List")}
            className="ct-actionbtn"
            style={{
              padding: "8px 16px",
              background: C.text,
              border: "none",
              borderRadius: 8,
              color: C.white,
              cursor: "pointer",
            }}
          >
            <DlIcon /> Export CBC Report
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 920 }}
          >
            <thead>
              <tr
                style={{
                  background: "#f1f3f5",
                  borderBottom: `2px solid ${C.text}`,
                }}
              >
                <th style={thStyle}>Rank</th>
                <th
                  style={{
                    ...thStyle,
                    position: "sticky",
                    left: 0,
                    top: 0,
                    background: "#f1f3f5",
                    zIndex: 10,
                    boxShadow:
                      "2px 0 5px rgba(0,0,0,0.05), inset 0 -1px 0 var(--borderL)",
                  }}
                >
                  Student Name
                </th>
                {subjects.map((subject) => (
                  <th
                    key={subject.id}
                    style={{ ...thStyle, textAlign: "center" }}
                  >
                    {subject.name.slice(0, 3).toUpperCase()}
                  </th>
                ))}
                <th
                  style={{
                    ...thStyle,
                    textAlign: "center",
                    background: "#333",
                    color: "#fff",
                  }}
                >
                  T.Pts
                </th>
                <th
                  style={{
                    ...thStyle,
                    textAlign: "center",
                    background: rankingMode === "total_marks" ? C.gold : "#333",
                    color: "#fff",
                  }}
                >
                  T.Marks
                </th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rankedStudents.map((student) => (
                  <tr
                    key={student.studentId}
                    style={{
                      borderBottom: `1px solid ${C.border}`,
                      cursor: onViewStudent ? "pointer" : "default",
                      transition: "background 0.15s",
                    }}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).tagName !== "BUTTON") {
                        onViewStudent?.(student, student.rank);
                      }
                    }}
                    onMouseEnter={(e) => {
                      if (onViewStudent) {
                        e.currentTarget.style.background = "#f8f9fa";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "";
                    }}
                  >
                  <td
                    style={{ ...tdStyle, fontWeight: 700, textAlign: "center" }}
                  >
                    {student.rank}
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      position: "sticky",
                      left: 0,
                      background: C.white,
                      zIndex: 5,
                      boxShadow: "2px 0 5px rgba(0,0,0,0.05)",
                      minWidth: 200,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <Avatar name={student.fullName} size={28} />
                      <span style={{ fontWeight: 700, color: C.text }}>
                        {student.fullName}
                      </span>
                    </div>
                  </td>
                  {subjects.map((subject) => {
                    const mark = isStudentSubject(student, subject)
                      ? student.metrics.marks[getSubId(subject.id)]
                      : null;
                    const resolved =
                      mark != null ? resolveCbcBand(mark, cbcBands) : null;
                    return (
                      <td
                        key={subject.id}
                        style={{ ...tdStyle, textAlign: "center" }}
                      >
                        {mark != null ? (
                          <span
                            style={{
                              color: gradeColor(resolved!.cbcBand),
                              fontWeight: 600,
                            }}
                          >
                            {mark}%
                          </span>
                        ) : (
                          <span style={{ color: C.textFaint }}>-</span>
                        )}
                      </td>
                    );
                  })}
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "center",
                      fontWeight: 900,
                      background:
                        rankingMode === "total_points" ? "#fff9eb" : undefined,
                      color: C.text,
                    }}
                  >
                    {student.metrics.totalPoints}
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "center",
                      fontWeight: 900,
                      background:
                        rankingMode === "total_marks" ? "#fff9eb" : undefined,
                    }}
                  >
                    {student.metrics.totalMarks}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        justifyContent: "flex-end",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() =>
                          handleDownload("Report Slip", student.fullName)
                        }
                        className="ct-pill"
                        style={{
                          padding: "6px 12px",
                          background: gradeBg(""),
                          border: `1px solid ${C.border}`,
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          color: C.textMuted,
                          cursor: "pointer",
                        }}
                      >
                        Print Slip
                      </button>
                      {onViewStudent && (
                        <button
                          onClick={() =>
                            onViewStudent(student, student.rank)
                          }
                          className="ct-pill"
                          style={{
                            padding: "6px 12px",
                            background: C.gold,
                            border: "none",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#fff",
                            cursor: "pointer",
                          }}
                        >
                          View Performance
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
