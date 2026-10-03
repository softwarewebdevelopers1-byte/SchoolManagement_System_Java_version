import React, { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { ChartContainer } from "../../../components/shared/analytics/ChartContainer";
import { KpiCard } from "../../../components/shared/analytics/KpiCard";
import {
  analyticsLegendProps,
  analyticsTooltipProps,
} from "../../../components/shared/analytics/chartDefaults";
import { analyticsColors } from "../../../lib/analyticsTheme";
import {
  friendlyErrorMessage,
  useNotifications,
} from "../../../components/shared/notifications/NotificationContext";

interface DailyAttendanceViewProps {
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

export const DailyAttendanceView: React.FC<DailyAttendanceViewProps> = ({ classes }) => {
  const toast = useNotifications();
  const [classId, setClassId] = useState(classes[0]?.classId || "");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [records, setRecords] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTable, setShowTable] = useState(false);

  const fetchData = async () => {
    if (!classId || !date) return;
    setLoading(true);
    setError("");
    try {
      const data: any = await api.get(`/admin/attendance-insights/classes/${classId}/attendance/daily?date=${date}&page=${page}&size=${size}`);
      const content = Array.isArray(data) ? data : data?.data || [];
      setRecords(content);
      setTotalPages(data?.totalPages || 1);
      setTotalElements(data?.totalElements || 0);
    } catch (err: any) {
      const message = friendlyErrorMessage(err, "Failed to load daily attendance.");
      setError(message);
      toast.error(message);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setShowTable(false);
    setPage(0);
    fetchData();
  }, [classId, date]);

  const presentCount = records.filter(
    (record) => String(record.status || "").toUpperCase() === "PRESENT",
  ).length;
  const absentCount = records.filter(
    (record) => String(record.status || "").toUpperCase() === "ABSENT",
  ).length;
  const lateCount = records.length - presentCount - absentCount;
  const pieData = [
    { name: "Present", value: presentCount, fill: analyticsColors.success },
    { name: "Absent", value: absentCount, fill: analyticsColors.danger },
    ...(lateCount > 0
      ? [{ name: "Late", value: lateCount, fill: analyticsColors.warning }]
      : []),
  ].filter((item) => item.value > 0);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          style={{ ...inputStyle, width: 220 }}
        >
          {classes.map((c) => (
            <option key={c.classId} value={c.classId}>{c.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ ...inputStyle, width: 180 }}
        />
      </div>

      {!loading && records.length > 0 && (
        <section
          aria-label="Daily attendance counts for the current page"
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 170px), 1fr))",
          }}
        >
          <KpiCard label="Present · current page" value={presentCount} />
          <KpiCard label="Absent · current page" value={absentCount} />
          {lateCount > 0 && <KpiCard label="Other · current page" value={lateCount} />}
        </section>
      )}

      <ChartContainer
        title="Daily attendance status"
        subtitle={`${totalElements} records · ${records.length} shown on this page`}
        height={260}
        loading={loading}
        isEmpty={!loading && !error && records.length === 0}
        emptyMessage="Attendance has not been recorded for this class and date."
        error={error || undefined}
        onRetry={() => void fetchData()}
      >
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={88}
            paddingAngle={3}
          >
            {pieData.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip {...analyticsTooltipProps} />
          <Legend {...analyticsLegendProps} />
        </PieChart>
      </ChartContainer>

      {!showTable && !loading && records.length > 0 && (
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
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} style={{ ...tdStyle, textAlign: "center", color: "var(--textMut)" }}>Loading...</td>
                </tr>
              )}
              {!loading && records.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ ...tdStyle, textAlign: "center", color: "var(--textMut)" }}>No records found.</td>
                </tr>
              )}
              {records.map((r: any) => (
                <tr key={r.studentId}>
                  <td style={tdStyle}>{r.studentName}</td>
                  <td style={tdStyle}>{r.admissionNo}</td>
                  <td style={tdStyle}>{r.status}</td>
                  <td style={tdStyle}>{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
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
        </div>
      )}
    </div>
  );
};
