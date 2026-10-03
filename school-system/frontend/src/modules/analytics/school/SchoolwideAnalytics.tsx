import React, { useMemo, useState, useEffect } from "react";
import { SectionHeader } from "../../../components/deputyhead/shared/SectionHeader";
import { Avatar } from "../../../components/deputyhead/shared/Avatar";
import { C, F } from "../../../components/deputyhead/shared/constants";
import { api } from "../../../lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { ChartContainer } from "../../../components/shared/analytics/ChartContainer";
import { KpiCard } from "../../../components/shared/analytics/KpiCard";
import {
  analyticsGridProps,
  analyticsLegendProps,
  analyticsTooltipProps,
  analyticsXAxisProps,
  analyticsYAxisProps,
} from "../../../components/shared/analytics/chartDefaults";
import { analyticsChartDefaults, analyticsColors } from "../../../lib/analyticsTheme";

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
  const firstExamType = String(classes[0]?.examType || "OPENER").toUpperCase();

  useEffect(() => {
    if (!firstGrade) return;
    const yearStr = String(year || "");
    setTrendLoading(true);
    api.get(`/stats/marks/grade/${encodeURIComponent(firstGrade)}/termly-trend?academicYear=${encodeURIComponent(yearStr)}&examType=${encodeURIComponent(firstExamType)}`)
      .then((data: any) => setTermlyTrend(Array.isArray(data) ? data : []))
      .catch(() => setTermlyTrend([]))
      .finally(() => setTrendLoading(false));
  }, [firstGrade, firstExamType, year]);

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
  const atRiskChartData = useMemo(
    () =>
      [...atRiskData]
        .sort((first, second) => first.avgPercentage - second.avgPercentage)
        .slice(0, 10)
        .map((student) => ({
          name: student.studentName,
          avgPercentage: student.avgPercentage,
        })),
    [atRiskData],
  );

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
        <KpiCard
          label="Class streams"
          value={classes.length}
        />
        <KpiCard
          label="Active teachers"
          value={activeTeachers}
          unit={`${staff.length} on record`}
        />
        <KpiCard
          label="Students covered"
          value={classes.reduce((sum, item) => sum + Number(item.students || 0), 0)}
        />
        <KpiCard label={`At-risk · Grade ${firstGrade || "—"}`} value={atRiskCount} />
      </div>

      {overviewStats?.subjectPerformance && overviewStats.subjectPerformance.length > 0 && (
        <ChartContainer title="Subject performance" height={260}>
            <BarChart data={overviewStats.subjectPerformance}>
              <CartesianGrid {...analyticsGridProps} />
              <XAxis
                {...analyticsXAxisProps}
                dataKey="subjectName"
                interval={0}
                angle={-25}
                textAnchor="end"
                height={60}
              />
              <YAxis {...analyticsYAxisProps} domain={[0, 100]} />
              <Tooltip {...analyticsTooltipProps} />
              <Legend {...analyticsLegendProps} />
              <Bar
                dataKey="avgPercentage"
                name="Avg %"
                fill={analyticsColors.secondary}
                radius={analyticsChartDefaults.bar.radius}
              />
            </BarChart>
        </ChartContainer>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: 14 }}>
        <ChartContainer
          title="Termly trend"
          height={260}
          loading={trendLoading}
          isEmpty={!trendLoading && termlyData.length === 0}
          emptyMessage="No termly data available."
        >
              <LineChart data={termlyData}>
                <CartesianGrid {...analyticsGridProps} />
                <XAxis {...analyticsXAxisProps} dataKey="term" />
                <YAxis {...analyticsYAxisProps} domain={[0, 100]} />
                <Tooltip {...analyticsTooltipProps} />
                <Legend {...analyticsLegendProps} />
                <Line
                  type="monotone"
                  dataKey="avg"
                  name="Avg %"
                  stroke={analyticsColors.accent}
                  strokeWidth={analyticsChartDefaults.line.strokeWidth}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
        </ChartContainer>
        <ChartContainer
          title={`At-risk students · Grade ${firstGrade || "—"}`}
          height={260}
          loading={atRiskLoading}
          isEmpty={!atRiskLoading && atRiskData.length === 0}
          emptyMessage="No at-risk students in this grade."
        >
              <BarChart data={atRiskChartData} layout="vertical">
                <CartesianGrid {...analyticsGridProps} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fill: analyticsColors.neutral.text, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fill: analyticsColors.neutral.text, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip {...analyticsTooltipProps} />
                <Bar
                  dataKey="avgPercentage"
                  name="Average %"
                  fill={analyticsColors.danger}
                  radius={analyticsChartDefaults.bar.radius}
                />
              </BarChart>
        </ChartContainer>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: 14 }}>
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
                    {(t.name || t.lastName || t.firstName || "Teacher")
                      .split(" ")
                      .slice(-1)[0]}
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
