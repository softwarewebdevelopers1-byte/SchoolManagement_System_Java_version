import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../lib/api";
import { C, FONT } from "./shared/constants";

interface AttendanceRecord {
  recordId: string;
  studentName: string;
  status: "PRESENT" | "ABSENT";
}

interface AttendanceSheet {
  sheetId: string;
  className: string;
  date: string;
  records: AttendanceRecord[];
}

interface AttendanceTabProps {
  user: any;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheet, setSheet] = useState<AttendanceSheet | null>(null);
  const [classId, setClassId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [dateFilter, setDateFilter] = useState<string>(new Date().toISOString().split("T")[0]);

  const fetchClassId = useCallback(async () => {
    try {
      const classes = await api.get<any[]>("/school/classes");
      const matched = classes.find(
        (c) => String(c.classGrade) === String(user.classGrade) && String(c.classStream) === String(user.classStream)
      );
      if (matched) {
        setClassId(matched.classId);
      } else {
        setError("Could not find class ID for your assigned class.");
      }
    } catch (err: any) {
      setError("Failed to fetch class ID.");
    }
  }, [user]);

  useEffect(() => {
    fetchClassId();
  }, [fetchClassId]);

  const loadSheet = useCallback(async () => {
    if (!classId || !user.id) return;
    setLoading(true);
    setError(null);
    try {
      const isToday = dateFilter === new Date().toISOString().split("T")[0];
      let data: any;
      if (isToday) {
        data = await api.get("/attendance/sheet", {
          classId: classId,
          teacherId: user.id,
        });
      } else {
        data = await api.get("/attendance/get/attendance-sheet", {
          classId: classId,
          teacherId: user.id,
          date: dateFilter,
        });
      }
      // Ensure we extract the nested payload correctly since backend returns SchoolApiResponse
      const unwrappedData = data?.status === "Success" ? data.data : data;
      setSheet(unwrappedData || null);
    } catch (err: any) {
      setError(err.message || "Failed to load attendance sheet.");
      setSheet(null);
    } finally {
      setLoading(false);
    }
  }, [classId, user.id, dateFilter]);

  useEffect(() => {
    loadSheet();
  }, [loadSheet]);

  const handleStatusChange = (recordId: string, newStatus: "PRESENT" | "ABSENT") => {
    if (!sheet) return;
    setSheet({
      ...sheet,
      records: sheet.records.map((r) =>
        r.recordId === recordId ? { ...r, status: newStatus } : r
      ),
    });
  };

  const handleSave = async () => {
    if (!sheet || !classId) return;
    setMessage(null);
    try {
      await api.patch("/attendance/update/sheet", {
        classId: classId,
        attendanceSheetId: sheet.sheetId,
        attendanceRecordDTOs: sheet.records,
      });
      setMessage({ text: "Attendance sheet updated successfully.", type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to update attendance.", type: "error" });
    }
  };

  if (loading && !sheet) {
    return <div style={{ padding: 40, textAlign: "center" }}>Loading attendance records...</div>;
  }

  if (error && !sheet) {
    return <div style={{ padding: 40, textAlign: "center", color: C.dangerText }}>{error}</div>;
  }

  return (
    <div style={{ padding: "32px 40px", background: "#ffffff", borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: "0 12px 36px rgba(0,0,0,0.03)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h2 style={{ margin: "0 0 8px", fontFamily: FONT.serif, fontSize: "2rem", color: C.text, letterSpacing: "-0.02em" }}>
            Attendance Management
          </h2>
          <p style={{ margin: 0, fontFamily: FONT.sans, fontSize: 14, color: C.textMut }}>
            Mark student attendance for <strong style={{ color: C.text }}>{user.classGrade} {user.classStream}</strong>
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                padding: "10px 16px",
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                fontFamily: FONT.sans,
                fontSize: 14,
                color: C.text,
                background: "#fdfdfd",
                outline: "none",
                transition: "all 0.2s",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              }}
              onFocus={(e) => e.target.style.borderColor = C.gold}
              onBlur={(e) => e.target.style.borderColor = C.border}
            />
          </div>
          <button
            onClick={handleSave}
            style={{
              background: `linear-gradient(135deg, ${C.gold} 0%, #b38536 100%)`,
              color: "#fff",
              border: "none",
              padding: "11px 24px",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(201, 150, 61, 0.25)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(201, 150, 61, 0.35)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(201, 150, 61, 0.25)";
            }}
          >
            Save Attendance
          </button>
        </div>
      </div>

      {message && (
        <div
          style={{
            padding: "12px 18px",
            background: message.type === "success" ? C.greenLight : "#fdeaea",
            color: message.type === "success" ? C.successText : C.dangerText,
            borderRadius: 8,
            marginBottom: 24,
            fontSize: 14,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 10,
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          {message.text}
        </div>
      )}

      {sheet && sheet.records && sheet.records.length > 0 ? (
        <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${C.border}` }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f8f9fa" }}>
              <tr>
                <th style={{ textAlign: "left", padding: "16px 20px", borderBottom: `1px solid ${C.border}`, color: C.textMut, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Student Name</th>
                <th style={{ textAlign: "center", padding: "16px 20px", borderBottom: `1px solid ${C.border}`, color: C.textMut, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", width: 160 }}>Present</th>
                <th style={{ textAlign: "center", padding: "16px 20px", borderBottom: `1px solid ${C.border}`, color: C.textMut, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", width: 160 }}>Absent</th>
              </tr>
            </thead>
            <tbody>
              {sheet.records.map((record) => (
                <tr key={record.recordId} style={{ borderBottom: `1px solid ${C.border}`, background: "#fff", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "#fcfcfc"} onMouseOut={(e) => e.currentTarget.style.background = "#fff"}>
                  <td style={{ padding: "16px 20px", fontSize: 14, fontWeight: 600, color: C.text }}>{record.studentName}</td>
                  <td style={{ padding: "16px 20px", textAlign: "center" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "50%", background: record.status === "PRESENT" ? "rgba(40,167,69,0.1)" : "transparent", transition: "all 0.2s" }}>
                      <input
                        type="radio"
                        name={`attendance-${record.recordId}`}
                        checked={record.status === "PRESENT"}
                        onChange={() => handleStatusChange(record.recordId, "PRESENT")}
                        style={{ cursor: "pointer", width: 18, height: 18, accentColor: "#28a745" }}
                      />
                    </div>
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "center" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "50%", background: record.status === "ABSENT" ? "rgba(220,53,69,0.1)" : "transparent", transition: "all 0.2s" }}>
                      <input
                        type="radio"
                        name={`attendance-${record.recordId}`}
                        checked={record.status === "ABSENT"}
                        onChange={() => handleStatusChange(record.recordId, "ABSENT")}
                        style={{ cursor: "pointer", width: 18, height: 18, accentColor: "#dc3545" }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: 60, textAlign: "center", background: "#fafafa", borderRadius: 12, border: `1px dashed ${C.border}` }}>
          <p style={{ color: C.textMut, margin: 0, fontSize: 15 }}>No attendance records found for this date.</p>
        </div>
      )}
    </div>
  );
};
