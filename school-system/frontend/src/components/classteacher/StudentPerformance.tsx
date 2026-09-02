import React, { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Radar, Doughnut } from "react-chartjs-2";
import { C, FONT } from "./shared/constants";
import {
  gradeBg,
  gradeColor,
  getSubId,
  isStudentSubject,
  marksForStudentSubjects,
  sum,
  sumPoints,
  getSubjectRemark,
  initials,
  avatarBg,
} from "./shared/helpers";
import { resolveCbcBand, useCbcGradingBands } from "../../lib/cbcGrading";
import { ArrowLeft, TrendingUp, Award, Target } from "lucide-react";
import { api, getSchoolId } from "../../lib/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface StudentPerformanceProps {
  student: any;
  subjects: any[];
  classGrade: string;
  classStream: string;
  term?: number;
  year?: number;
  examType?: string;
  rank?: number;
  totalStudents?: number;
  onBack: () => void;
}

const cardStyle: React.CSSProperties = {
  background: C.white,
  border: `1px solid ${C.border}`,
  borderRadius: 14,
  padding: "1.5rem",
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

export const StudentPerformance: React.FC<StudentPerformanceProps> = ({
  student,
  subjects,
  classGrade,
  classStream,
  term = 1,
  year = 2024,
  examType = "opener",
  rank,
  totalStudents,
  onBack,
}) => {
  const { bands: cbcBands } = useCbcGradingBands();
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

  const studentSubjects = useMemo(
    () => subjects.filter((s) => isStudentSubject(student, s)),
    [student, subjects],
  );

  const marks = useMemo(
    () => marksForStudentSubjects(student, studentSubjects),
    [student, studentSubjects],
  );

  const subjectMarks = useMemo(() => {
    return studentSubjects.map((subject) => {
      const sid = getSubId(subject.id);
      const mark = marks[sid];
      const resolved = mark != null ? resolveCbcBand(mark, cbcBands) : null;
      return {
        id: sid,
        subjectId: getSubId(subject.subjectId || subject.id),
        name: subject.name,
        mark: mark ?? null,
        cbcBand: resolved?.cbcBand || "-",
        points: resolved?.points ?? 0,
        remark:
          mark != null
            ? remarksBySubject[
                getSubId(subject.subjectId || subject.id)
              ]?.[resolved?.cbcBand || ""] ||
              getSubjectRemark(mark, cbcBands)
            : "-",
      };
    });
  }, [studentSubjects, marks, cbcBands, remarksBySubject]);

  const totalMarks = useMemo(() => sum(marks), [marks]);
  const totalPoints = useMemo(() => sumPoints(marks, cbcBands), [marks, cbcBands]);
  const averageMark = useMemo(() => {
    const marksList = Object.values(marks).filter(
      (v): v is number => typeof v === "number",
    );
    if (marksList.length === 0) return 0;
    return Math.round(marksList.reduce((a, b) => a + b, 0) / marksList.length);
  }, [marks]);

  const bandDistribution = useMemo(() => {
    const dist = { EE: 0, ME: 0, AE: 0, BE: 0 };
    subjectMarks.forEach((s) => {
      const prefix = String(s.cbcBand).slice(0, 2).toUpperCase();
      if (prefix in dist) {
        dist[prefix as keyof typeof dist]++;
      }
    });
    return dist;
  }, [subjectMarks]);

  const barChartData = useMemo(
    () => ({
      labels: subjectMarks.map((s) => s.name),
      datasets: [
        {
          label: "Marks (%)",
          data: subjectMarks.map((s) => s.mark ?? 0),
          backgroundColor: subjectMarks.map((s) =>
            gradeColor(s.cbcBand),
          ),
          borderColor: subjectMarks.map((s) =>
            gradeColor(s.cbcBand),
          ),
          borderWidth: 1,
          borderRadius: 6,
          barPercentage: 0.7,
        },
      ],
    }),
    [subjectMarks],
  );

  const barChartOptions: React.ComponentProps<typeof Bar>["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: "#1a1a1a",
        titleFont: { family: FONT.sans, size: 13 },
        bodyFont: { family: FONT.sans, size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          afterLabel: (ctx: any) => {
            const s = subjectMarks[ctx.dataIndex];
            return [`Band: ${s.cbcBand}`, `Points: ${s.points}`, `Remark: ${s.remark}`];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: {
          font: { family: FONT.sans, size: 11 },
          color: "#888",
          callback: (value: any) => `${value}%`,
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { family: FONT.sans, size: 11 },
          color: "#555",
          maxRotation: 45,
        },
      },
    },
  };

  const radarChartData = useMemo(
    () => ({
      labels: subjectMarks.map((s) => s.name.slice(0, 8)),
      datasets: [
        {
          label: "Performance",
          data: subjectMarks.map((s) => s.mark ?? 0),
          fill: true,
          backgroundColor: "rgba(201, 150, 61, 0.15)",
          borderColor: "rgba(201, 150, 61, 0.8)",
          pointBackgroundColor: "rgba(201, 150, 61, 1)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 4,
        },
      ],
    }),
    [subjectMarks],
  );

  const radarChartOptions: React.ComponentProps<typeof Radar>["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.parsed.r}%`,
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          backdropColor: "transparent",
          font: { size: 10 },
        },
        grid: { color: "rgba(0,0,0,0.08)" },
        angleLines: { color: "rgba(0,0,0,0.08)" },
        pointLabels: {
          font: { family: FONT.sans, size: 11 },
          color: "#555",
        },
      },
    },
  };

  const doughnutData = useMemo(
    () => ({
      labels: ["EE", "ME", "AE", "BE"],
      datasets: [
        {
          data: [
            bandDistribution.EE,
            bandDistribution.ME,
            bandDistribution.AE,
            bandDistribution.BE,
          ],
          backgroundColor: [
            "#1D9E75",
            "#185FA5",
            "#BA7517",
            "#993C1D",
          ],
          borderColor: "#fff",
          borderWidth: 3,
        },
      ],
    }),
    [bandDistribution],
  );

  const doughnutOptions: React.ComponentProps<typeof Doughnut>["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: { family: FONT.sans, size: 12 },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.label}: ${ctx.parsed} subject(s)`,
        },
      },
    },
  };

  return (
    <div className="ct-anim" style={{ display: "grid", gap: 24 }}>
      <button
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 16px",
          background: C.sand,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          cursor: "pointer",
          fontFamily: FONT.sans,
          fontSize: 13,
          fontWeight: 600,
          color: C.textMuted,
          width: "fit-content",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = C.border;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = C.sand;
        }}
      >
        <ArrowLeft size={16} />
        Back to Results
      </button>

      <SectionHeader
        eyebrow="Student Performance"
        title={student.fullName}
        sub={`Term ${term}, ${year} (${examType}) | Grade ${classGrade} ${classStream}`}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: 24,
          ...cardStyle,
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: avatarBg(student.fullName),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontFamily: FONT.sans,
            fontWeight: 700,
            fontSize: 28,
          }}
        >
          {initials(student.fullName)}
        </div>
        <div>
          <h3
            style={{
              fontFamily: FONT.serif,
              fontSize: "1.6rem",
              fontWeight: 600,
              color: C.text,
              margin: "0 0 4px",
            }}
          >
            {student.fullName}
          </h3>
          <p
            style={{
              fontFamily: FONT.sans,
              fontSize: 13,
              color: C.textMuted,
              margin: "0 0 8px",
            }}
          >
            ADM:{" "}
            <strong>
              {student.adm ||
                student.admissionNumber ||
                student.admissionNo ||
                "-"}
            </strong>
            {" | "}
            Gender: <strong>{student.gender || "-"}</strong>
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {student.status && (
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: 20,
                  background: student.status === "active" ? "#eaf7f1" : "#faece7",
                  color: student.status === "active" ? "#1D9E75" : "#993C1D",
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: FONT.sans,
                  textTransform: "uppercase",
                }}
              >
                {student.status}
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
        }}
      >
        {[
          {
            label: "Total Points",
            value: totalPoints,
            icon: <Award size={18} />,
            color: C.gold,
            bg: "#fff9eb",
          },
          {
            label: "Total Marks",
            value: totalMarks,
            icon: <TrendingUp size={18} />,
            color: "#185FA5",
            bg: "#edf5fc",
          },
          {
            label: "Average",
            value: `${averageMark}%`,
            icon: <Target size={18} />,
            color: "#1D9E75",
            bg: "#eaf7f1",
          },
          {
            label: "Rank",
            value:
              rank != null && totalStudents
                ? `${rank} of ${totalStudents}`
                : rank ?? "-",
            icon: <Award size={18} />,
            color: "#993C1D",
            bg: "#faece7",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              ...cardStyle,
              background: stat.bg,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: "rgba(255,255,255,0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: stat.color,
              }}
            >
              {stat.icon}
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontFamily: FONT.sans,
                }}
              >
                {stat.label}
              </p>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: stat.color,
                  fontFamily: FONT.serif,
                }}
              >
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: 20,
        }}
      >
        <div style={cardStyle}>
          <h4
            style={{
              fontFamily: FONT.serif,
              fontSize: "1.2rem",
              fontWeight: 600,
              color: C.text,
              margin: "0 0 16px",
            }}
          >
            Subject Performance
          </h4>
          <div style={{ height: 320 }}>
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        <div style={cardStyle}>
          <h4
            style={{
              fontFamily: FONT.serif,
              fontSize: "1.2rem",
              fontWeight: 600,
              color: C.text,
              margin: "0 0 16px",
            }}
          >
            Performance Radar
          </h4>
          <div style={{ height: 320 }}>
            <Radar data={radarChartData} options={radarChartOptions} />
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 20,
        }}
      >
        <div style={cardStyle}>
          <h4
            style={{
              fontFamily: FONT.serif,
              fontSize: "1.2rem",
              fontWeight: 600,
              color: C.text,
              margin: "0 0 16px",
            }}
          >
            CBC Band Distribution
          </h4>
          <div style={{ height: 260 }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        <div style={cardStyle}>
          <h4
            style={{
              fontFamily: FONT.serif,
              fontSize: "1.2rem",
              fontWeight: 600,
              color: C.text,
              margin: "0 0 16px",
            }}
          >
            Subject Breakdown
          </h4>
          <div
            style={{
              maxHeight: 260,
              overflowY: "auto",
              display: "grid",
              gap: 8,
            }}
          >
            {subjectMarks.map((s) => (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: gradeBg(s.cbcBand),
                  border: `1px solid ${gradeColor(s.cbcBand)}20`,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    fontFamily: FONT.sans,
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.text,
                  }}
                >
                  {s.name}
                </div>
                <div
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 14,
                    fontWeight: 800,
                    color: gradeColor(s.cbcBand),
                  }}
                >
                  {s.mark != null ? `${s.mark}%` : "-"}
                </div>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 12,
                    background: gradeColor(s.cbcBand),
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: FONT.sans,
                  }}
                >
                  {s.cbcBand}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <h4
          style={{
            fontFamily: FONT.serif,
            fontSize: "1.2rem",
            fontWeight: 600,
            color: C.text,
            margin: "0 0 16px",
          }}
        >
          Detailed Results Table
        </h4>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.text}` }}>
                {["Subject", "Marks", "CBC Band", "Points", "Remark"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontFamily: FONT.sans,
                        fontSize: 11,
                        fontWeight: 700,
                        color: C.textFaint,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {subjectMarks.map((s) => (
                <tr
                  key={s.id}
                  style={{ borderBottom: `1px solid ${C.border}` }}
                >
                  <td
                    style={{
                      padding: "12px 16px",
                      fontFamily: FONT.sans,
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.text,
                    }}
                  >
                    {s.name}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontFamily: FONT.sans,
                      fontSize: 13,
                      fontWeight: 700,
                      color: s.mark != null ? gradeColor(s.cbcBand) : C.textFaint,
                    }}
                  >
                    {s.mark != null ? `${s.mark}%` : "-"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: 12,
                        background: gradeBg(s.cbcBand),
                        color: gradeColor(s.cbcBand),
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: FONT.sans,
                      }}
                    >
                      {s.cbcBand}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontFamily: FONT.sans,
                      fontSize: 13,
                      fontWeight: 700,
                      color: C.text,
                    }}
                  >
                    {s.points}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontFamily: FONT.sans,
                      fontSize: 12,
                      color: C.textMuted,
                    }}
                  >
                    {s.remark}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: `2px solid ${C.text}`, background: "#f8f9fa" }}>
                <td
                  style={{
                    padding: "12px 16px",
                    fontFamily: FONT.sans,
                    fontSize: 13,
                    fontWeight: 800,
                    color: C.text,
                  }}
                >
                  TOTAL / AVERAGE
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    fontFamily: FONT.sans,
                    fontSize: 13,
                    fontWeight: 800,
                    color: C.text,
                  }}
                >
                  {averageMark}%
                </td>
                <td style={{ padding: "12px 16px" }}>—</td>
                <td
                  style={{
                    padding: "12px 16px",
                    fontFamily: FONT.sans,
                    fontSize: 14,
                    fontWeight: 800,
                    color: C.gold,
                  }}
                >
                  {totalPoints}
                </td>
                <td style={{ padding: "12px 16px" }}>—</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
