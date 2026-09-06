import React, { useCallback, useEffect, useState } from "react";
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell,
} from "recharts";

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
  const chartData = data.map((item) => ({
    name: item.name.slice(0, 12),
    avg: Math.max(0, Math.min(100, item.avg)),
    fill: gradeColor(resolveCbcBand(item.avg, bands).cbcBand),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e7ece9" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "#6d7c74" }}
          interval={0}
          angle={-25}
          textAnchor="end"
          height={60}
        />
        <YAxis tick={{ fontSize: 11, fill: "#6d7c74" }} domain={[0, 100]} />
        <Tooltip
          contentStyle={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            fontSize: 12,
          }}
        />
        <Bar dataKey="avg" name="Avg %" radius={[6, 6, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
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
        const response: any = await api.get("/marks", {
          subjectId,
          classGrade,
          classStream,
          term,
          year,
          examType,
        });
        const rows = Array.isArray(response) ? response : response.data || [];
        rows.forEach((row: any) => {
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
            CBC band distribution
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={cbcBands.map((band) => {
                const count = subjectAvgs.filter(
                  (subject) =>
                    resolveCbcBand(subject.avg, cbcBands).cbcBand === band.grade,
                ).length;
                return {
                  band: band.grade,
                  count,
                  fullMark: subjectAvgs.length || 1,
                };
              })}>
                <PolarGrid />
                <PolarAngleAxis
                  dataKey="band"
                  tick={{ fontSize: 12, fill: "#1f2d26" }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, "auto"]}
                  tick={{ fontSize: 11, fill: "#6d7c74" }}
                />
                <Radar
                  name="Subjects"
                  dataKey="count"
                  stroke={C.gold}
                  fill={C.gold}
                  fillOpacity={0.35}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{
                    background: C.white,
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
