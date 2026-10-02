import React, { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
import { ChartContainer } from "../shared/analytics/ChartContainer";
import { KpiCard } from "../shared/analytics/KpiCard";
import {
  analyticsGridProps,
  analyticsLegendProps,
  analyticsTooltipProps,
  analyticsXAxisProps,
  analyticsYAxisProps,
} from "../shared/analytics/chartDefaults";
import { analyticsChartDefaults, analyticsColors } from "../../lib/analyticsTheme";

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
  const [periodMarks, setPeriodMarks] = useState<Record<string, number> | null>(
    null,
  );

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

  useEffect(() => {
    let cancelled = false;

    const loadPeriodMarks = async () => {
      if (!student || !studentSubjects.length) {
        setPeriodMarks({});
        return;
      }

      setPeriodMarks({});
      const marksBySubject: Record<string, number> = {};
      const studentId = String(
        student.studentId || student.id || student.userId || "",
      );

      await Promise.allSettled(
        studentSubjects.map(async (subject: any) => {
          const subjectId = getSubId(subject?.id || subject?._id);
          if (!subjectId) return;

          const response: any = await api.get("/marks", {
            subjectId,
            term,
            year,
            examType,
          });
          const rows = Array.isArray(response) ? response : response.data || [];
          const row = rows.find(
            (candidate: any) =>
              String(candidate.studentId || "") === studentId,
          );
          if (!row) return;

          const raw =
            row.avgPercentage ??
            row.totalMarks ??
            row.marks?.avgPercentage ??
            row.marks?.finalScore ??
            row.marks?.totalMarks;
          const mark = Number(String(raw ?? "").replace("%", ""));
          if (Number.isFinite(mark)) {
            marksBySubject[subjectId] = mark;
          }
        }),
      );

      if (!cancelled) {
        setPeriodMarks(marksBySubject);
      }
    };

    void loadPeriodMarks();
    return () => {
      cancelled = true;
    };
  }, [student, studentSubjects, term, year, examType]);

  const marks = useMemo(
    () =>
      periodMarks === null
        ? marksForStudentSubjects(student, studentSubjects)
        : periodMarks,
    [student, studentSubjects, periodMarks],
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

  const bandChartData = useMemo(
    () =>
      [
        { band: "EE", count: bandDistribution.EE },
        { band: "ME", count: bandDistribution.ME },
        { band: "AE", count: bandDistribution.AE },
        { band: "BE", count: bandDistribution.BE },
      ],
    [bandDistribution],
  );

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
            color: analyticsColors.accent,
          },
          {
            label: "Total Marks",
            value: totalMarks,
            icon: <TrendingUp size={18} />,
            color: analyticsColors.secondary,
          },
          {
            label: "Average",
            value: averageMark,
            unit: "%",
            icon: <Target size={18} />,
            color: analyticsColors.success,
          },
          {
            label: "Rank",
            value:
              rank != null && totalStudents
                ? `${rank} of ${totalStudents}`
                : rank ?? "-",
            icon: <Award size={18} />,
            color: analyticsColors.danger,
          },
        ].map((stat) => (
          <KpiCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            unit={"unit" in stat ? stat.unit : undefined}
            icon={<span style={{ color: stat.color }}>{stat.icon}</span>}
          />
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: 20,
        }}
      >
        <ChartContainer
          title="Subject Performance"
          subtitle="Marks by subject"
          height={320}
          isEmpty={subjectMarks.length === 0}
          emptyMessage="No subject marks are available."
        >
          <BarChart data={subjectMarks} margin={analyticsChartDefaults.margin}>
            <CartesianGrid {...analyticsGridProps} />
            <XAxis {...analyticsXAxisProps} dataKey="name" />
            <YAxis
              {...analyticsYAxisProps}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              {...analyticsTooltipProps}
              formatter={(value) => [`${value ?? 0}%`, "Marks"]}
            />
            <Bar dataKey="mark" name="Marks" radius={analyticsChartDefaults.bar.radius}>
              {subjectMarks.map((subject, index) => (
                <Cell
                  key={subject.id}
                  fill={analyticsColors.qualitative[index % analyticsColors.qualitative.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>

        <ChartContainer
          title="Performance Radar"
          subtitle="Marks by subject"
          height={320}
          isEmpty={subjectMarks.length === 0}
          emptyMessage="No subject marks are available."
        >
          <RadarChart
            data={subjectMarks.map((subject) => ({
              ...subject,
              name: subject.name.slice(0, 8),
            }))}
            margin={analyticsChartDefaults.margin}
          >
            <PolarGrid stroke={analyticsColors.neutral.grid} />
            <PolarAngleAxis dataKey="name" tick={{ fill: analyticsColors.neutral.text, fontSize: 11 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={{ fill: analyticsColors.neutral.text, fontSize: 10 }} />
            <Tooltip
              {...analyticsTooltipProps}
              formatter={(value) => [`${value ?? 0}%`, "Performance"]}
            />
            <Radar
              name="Performance"
              dataKey="mark"
              stroke={analyticsColors.accent}
              fill={analyticsColors.accent}
              fillOpacity={analyticsChartDefaults.area.fillOpacity}
            />
          </RadarChart>
        </ChartContainer>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
          gap: 20,
        }}
      >
        <ChartContainer
          title="CBC Band Distribution"
          height={260}
          isEmpty={!subjectMarks.length}
          emptyMessage="No CBC band distribution is available."
        >
          <PieChart margin={analyticsChartDefaults.margin}>
            <Pie
              data={bandChartData}
              dataKey="count"
              nameKey="band"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={2}
            >
              {bandChartData.map((item, index) => (
                <Cell
                  key={item.band}
                  fill={analyticsColors.qualitative[index]}
                />
              ))}
            </Pie>
            <Tooltip
              {...analyticsTooltipProps}
              formatter={(value, name) => [value, `${name} subjects`]}
            />
            <Legend {...analyticsLegendProps} verticalAlign="bottom" align="center" />
          </PieChart>
        </ChartContainer>

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
