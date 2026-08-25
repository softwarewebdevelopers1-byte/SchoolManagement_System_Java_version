import React, { useCallback, useEffect, useRef, useState } from "react";
import { Avatar } from "./shared/Avatar";
import { C, FONT } from "./shared/constants";
import {
  gradeColor,
  marksForStudentSubjects,
  getSubId,
  sumPoints,
} from "./shared/helpers";
import { resolveCbcBand, useCbcGradingBands } from "../../lib/cbcGrading";
import { api } from "../../lib/api";

interface AnalyticsProps {
  students: any[];
  subjects: any[];
  classGrade: string;
  classStream: string;
  term?: number;
  year?: number;
  examType?: string;
}

const MetricCard: React.FC<{
  label: string;
  value: string;
  note?: string;
  color?: string;
}> = ({ label, value, note, color }) => (
  <div
    style={{
      background: C.white,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      padding: "1.3rem 1.4rem",
      borderTop: `3px solid ${color || C.gold}`,
    }}
  >
    <p
      style={{
        fontFamily: FONT.sans,
        fontSize: 11.5,
        fontWeight: 600,
        color: C.textMuted,
        margin: "0 0 8px",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {label}
    </p>
    <p
      style={{
        fontFamily: FONT.serif,
        fontSize: "2.1rem",
        fontWeight: 600,
        color: C.text,
        margin: "0 0 6px",
        lineHeight: 1,
      }}
    >
      {value}
    </p>
    {note && (
      <p
        style={{
          fontFamily: FONT.sans,
          fontSize: 12,
          color: C.textFaint,
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {note}
      </p>
    )}
  </div>
);

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

const SubjectAverageChart: React.FC<{
  data: Array<{ id: string; name: string; avg: number }>;
  bands: any[];
}> = ({ data, bands }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = 280;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);
    const pad = { left: 42, right: 16, top: 18, bottom: 58 };
    const chartW = width - pad.left - pad.right;
    const chartH = height - pad.top - pad.bottom;
    ctx.strokeStyle = "#e7ddc8";
    ctx.lineWidth = 1;
    ctx.font = "11px system-ui, sans-serif";
    ctx.fillStyle = "#8b8170";
    [0, 25, 50, 75, 100].forEach((tick) => {
      const y = pad.top + chartH - (tick / 100) * chartH;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(width - pad.right, y);
      ctx.stroke();
      ctx.fillText(String(tick), 8, y + 4);
    });
    const barW = Math.max(18, chartW / Math.max(data.length, 1) - 14);
    data.forEach((item, index) => {
      const x = pad.left + index * (chartW / Math.max(data.length, 1)) + 7;
      const h = (Math.max(0, Math.min(100, item.avg)) / 100) * chartH;
      const y = pad.top + chartH - h;
      ctx.fillStyle = gradeColor(resolveCbcBand(item.avg, bands).cbcBand);
      ctx.fillRect(x, y, barW, h);
      ctx.fillStyle = "#2f2a22";
      ctx.textAlign = "center";
      ctx.fillText(`${item.avg}%`, x + barW / 2, y - 6);
      ctx.save();
      ctx.translate(x + barW / 2, height - 12);
      ctx.rotate(-Math.PI / 5);
      ctx.fillText(item.name.slice(0, 12), 0, 0);
      ctx.restore();
    });
  }, [data, bands]);
  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: 280, display: "block" }}
    />
  );
};

export const Analytics: React.FC<AnalyticsProps> = ({
  students,
  subjects,
  classGrade,
  classStream,
  term = 1,
  year = 2024,
  examType = "opener",
}) => {
  const { bands: cbcBands } = useCbcGradingBands();
  const [studentsWithMarks, setStudentsWithMarks] = useState<any[]>(students);
  const [loadingMarks, setLoadingMarks] = useState(false);

  const loadMarks = useCallback(async () => {
    if (!students.length || !subjects.length) {
      setStudentsWithMarks(students);
      return;
    }   
    setLoadingMarks(true);
    const marksByStudent: Record<string, Record<string, number>> = {};
    await Promise.allSettled(
      subjects.map(async (subject: any) => {
        const subjectId = getSubId(subject?.id || subject?._id);
        if (!subjectId) return;
        const rows: any[] = await api.get("/marks", {
          subjectId,
          classGrade,
          classStream,
          term,
          year,
          examType,
        });
        rows.forEach((row) => {
          const studentId = String(row.studentId || "");
          const raw =
            row.marks?.avgPercentage ??
            row.marks?.finalScore ??
            row.marks?.totalMarks;
          const mark = Number(String(raw ?? "").replace("%", ""));
          if (!studentId || !Number.isFinite(mark)) return;
          marksByStudent[studentId] = marksByStudent[studentId] || {};
          marksByStudent[studentId][subjectId] = mark;
        });
      }),
    );
    setStudentsWithMarks(
      students.map((student) => ({
        ...student,
        marks: {
          ...(student.marks || {}),
          ...(marksByStudent[String(student.id || student.userId)] || {}),
        },
      })),
    );
    setLoadingMarks(false);
  }, [students, subjects, classGrade, classStream, term, year, examType]);

  useEffect(() => {
    void loadMarks();
  }, [loadMarks]);

  if (studentsWithMarks.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: C.textMuted }}>
        No analytics data available.
      </div>
    );
  }

  const subjectAvgs = subjects.map((subject) => {
    const sid = getSubId(subject.id || subject._id);
    const marks = studentsWithMarks
      .filter(
        (student) =>
          marksForStudentSubjects(student, subjects)[sid] !== undefined,
      )
      .map((student) => marksForStudentSubjects(student, subjects)[sid]);
    const total = marks.reduce((a, b) => a + (b || 0), 0);
    return {
      ...subject,
      avg: marks.length > 0 ? Math.round(total / marks.length) : 0,
    };
  });

  const studentAvgs = studentsWithMarks
    .map((student) => {
      const studentMarks = marksForStudentSubjects(student, subjects);
      const totalPoints = sumPoints(studentMarks, cbcBands);
      const totalMarks = Object.values(studentMarks).reduce(
        (sum, mark) => sum + (typeof mark === "number" ? mark : 0),
        0,
      );
      return {
        ...student,
        totalMarks,
        points: totalPoints,
      };
    })
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.totalMarks - a.totalMarks ||
        String(a.name).localeCompare(String(b.name)),
    );

  const bestSubject = [...subjectAvgs].sort((a, b) => b.avg - a.avg)[0];
  const scoredLearners = studentAvgs.filter(
    (student) => student.points > 0,
  ).length;

  return (
    <div className="ct-anim">
      <SectionHeader
        eyebrow="Insights"
        title="CBC performance analytics"
        sub={`Grade ${classGrade}${classStream} - Academic Year ${year} - Term ${term}`}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 14,
          marginBottom: "1.6rem",
        }}
      >
        <MetricCard
          label="Scored learners"
          value={loadingMarks ? "..." : `${scoredLearners}`}
          note={`${studentsWithMarks.length} learners enrolled`}
          color={C.successText}
        />
        <MetricCard
          label="Top student"
          value={studentAvgs[0]?.fullName || "N/A"}
          note={studentAvgs[0] ? `${studentAvgs[0].points} pts` : "N/A"}
          color={C.successText}
        />
        <MetricCard
          label="Best subject"
          value={bestSubject?.name.split(" ")[0] || "N/A"}
          note="Subject-level view"
          color={C.gold}
        />
        <MetricCard
          label="Subjects tracked"
          value={`${subjects.length}`}
          note="Subject bands remain on subject marks"
          color={C.warnText}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: "1.4rem",
          }}
        >
          <p
            style={{
              fontFamily: FONT.sans,
              fontSize: 11,
              fontWeight: 700,
              color: C.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: "0 0 1.2rem",
            }}
          >
            Subject averages
          </p>
          <SubjectAverageChart data={subjectAvgs} bands={cbcBands} />
        </div>

        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: "1.4rem",
          }}
        >
          <p
            style={{
              fontFamily: FONT.sans,
              fontSize: 11,
              fontWeight: 700,
              color: C.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: "0 0 1.2rem",
            }}
          >
            Student ranking (Top 10)
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {studentAvgs.slice(0, 10).map((student, index) => (
              <div
                key={student.id}
                style={{ display: "flex", alignItems: "center", gap: 12 }}
              >
                <span
                  style={{
                    fontFamily: FONT.serif,
                    fontSize: 17,
                    fontWeight: 600,
                    color: C.textFaint,
                    width: 22,
                    textAlign: "center",
                  }}
                >
                  {index + 1}
                </span>
                <Avatar name={student.fullName} size={30} />
                <span
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.text,
                    flex: 1,
                  }}
                >
                  {student.fullName}
                </span>
                <span
                  style={{
                    fontFamily: FONT.serif,
                    fontSize: 14,
                    fontWeight: 600,
                    color: C.text,
                    width: 90,
                    textAlign: "right",
                  }}
                >
                  {student.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: "1.4rem",
            gridColumn: "1/-1",
          }}
        >
          <p
            style={{
              fontFamily: FONT.sans,
              fontSize: 11,
              fontWeight: 700,
              color: C.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: "0 0 1.2rem",
            }}
          >
            Subject band distribution
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: 12,
            }}
          >
            {cbcBands.map((band) => {
              const count = subjectAvgs.filter(
                (subject) =>
                  resolveCbcBand(subject.avg, cbcBands).cbcBand === band.grade,
              ).length;
              const color = gradeColor(band.grade);
              return (
                <div
                  key={band.grade}
                  style={{
                    background: `${color}18`,
                    borderRadius: 11,
                    padding: "1rem",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontFamily: FONT.serif,
                      fontSize: "2rem",
                      fontWeight: 600,
                      color,
                      margin: "0 0 2px",
                    }}
                  >
                    {band.grade}
                  </p>
                  <p
                    style={{
                      fontFamily: FONT.serif,
                      fontSize: "1.6rem",
                      fontWeight: 600,
                      color,
                      margin: "0 0 4px",
                    }}
                  >
                    {count}
                  </p>
                  <p
                    style={{
                      fontFamily: FONT.sans,
                      fontSize: 11,
                      color,
                      margin: 0,
                      opacity: 0.8,
                    }}
                  >
                    {band.minScore}-{band.maxScore} marks
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
