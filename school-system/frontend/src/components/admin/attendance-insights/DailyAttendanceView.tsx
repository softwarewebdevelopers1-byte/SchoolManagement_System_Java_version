import React, { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

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
      setError(err?.message || "Failed to load daily attendance.");
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

      {error && (
        <div style={{ padding: 12, background: "#fdeaea", color: "#a32d2d", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
          {error}
        </div>
      )}

      {!loading && records.length > 0 && (() => {
        const presentCount = records.filter((r: any) => String(r.status || "").toUpperCase() === "PRESENT").length;
        const absentCount = records.filter((r: any) => String(r.status || "").toUpperCase() === "ABSENT").length;
        const lateCount = records.length - presentCount - absentCount;
        const pieData = [
          { name: "Present", value: presentCount },
          { name: "Absent", value: absentCount },
          ...(lateCount > 0 ? [{ name: "Late", value: lateCount }] : []),
        ].filter((item) => item.value > 0);

        return (
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
              Daily attendance ratio
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.name === "Present" ? "#163325" : entry.name === "Absent" ? "#b42318" : "#c9963d"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: "#163325", display: "inline-block" }} />
                  <span style={{ fontSize: 13, color: "var(--text)" }}>Present: {presentCount}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: "#b42318", display: "inline-block" }} />
                  <span style={{ fontSize: 13, color: "var(--text)" }}>Absent: {absentCount}</span>
                </div>
                {lateCount > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 12, height: 12, borderRadius: 3, background: "#c9963d", display: "inline-block" }} />
                    <span style={{ fontSize: 13, color: "var(--text)" }}>Late: {lateCount}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {!showTable && !loading && records.length === 0 && (
        <div
          style={{
            padding: 16,
            background: "#fff8e1",
            border: "1px solid #e0d4a8",
            borderRadius: 12,
            color: "#6b5f1a",
            fontSize: 13,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          Attendance sheet for this class is not recorded yet
        </div>
      )}

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
