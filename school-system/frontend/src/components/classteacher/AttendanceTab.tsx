import React, { useEffect, useState, useCallback } from "react";
import {
  api,
  getClassId,
  getCurrentTeacherProfileId,
  request,
} from "../../lib/api";
import { C, FONT } from "./shared/constants";
import AttendanceSheetSkeleton from "../skeletons/AttendanceSheetSkeleton";

interface AttendanceRecord {
  recordId: string;
  studentName: string;
  status: "PRESENT" | "ABSENT";
}

interface AttendanceSheet {
  sheetId: string;
  className: string;
  date: string;
  status?: "SUBMITTED" | "DRAFT" | "LOCKED" | string;
  records: AttendanceRecord[];
}

interface AttendanceTabProps {
  user: any;
  classId?: string;
  teacherId?: string;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({ user, classId, teacherId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheet, setSheet] = useState<AttendanceSheet | null>(null);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [dateFilter, setDateFilter] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  const fetchClassId = classId || getClassId();
  const currentTeacherId = teacherId || getCurrentTeacherProfileId();
  const today = new Date().toISOString().split("T")[0];
  const selectedDate = new Date(`${dateFilter}T00:00:00`);
  const selectedDay = selectedDate.toLocaleDateString(undefined, {
    weekday: "long",
  });
  const sheetStatus = String(sheet?.status || "DRAFT").toUpperCase();
  const statusMeta =
    sheetStatus === "LOCKED"
      ? { label: "Locked", bg: "var(--dBg)", color: "var(--dText)" }
      : sheetStatus === "SUBMITTED"
        ? { label: "Saved", bg: "var(--sBg)", color: "var(--sText)" }
        : { label: "Not saved", bg: "var(--wBg)", color: "var(--wText)" };

  const loadSheet = useCallback(async () => {
    if (!fetchClassId) return;
    setLoading(true);
    setError(null);
    try {
      let data: any;
      if (dateFilter === today) {
        const params = new URLSearchParams({
          classId: encodeURIComponent(fetchClassId),
        });
        if (currentTeacherId) {
          params.set("teacherId", encodeURIComponent(currentTeacherId));
        }
        data = await request(`/attendance/sheet?${params.toString()}`, {
          method: "GET",
        });
      } else {
        data = await request(`/attendance/get/attendance-sheet`, {
          method: "POST",
          body: JSON.stringify({
            classId: fetchClassId,
            date: dateFilter,
            teacherId: currentTeacherId || undefined,
          }),
        });
      }
      const unwrappedData = data?.status === "Success" ? data.data : data;
      setSheet(unwrappedData || null);
    } catch (err: any) {
      setError(err.message || "Failed to load attendance sheet.");
      setSheet(null);
    } finally {
      setLoading(false);
    }
  }, [dateFilter, fetchClassId, currentTeacherId, today]);

  useEffect(() => {
    loadSheet();
  }, [loadSheet]);

  const handleStatusChange = (
    recordId: string,
    newStatus: "PRESENT" | "ABSENT",
  ) => {
    if (!sheet) return;
    setSheet({
      ...sheet,
      records: sheet.records.map((r) =>
        r.recordId === recordId ? { ...r, status: newStatus } : r,
      ),
    });
  };

  const handleSave = async () => {
    if (!sheet || !fetchClassId) return;
    setMessage(null);
    try {
      let res: any = await api.patch("/attendance/update/sheet", {
        classId: fetchClassId,
        attendanceSheetId: sheet.sheetId,
        attendanceRecordDTOs: sheet.records,
      });
      setSheet({ ...sheet, status: "SUBMITTED" });

      setMessage({
        text: "Attendance sheet updated successfully.",
        type: "success",
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({
        text: "Failed to update attendance.",
        type: "error",
      });
    }
  };

  if (loading && !sheet) {
    return (
      <>
        {" "}
        <AttendanceSheetSkeleton />{" "}
      </>
    );
  }

  if (error && !sheet) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: C.dangerText }}>
        {error}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "clamp(16px, 3vw, 40px)",
        background: "var(--white)",
        borderRadius: 14,
        border: "1px solid var(--border)",
        boxShadow: "0 12px 36px rgba(0,0,0,0.03)",
        width: "100%",
        boxSizing: "border-box",
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h2
            style={{
              margin: "0 0 8px",
              fontFamily: FONT.serif,
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              color: "var(--text)",
              letterSpacing: "-0.02em",
              overflowWrap: "anywhere",
            }}
          >
            Attendance Management
          </h2>
          <p
            style={{
              margin: 0,
              fontFamily: FONT.sans,
              fontSize: 14,
              color: "var(--textMut)",
            }}
          >
            Mark student attendance for{" "}
            <strong style={{ color: "var(--text)" }}>
              {user.classGrade} {user.classStream}
            </strong>
            <span style={{ display: "block", marginTop: 4 }}>
              {selectedDay}, {dateFilter}
            </span>
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative" }}>
            <input
              type="date"
              disabled
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                padding: "10px 16px",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontFamily: FONT.sans,
                fontSize: 14,
                color: "var(--text)",
                background: "var(--cream)",
                outline: "none",
                transition: "all 0.2s",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                width: "100%",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>
          <span
            style={{
              padding: "9px 12px",
              borderRadius: 999,
              background: statusMeta.bg,
              color: statusMeta.color,
              fontSize: 12,
              fontWeight: 800,
              whiteSpace: "nowrap",
            }}
          >
            {statusMeta.label}
          </span>
          <button
            onClick={handleSave}
            disabled={sheetStatus === "LOCKED"}
            style={{
              background: `linear-gradient(135deg, ${C.gold} 0%, #b38536 100%)`,
              color: "#fff",
              border: "none",
              padding: "11px 24px",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              cursor: sheetStatus === "LOCKED" ? "not-allowed" : "pointer",
              opacity: sheetStatus === "LOCKED" ? 0.6 : 1,
              boxShadow: "0 4px 12px rgba(201, 150, 61, 0.25)",
              transition: "transform 0.2s, box-shadow 0.2s",
              whiteSpace: "nowrap",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 6px 16px rgba(201, 150, 61, 0.35)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(201, 150, 61, 0.25)";
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
            background:
              message.type === "success" ? "var(--sBg)" : "var(--dBg)",
            color: message.type === "success" ? "var(--sText)" : "var(--dText)",
            borderRadius: 8,
            marginBottom: 20,
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
        <div
          style={{
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid var(--border)",
            width: "100%",
          }}
        >
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 420,
              }}
            >
              <thead style={{ background: "var(--sand)" }}>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "14px 16px",
                      borderBottom: "1px solid var(--border)",
                      color: "var(--textMut)",
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      position: "sticky",
                      left: 0,
                      background: "var(--sand)",
                      zIndex: 5,
                      whiteSpace: "nowrap",
                      width: "50px",
                    }}
                  >
                    Student Name
                  </th>
                  <th
                    style={{
                      textAlign: "center",
                      padding: "14px 16px",
                      borderBottom: "1px solid var(--border)",
                      color: "var(--textMut)",
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      width: 140,
                    }}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {sheet.records.map((record) => (
                  <tr
                    key={record.recordId}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      background: "var(--white)",
                      transition: "background 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.background = "var(--sand)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.background = "var(--white)")
                    }
                  >
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: 14,
                        width: "auto",
                        fontWeight: 600,
                        color: "var(--text)",
                        position: "sticky",
                        left: 0,
                        background: "var(--white)",
                        zIndex: 2,
                        boxShadow: "2px 0 5px rgba(0,0,0,0.03)",
                      }}
                    >
                      {record.studentName}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                      <button
                        onClick={() =>
                          handleStatusChange(
                            record.recordId,
                            record.status === "PRESENT" ? "ABSENT" : "PRESENT",
                          )
                        }
                        disabled={sheetStatus === "LOCKED"}
                        style={{
                          padding: "8px 16px",
                          borderRadius: 8,
                          fontWeight: 700,
                          fontSize: 13,
                          cursor:
                            sheetStatus === "LOCKED"
                              ? "not-allowed"
                              : "pointer",
                          opacity: sheetStatus === "LOCKED" ? 0.6 : 1,
                          transition: "all 0.2s",
                          minWidth: 90,
                          background:
                            record.status === "PRESENT"
                              ? "rgba(40,167,69,0.15)"
                              : "rgba(220,53,69,0.15)",
                          color:
                            record.status === "PRESENT" ? "#28a745" : "#dc3545",
                          border: `1px solid ${
                            record.status === "PRESENT" ? "#28a745" : "#dc3545"
                          }`,
                        }}
                      >
                        {record.status === "PRESENT" ? "Present" : "Absent"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: 60,
            textAlign: "center",
            background: "var(--sand)",
            borderRadius: 12,
            border: "1px dashed var(--border)",
          }}
        >
          <p style={{ color: "var(--textMut)", margin: 0, fontSize: 15 }}>
            No attendance records found for this date.
          </p>
        </div>
      )}
    </div>
  );
};
