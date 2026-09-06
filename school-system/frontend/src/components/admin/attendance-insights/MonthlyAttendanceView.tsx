import React, { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

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

  useEffect(() => {
    if (!classId || !startDate || !endDate) return;
    setLoading(true);
    setError("");
    (async () => {
      try {
        const res: any = await api.get(`/admin/attendance-insights/classes/${classId}/attendance/monthly?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`);
        const pageRes = Array.isArray(res) ? res : res?.data || res;
        setData(pageRes?.content || []);
        setTotalPages(pageRes?.totalPages || 1);
        setTotalElements(pageRes?.totalElements || 0);
      } catch (err: any) {
        setError(err?.message || "Failed to load monthly attendance.");
        setData([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [classId, startDate, endDate, page, size]);

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

      {error && (
        <div style={{ padding: 12, background: "#fdeaea", color: "#a32d2d", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
          {error}
        </div>
      )}

      {!loading && data.length > 0 && (
        <div
          style={{
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "1.2rem",
          }}
        >
          <p
            style={{
              fontFamily: "var(--sans)",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--textMut)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: "0 0 1rem",
            }}
          >
            Attendance % by student
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data.slice(0, 20).map((row: any) => ({
                name: row.studentName || "Unknown",
                rate: Number(row.attendancePercentage || 0),
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e7ece9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#6d7c74" }}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={60}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "#6d7c74" }}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  fontSize: 12,
                }}
                formatter={(value: any) => [`${value}%`, "Attendance"]}
              />
              <Bar dataKey="rate" name="Attendance %" radius={[6, 6, 0, 0]}>
                {data.slice(0, 20).map((entry: any) => {
                  const rate = Number(entry.attendancePercentage || 0);
                  const fill = rate >= 90 ? "#163325" : rate >= 75 ? "#c9963d" : "#b42318";
                  return <Cell key={entry.studentId} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p style={{ margin: "8px 0 0", fontSize: 11, color: "var(--textMut)" }}>
            Showing first 20 students. Green ≥90%, Amber 75-89%, Red &lt;75%.
          </p>
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
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
    </div>
  );
};
