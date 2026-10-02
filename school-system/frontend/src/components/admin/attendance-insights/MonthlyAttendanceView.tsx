import React, { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { ChartContainer } from "../../shared/analytics/ChartContainer";
import {
  analyticsGridProps,
  analyticsTooltipProps,
  analyticsXAxisProps,
  analyticsYAxisProps,
} from "../../shared/analytics/chartDefaults";
import { analyticsChartDefaults, analyticsColors } from "../../../lib/analyticsTheme";
import {
  friendlyErrorMessage,
  useNotifications,
} from "../../shared/notifications/NotificationContext";

interface MonthlyAttendanceViewProps {
  classes: { classId: string; name: string }[];
}

const inputStyle: React.CSSProperties = {
  padding: "9px 14px",
  border: "1.5px solid var(--border)",
  borderRadius: 9,
  fontFamily: "var(--sans)",
  fontSize: 13,
  color: "var(--text)",
  background: "var(--cream)",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 13,
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 13px",
  background: "var(--sand)",
  color: "var(--textMut)",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  borderBottom: "2px solid var(--text)",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 13px",
  borderTop: "1px solid var(--borderLight)",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  background: "var(--sand)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  color: "var(--textM)",
  cursor: "pointer",
};

export const MonthlyAttendanceView: React.FC<MonthlyAttendanceViewProps> = ({ classes }) => {
  const toast = useNotifications();
  const [classId, setClassId] = useState(classes[0]?.classId || "");
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [data, setData] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTable, setShowTable] = useState(false);

  const fetchData = async () => {
    if (!classId || !startDate || !endDate) return;
    setLoading(true);
    setError("");
    try {
      const res: any = await api.get(`/admin/attendance-insights/classes/${classId}/attendance/monthly?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`);
      const pageRes = Array.isArray(res) ? res : res?.data || res;
      setData(pageRes?.content || []);
      setTotalPages(pageRes?.totalPages || 1);
      setTotalElements(pageRes?.totalElements || 0);
    } catch (err: any) {
      const message = friendlyErrorMessage(err, "Failed to load attendance.");
      setError(message);
      toast.error(message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [classId, startDate, endDate, page, size]);

  const chartData = data.map((row: any) => ({
    name: row.studentName || "Unknown",
    rate: Number(row.attendancePercentage || 0),
    studentId: row.studentId,
  }));

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <select value={classId} onChange={(e) => { setClassId(e.target.value); setPage(0); }} style={{ ...inputStyle, width: 220 }}>
          {classes.map((c) => (
            <option key={c.classId} value={c.classId}>{c.name}</option>
          ))}
        </select>
        <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(0); }} style={{ ...inputStyle, width: 160 }} />
        <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(0); }} style={{ ...inputStyle, width: 160 }} />
      </div>

      <ChartContainer
        title="Attendance by student"
        subtitle={`Page ${page + 1} of ${totalPages} · ${totalElements} students`}
        height={300}
        loading={loading}
        isEmpty={!loading && !error && data.length === 0}
        emptyMessage="No attendance records were found for this date range."
        error={error || undefined}
        onRetry={() => void fetchData()}
      >
        <BarChart data={chartData} margin={analyticsChartDefaults.margin}>
          <CartesianGrid {...analyticsGridProps} />
          <XAxis
            {...analyticsXAxisProps}
            dataKey="name"
            interval={0}
            angle={-25}
            textAnchor="end"
            height={60}
          />
          <YAxis {...analyticsYAxisProps} domain={[0, 100]} />
          <Tooltip
            {...analyticsTooltipProps}
            formatter={(value: unknown) => [`${value}%`, "Attendance"]}
          />
          <Bar dataKey="rate" name="Attendance %" radius={analyticsChartDefaults.bar.radius}>
            {chartData.map((entry) => {
              const fill =
                entry.rate >= 90
                  ? analyticsColors.success
                  : entry.rate >= 75
                    ? analyticsColors.warning
                    : analyticsColors.danger;
              return <Cell key={entry.studentId} fill={fill} />;
            })}
          </Bar>
        </BarChart>
      </ChartContainer>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--textMut)" }}>
            Page {page + 1} of {totalPages} | {totalElements} students
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={secondaryButtonStyle} disabled={page === 0 || loading} onClick={() => setPage((p) => Math.max(0, p - 1))}>
              Previous
            </button>
            <button style={secondaryButtonStyle} disabled={page >= totalPages - 1 || loading} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}>
              Next
            </button>
          </div>
        </div>
      )}

      {!showTable && !loading && data.length > 0 && (
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <button
            type="button"
            onClick={() => setShowTable(true)}
            style={{
              padding: "10px 22px",
              background: "var(--green)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontFamily: "var(--sans)",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            View Student Records
          </button>
        </div>
      )}

      {showTable && (
        <div style={{ overflowX: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--textMut)" }}>
              Student records
            </span>
            <button
              type="button"
              onClick={() => setShowTable(false)}
              style={{
                padding: "6px 14px",
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontFamily: "var(--sans)",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--textMut)",
                cursor: "pointer",
              }}
            >
              Hide Records
            </button>
          </div>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Student</th>
                <th style={thStyle}>Admission No</th>
                <th style={thStyle}>Total Days</th>
                <th style={thStyle}>Present</th>
                <th style={thStyle}>Absent</th>
                <th style={thStyle}>Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} style={{ ...tdStyle, textAlign: "center", color: "var(--textMut)" }}>Loading...</td>
                </tr>
              )}
              {!loading && data.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ ...tdStyle, textAlign: "center", color: "var(--textMut)" }}>No records found.</td>
                </tr>
              )}
              {data.map((row: any) => (
                <tr key={row.studentId}>
                  <td style={tdStyle}>{row.studentName}</td>
                  <td style={tdStyle}>{row.admissionNo}</td>
                  <td style={tdStyle}>{row.totalDays}</td>
                  <td style={tdStyle}>{row.presentDays}</td>
                  <td style={tdStyle}>{row.absentDays}</td>
                  <td style={tdStyle}>{row.attendancePercentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
