// components/deputyhead/Analytics.tsx
import React, { useMemo, useState, useEffect } from "react";
import { SectionHeader } from "./shared/SectionHeader";
import { MetricCard } from "./shared/MetricCard";
import { Avatar } from "./shared/Avatar";
import { C, F } from "./shared/constants";
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface AnalyticsProps {
  classes?: any[];
  staff?: any[];
  students?: any[];
  term?: number;
  year?: number;
  overviewStats?: {
    totalStudents?: number;
    totalStaff?: number;
    totalClasses?: number;
    avgAttendanceRate?: number;
    streamPerformance?: { stream: string; avgMarks: number; avgAttendance: number; studentCount: number }[];
    subjectPerformance?: { subjectId: string; subjectName: string; avgPercentage: number; avgPoints: number; gradeDistribution: Record<string, number> }[];
  };
}

export const Analytics: React.FC<AnalyticsProps> = ({ 
  classes = [], 
  staff = [], 
  students = [],
  term = 1,
  year = 2024,
  overviewStats,
}) => {
  const sorted = [...classes].sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  const activeTeachers = staff.filter((t) => t.status === "active" || t.status === "Active").length;

  const [termlyTrend, setTermlyTrend] = useState<any[]>([]);
  const [trendLoading, setTrendLoading] = useState(false);
  const [atRiskData, setAtRiskData] = useState<any[]>([]);
  const [atRiskLoading, setAtRiskLoading] = useState(false);

  const firstGrade = classes[0]?.grade;

  useEffect(() => {
    if (!firstGrade) return;
    const yearStr = String(year || "");
    setTrendLoading(true);
    api.get(`/stats/marks/grade/${encodeURIComponent(firstGrade)}/termly-trend?academicYear=${encodeURIComponent(yearStr)}`)
      .then((data: any) => setTermlyTrend(Array.isArray(data) ? data : []))
      .catch(() => setTermlyTrend([]))
      .finally(() => setTrendLoading(false));
  }, [firstGrade, year]);

  useEffect(() => {
    if (!firstGrade) return;
    const yearStr = String(year || "");
    setAtRiskLoading(true);
    api.get(`/stats/students/at-risk?grade=${encodeURIComponent(firstGrade)}&academicYear=${encodeURIComponent(yearStr)}&threshold=50.0`)
      .then((data: any) => setAtRiskData(Array.isArray(data?.atRiskStudents) ? data.atRiskStudents : []))
      .catch(() => setAtRiskData([]))
      .finally(() => setAtRiskLoading(false));
  }, [firstGrade, year]);

  const termlyData = useMemo(() => {
    return termlyTrend.map((item) => ({
      term: `Term ${item.term}`,
      avg: item.avgPercentage || 0,
    }));
  }, [termlyTrend]);

  const atRiskCount = atRiskData.length;
  const totalStudents = overviewStats?.totalStudents || students.length || 0;
  const highPerformingCount = Math.max(0, totalStudents - atRiskCount);

  // Mock concerns since not in DB yet
  const openConcerns = 0;
  const highPriority = 0;

  return (
    <div className="dh-anim">
      <SectionHeader
        eyebrow="Insights"
        title="Performance analytics"
        sub={`Schoolwide trends · Term ${term}, ${year}`}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
          gap: 13,
          marginBottom: 18,
        }}
      >
        <MetricCard
          label="Class streams"
          value={classes.length}
          note="All streams"
          accent={C.infoText}
        />
        <MetricCard
          label="Active teachers"
          value={activeTeachers}
          note={`${staff.length} on record`}
          accent={C.gold}
        />
        <MetricCard
          label="Students covered"
          value={classes.reduce((sum, item) => sum + Number(item.students || 0), 0)}
          note="Across listed streams"
          accent={C.successText}
        />
        <MetricCard
          label="Open concerns"
          value={openConcerns}
          note="Awaiting response"
          accent={C.dangerText}
        />
      </div>

      {overviewStats?.subjectPerformance && overviewStats.subjectPerformance.length > 0 && (
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 13,
            padding: "1.3rem",
            marginBottom: 14,
          }}
        >
          <p
            style={{
              fontFamily: F.sans,
              fontSize: 10.5,
              fontWeight: 700,
              color: C.textMuted,
              textTransform: "uppercase",
              letterSpacing: ".06em",
              margin: "0 0 1rem",
            }}
          >
            Subject performance
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={overviewStats.subjectPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7ece9" />
              <XAxis
                dataKey="subjectName"
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
              <Legend />
              <Bar dataKey="avgPercentage" name="Avg %" fill={C.infoText} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 13,
            padding: "1.3rem",
          }}
        >
          <p
            style={{
              fontFamily: F.sans,
              fontSize: 10.5,
              fontWeight: 700,
              color: C.textMuted,
              textTransform: "uppercase",
              letterSpacing: ".06em",
              margin: "0 0 1rem",
            }}
          >
            Termly trend
          </p>
          {trendLoading ? (
            <div style={{ padding: "20px", textAlign: "center", color: C.textMuted }}>Loading trend...</div>
          ) : termlyData.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: C.textMuted }}>No termly data available.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={termlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7ece9" />
                <XAxis dataKey="term" tick={{ fontSize: 11, fill: "#6d7c74" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#6d7c74" }} />
                <Tooltip
                  contentStyle={{
                    background: C.white,
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="avg" name="Avg %" stroke={C.gold} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 13,
            padding: "1.3rem",
          }}
        >
          <p
            style={{
              fontFamily: F.sans,
              fontSize: 10.5,
              fontWeight: 700,
              color: C.textMuted,
              textTransform: "uppercase",
              letterSpacing: ".06em",
              margin: "0 0 1rem",
            }}
          >
            At-risk vs high-performing
          </p>
          {atRiskLoading ? (
            <div style={{ padding: "20px", textAlign: "center", color: C.textMuted }}>Loading...</div>
          ) : atRiskData.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: C.textMuted }}>No at-risk data available.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={[
                    { name: "At-risk", value: atRiskCount },
                    { name: "High-performing", value: highPerformingCount },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  <Cell key="at-risk" fill={C.dangerText} />
                  <Cell key="high" fill={C.successText} />
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: C.white,
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Stream ranking */}
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 13,
            padding: "1.3rem",
          }}
        >
          <p
            style={{
              fontFamily: F.sans,
              fontSize: 10.5,
              fontWeight: 700,
              color: C.textMuted,
              textTransform: "uppercase",
              letterSpacing: ".06em",
              margin: "0 0 1rem",
            }}
          >
            Stream ranking
          </p>
          {sorted.map((c, i) => (
            <div
              key={c.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontFamily: F.serif,
                  fontSize: 16,
                  fontWeight: 600,
                  color: C.textFaint,
                  width: 20,
                  textAlign: "center",
                }}
              >
                {i + 1}
              </span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontFamily: F.sans,
                      fontSize: 13,
                      color: C.textMid,
                    }}
                  >
                    {c.name}
                  </span>
                  <span
                    style={{
                      fontFamily: F.serif,
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.textMid,
                    }}
                  >
                    {c.students || 0} learners
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Teacher performance */}
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 13,
            padding: "1.3rem",
          }}
        >
          <p
            style={{
              fontFamily: F.sans,
              fontSize: 10.5,
              fontWeight: 700,
              color: C.textMuted,
              textTransform: "uppercase",
              letterSpacing: ".06em",
              margin: "0 0 1rem",
            }}
          >
            Teacher performance
          </p>
          {staff.map((t) => (
            <div
              key={t.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 11,
              }}
            >
              <Avatar name={t.name} size={28} />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 3,
                  }}
                >
                  <span
                    style={{
                      fontFamily: F.sans,
                      fontSize: 12.5,
                      color: C.text,
                    }}
                  >
                    {t.name.split(" ").slice(-1)[0]}
                  </span>
                  <span
                    style={{
                      fontFamily: F.serif,
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.textMuted,
                    }}
                  >
                    {t.status || "-"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Operational summary */}
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 13,
            padding: "1.3rem",
            gridColumn: "1/-1",
          }}
        >
          <p
            style={{
              fontFamily: F.sans,
              fontSize: 10.5,
              fontWeight: 700,
              color: C.textMuted,
              textTransform: "uppercase",
              letterSpacing: ".06em",
              margin: "0 0 1rem",
            }}
          >
            Operational summary
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: 12,
            }}
          >
            {[
              {
                label: "Active teachers",
                value: activeTeachers,
                bg: C.successBg,
                text: C.successText,
              },
              {
                label: "On leave",
                value: 0,
                bg: C.warnBg,
                text: C.warnText,
              },
              {
                label: "Open concerns",
                value: openConcerns,
                bg: C.dangerBg,
                text: C.dangerText,
              },
              {
                label: "High-priority",
                value: highPriority,
                bg: C.dangerBg,
                text: C.dangerText,
              },
              {
                label: "Total classes",
                value: classes.length,
                bg: C.infoBg,
                text: C.infoText,
              },
              {
                label: "Class streams",
                value: classes.length,
                bg: C.successBg,
                text: C.successText,
              },
            ].map(({ label, value, bg, text }) => (
              <div
                key={label}
                style={{
                  background: bg,
                  borderRadius: 10,
                  padding: "1rem",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontFamily: F.serif,
                    fontSize: "2rem",
                    fontWeight: 600,
                    color: text,
                    margin: "0 0 2px",
                    lineHeight: 1,
                  }}
                >
                  {value}
                </p>
                <p
                  style={{
                    fontFamily: F.sans,
                    fontSize: 11.5,
                    color: text,
                    margin: 0,
                    opacity: 0.85,
                  }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
