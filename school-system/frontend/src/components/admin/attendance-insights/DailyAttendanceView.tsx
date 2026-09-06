import React, { useEffect, useState } from "react";
import { api } from "../../../lib/api";

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

export const DailyAttendanceView: React.FC<DailyAttendanceViewProps> = ({ classes }) => {
  const [classId, setClassId] = useState(classes[0]?.classId || "");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!classId || !date) return;
    setLoading(true);
    setError("");
    (async () => {
      try {
        const data: any = await api.get(`/admin/attendance-insights/classes/${classId}/attendance/daily?date=${date}`);
        const content = Array.isArray(data) ? data : data?.data || [];
        setRecords(content);
      } catch (err: any) {
        setError(err?.message || "Failed to load daily attendance.");
        setRecords([]);
      } finally {
        setLoading(false);
      }
    })();
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

      <div style={{ overflowX: "auto" }}>
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
      </div>
    </div>
  );
};
