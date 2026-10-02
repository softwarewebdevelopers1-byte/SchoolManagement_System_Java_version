import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { request, ApiError } from "../lib/api";
import {
  friendlyErrorMessage,
  useNotifications,
} from "./shared/notifications/NotificationContext";
import "./StudentResults.css";

type Result = {
  school: {
    name: string;
    email?: string;
    motto?: string;
    phone?: string;
    logoUrl?: string;
  };
  student: {
    name: string;
    studentId?: string;
    grade?: string;
    className?: string;
    overallAverage?: number;
    overallGrade?: string;
    position?: number;
    totalStudents?: number;
  };
  term: {
    name: string;
    startDate?: string;
    endDate?: string;
    examType?: string;
    previousExamType?: string;
  };
  subjects: Array<{
    id: string;
    name: string;
    score?: number;
    maxScore?: number;
    grade?: string;
    points?: number;
    teacher?: string;
    remarks?: string;
    previousScore?: number;
    difference?: number;
  }>;
  summary: {
    totalMarks?: number;
    average?: number;
    overallGrade?: string;
  };
  attendance?: {
    present: number;
    absent: number;
    late: number;
    totalDays: number;
  };
  teacherComment?: string;
  principalComment?: string;
  nextTermBegins?: string;
};

type ResultErrorKind =
  "expired" | "invalid" | "unavailable" | "server" | "network";

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString() : "Not available";

const getErrorKind = (reason: unknown): ResultErrorKind => {
  if (reason instanceof ApiError) {
    if (reason.status === 410) return "expired";
    if (reason.status === 404) {
      const message = String(
        reason.data?.message || reason.message,
      ).toLowerCase();
      return message.includes("published") || message.includes("available")
        ? "unavailable"
        : "invalid";
    }
    if (reason.status >= 500) return "server";
    if (
      reason.status === 400 ||
      reason.status === 401 ||
      reason.status === 403
    ) {
      return "invalid";
    }
    return "server";
  }
  return reason instanceof TypeError ? "network" : "server";
};

const errorContent: Record<
  ResultErrorKind,
  { title: string; message: string }
> = {
  expired: {
    title: "Results link expired",
    message:
      "This results link is no longer valid. Please request a new results link from the school.",
  },
  invalid: {
    title: "Invalid results link",
    message:
      "This results link is invalid or no longer available. Please contact the school for assistance.",
  },
  unavailable: {
    title: "Results not available yet",
    message:
      "The student's results have not been published yet. Please check again later or contact the school.",
  },
  server: {
    title: "Unable to load results",
    message:
      "We are unable to load the results right now. Please try again later.",
  },
  network: {
    title: "Unable to connect",
    message:
      "We could not connect to the results service. Please check your connection and try again.",
  },
};

const StudentResults = () => {
  const toast = useNotifications();
  const { token: pathToken } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const token = pathToken || searchParams.get("token");
  const [result, setResult] = useState<Result | null>(null);
  const [loadedToken, setLoadedToken] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<ResultErrorKind | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      return;
    }

    request<Result>(`/public/results/${encodeURIComponent(token)}`)
      .then((data) => {
        if (!cancelled) {
          setResult(data);
          setErrorKind(null);
          setLoadedToken(token);
        }
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        setResult(null);
        setErrorKind(getErrorKind(reason));
        setLoadedToken(token);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const loading = Boolean(token) && loadedToken !== token;
  if (loading) {
    return (
      <main className="results-state-page">
        <div className="results-state-card" role="status" aria-live="polite">
          <div className="spinner" />
          <p>Loading student results...</p>
        </div>
      </main>
    );
  }
  if (!token || loadedToken !== token || errorKind || !result) {
    const content =
      errorContent[!token ? "invalid" : errorKind || "unavailable"];
    return (
      <main className="results-state-page">
        <div className="results-state-card" role="alert">
          <div className="error-icon" aria-hidden="true">
            !
          </div>
          <p className="state-eyebrow">EduNex Student Results</p>
          <h1>{content.title}</h1>
          <p>{content.message}</p>
        </div>
      </main>
    );
  }

  const {
    school,
    student,
    term,
    subjects,
    summary,
    attendance,
    teacherComment,
    principalComment,
    nextTermBegins,
  } = result;
  const hasAttendance = attendance && attendance.totalDays > 0;
  const attendanceRate = hasAttendance
    ? (attendance.present / attendance.totalDays) * 100
    : null;
  const downloadResults = async () => {
    const report = document.querySelector<HTMLElement>(".results-container");
    if (!report) {
      toast.error("Unable to find the results report to download.");
      return;
    }

    try {
      const canvas = await html2canvas(report, {
        scale: Math.min(4, Math.max(2, window.devicePixelRatio * 2)),
        useCORS: true,
        backgroundColor: "#fdfbf7",
        ignoreElements: (element) =>
          element.classList.contains("download-controls"),
      });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const imageWidth = pageWidth - margin * 2;
      const pageContentHeight = pageHeight - margin * 2;
      const sourcePageHeight = Math.max(
        1,
        Math.floor((pageContentHeight / imageWidth) * canvas.width),
      );

      for (let sourceY = 0; sourceY < canvas.height; sourceY += sourcePageHeight) {
        if (sourceY > 0) pdf.addPage();
        const sourceHeight = Math.min(sourcePageHeight, canvas.height - sourceY);
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;
        const pageContext = pageCanvas.getContext("2d");
        if (!pageContext) throw new Error("Unable to prepare the results PDF.");
        pageContext.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sourceHeight,
          0,
          0,
          pageCanvas.width,
          pageCanvas.height,
        );
        const pageImageHeight = (sourceHeight * imageWidth) / canvas.width;
        pdf.addImage(
          pageCanvas.toDataURL("image/png"),
          "PNG",
          margin,
          margin,
          imageWidth,
          pageImageHeight,
          undefined,
          "NONE",
        );
      }

      const safeName = student.name.trim().replace(/\s+/g, "_") || "student";
      pdf.save(`${safeName}_Results.pdf`);
      toast.success("Results report downloaded.");
    } catch (error) {
      toast.error(friendlyErrorMessage(error, "Unable to generate the results report."));
    }
  };

  return (
    <main className="results-page">
      <div className="results-container">
        <header className="results-header">
          <div className="school-info">
            {school.logoUrl ? (
              <img className="school-logo" src={school.logoUrl} alt="" />
            ) : (
              <div className="school-logo">📚</div>
            )}
            <div>
              <h1>{school.name || "School"}</h1>
              {school.motto && <p>{school.motto}</p>}
              {(school.email || school.phone) && (
                <small>
                  {[school.email, school.phone].filter(Boolean).join(" · ")}
                </small>
              )}
            </div>
          </div>
          <div className="report-title">
            <h2>Student Report Card</h2>
            <p>{term.name}</p>
            {term.examType && (
              <small>
                {term.examType}
                {term.previousExamType
                  ? ` · compared with ${term.previousExamType}`
                  : " · first published exam"}
              </small>
            )}
          </div>
        </header>

        <section className="student-info-card">
          <div className="student-details">
            <h3>{student.name}</h3>
            <div className="detail-grid">
              {student.studentId && (
                <div className="detail-item">
                  <span className="label">Admission:</span>
                  <span className="value">{student.studentId}</span>
                </div>
              )}
              {student.grade && (
                <div className="detail-item">
                  <span className="label">Grade:</span>
                  <span className="value">{student.grade}</span>
                </div>
              )}
              {student.className && (
                <div className="detail-item">
                  <span className="label">Class:</span>
                  <span className="value">{student.className}</span>
                </div>
              )}
              <div className="detail-item">
                <span className="label">Term:</span>
                <span className="value">{term.name}</span>
              </div>
            </div>
          </div>
          <div className="performance-summary">
            <div className="summary-item">
              <span className="summary-value">
                {(student.overallAverage ?? summary.average ?? 0).toFixed(1)}%
              </span>
              <span className="summary-label">Average</span>
            </div>
            <div className="summary-item">
              <span className="summary-value">
                {student.overallGrade ?? summary.overallGrade ?? "-"}
              </span>
              <span className="summary-label">Grade</span>
            </div>
            {student.position && (
              <div className="summary-item">
                <span className="summary-value">
                  {student.position}/{student.totalStudents ?? "-"}
                </span>
                <span className="summary-label">Position</span>
              </div>
            )}
          </div>
        </section>

        <section className="subjects-section">
          <h3 className="section-title">Subject Results</h3>
          <div className="comparison-note">
            {term.previousExamType
              ? `Performance difference compared with ${term.previousExamType}`
              : "No previous published examination is available for comparison"}
          </div>
          <div className="table-responsive">
            <table className="subjects-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Teacher</th>
                  <th>Score</th>
                  <th>Grade</th>
                  <th>Points</th>
                  <th>Previous</th>
                  <th>Difference</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject.id}>
                    <td>{subject.name || "Subject unavailable"}</td>
                    <td>{subject.teacher || "Not assigned"}</td>
                    <td>
                      {subject.score ?? "-"}/{subject.maxScore ?? 100}
                    </td>
                    <td>{subject.grade || "-"}</td>
                    <td>{subject.points ?? "-"}</td>
                    <td>{subject.previousScore ?? "N/A"}</td>
                    <td
                      className={
                        subject.difference == null
                          ? ""
                          : subject.difference > 0
                            ? "difference-positive"
                            : subject.difference < 0
                              ? "difference-negative"
                              : "difference-neutral"
                      }
                    >
                      {subject.difference == null
                        ? "N/A"
                        : `${subject.difference > 0 ? "+" : ""}${subject.difference}`}
                    </td>
                    <td>{subject.remarks || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="attendance-section">
          <h3 className="section-title">Attendance</h3>
          {hasAttendance ? (
            <div className="attendance-grid">
              <div className="attendance-card present">
                <span className="attendance-value">{attendance.present}</span>
                <span className="attendance-label">Present</span>
              </div>
              <div className="attendance-card absent">
                <span className="attendance-value">{attendance.absent}</span>
                <span className="attendance-label">Absent</span>
              </div>
              <div className="attendance-card late">
                <span className="attendance-value">{attendance.late}</span>
                <span className="attendance-label">Late</span>
              </div>
              <div className="attendance-card total">
                <span className="attendance-value">{attendance.totalDays}</span>
                <span className="attendance-label">Total days</span>
              </div>
            </div>
          ) : (
            <p>Attendance information is not available for this result.</p>
          )}
          {attendanceRate !== null && (
            <p>Attendance rate: {attendanceRate.toFixed(1)}%</p>
          )}
        </section>

        <section className="comments-section">
          <h3 className="section-title">Overall Performance</h3>
          <p>Total marks: {summary.totalMarks ?? "-"}</p>
          <p>Overall average: {(summary.average ?? 0).toFixed(1)}%</p>
          {teacherComment && <p>Teacher's comment: {teacherComment}</p>}
          {principalComment && <p>Principal's comment: {principalComment}</p>}
          {nextTermBegins && (
            <p>Next term begins: {formatDate(nextTermBegins)}</p>
          )}
        </section>
        <div className="download-controls">
          <button className="btn btn-print" onClick={() => window.print()}>
            Print Report Card
          </button>
          <button className="btn btn-download" onClick={() => void downloadResults()}>
            Download Results
          </button>
        </div>
        <p className="results-footer">
          Academic period: {term.name}
          {term.examType ? ` · ${term.examType}` : ""}
        </p>
      </div>
    </main>
  );
};

export default StudentResults;
