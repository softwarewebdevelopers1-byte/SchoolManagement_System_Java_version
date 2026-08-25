// components/classteacher/ClassOverview.tsx
import React, { useEffect, useState, useCallback } from "react";
import { C, FONT } from "./shared/constants";
import { Avatar } from "./shared/Avatar";
import { api } from "../../lib/api";

interface ClassOverviewProps {
  students: any[];
  subjects: any[];
  assignments: any[];
  user: any;
  onNavigate: (tab: string) => void;
}

const card: React.CSSProperties = {
  background: C.white,
  border: `1px solid ${C.border}`,
  borderRadius: 14,
  padding: "1.2rem 1.4rem",
};

const eyebrow: React.CSSProperties = {
  fontFamily: FONT.sans,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: C.gold,
  margin: "0 0 4px",
};

const sectionTitle: React.CSSProperties = {
  fontFamily: FONT.serif,
  fontSize: "1.3rem",
  fontWeight: 600,
  color: C.text,
  margin: "0 0 12px",
};

const metaText: React.CSSProperties = {
  fontFamily: FONT.sans,
  fontSize: 12,
  color: C.textMuted,
  margin: 0,
};

export const ClassOverview: React.FC<ClassOverviewProps> = ({
  students,
  subjects,
  assignments,
  user,
  onNavigate,
}) => {
  const [attendanceSummary, setAttendanceSummary] = useState<{
    present: number;
    absent: number;
    total: number;
  } | null>(null);

  const activeStudents = students.filter(
    (s) => String(s.status || "Active").toLowerCase() === "active",
  );

  const compulsorySubjects = subjects.filter(
    (s) =>
      s.isOffered !== false &&
      (s.enrollmentMode || "compulsory") === "compulsory",
  );

  const electiveSubjects = subjects.filter(
    (s) => s.isOffered !== false && s.enrollmentMode === "elective",
  );

  const offeredSubjects = subjects.filter((s) => s.isOffered !== false);

  const loadAttendance = useCallback(async () => {
    try {
      const { getClassId, getCurrentTeacherProfileId, request } =
        await import("../../lib/api");
      const classId = getClassId();
      const teacherId = getCurrentTeacherProfileId();
      if (!classId || !teacherId) return;
      const data: any = await request(
        `/attendance/sheet?classId=${encodeURIComponent(classId)}&teacherId=${encodeURIComponent(teacherId)}`,
        { method: "GET" },
      );
      const sheet = data?.status === "Success" ? data.data : data;
      if (sheet?.records) {
        const present = sheet.records.filter(
          (r: any) => r.status === "PRESENT",
        ).length;
        const absent = sheet.records.filter(
          (r: any) => r.status === "ABSENT",
        ).length;
        setAttendanceSummary({
          present,
          absent,
          total: sheet.records.length,
        });
      }
    } catch (_) {
      // attendance optional
    }
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const quickActions = [
    {
      label: "Enter Marks",
      desc: "Capture CAT and exam marks for all subjects.",
      tab: "marks",
      accent: C.gold,
      icon: "✏️",
    },
    {
      label: "Take Attendance",
      desc: "Mark today's student attendance.",
      tab: "attendance",
      accent: "#2E86AB",
      icon: "📋",
    },
    {
      label: "View Results",
      desc: "Download CBC performance reports.",
      tab: "results",
      accent: "#1D9E75",
      icon: "📊",
    },
    {
      label: "Subject Assignments",
      desc: "See which teacher handles each subject.",
      tab: "assignments",
      accent: "#993C1D",
      icon: "📚",
    },
    {
      label: "Register Subjects",
      desc: "Add or drop subjects for this class.",
      tab: "subject-joint",
      accent: "#6B2D8B",
      icon: "📝",
    },
    {
      label: "Elective Enrollment",
      desc: "Enroll students into elective subjects.",
      tab: "elective-enrollment",
      accent: "#185FA5",
      icon: "🎯",
    },
  ];

  const metrics = [
    {
      label: "Total Students",
      value: activeStudents.length,
      note: "Active learners",
      accent: C.green,
    },
    {
      label: "Subjects Offered",
      value: offeredSubjects.length,
      note: `${compulsorySubjects.length} compulsory · ${electiveSubjects.length} elective`,
      accent: C.gold,
    },
    {
      label: "Today's Attendance",
      value:
        attendanceSummary != null
          ? `${Math.round((attendanceSummary.present / Math.max(attendanceSummary.total, 1)) * 100)}%`
          : "—",
      note:
        attendanceSummary != null
          ? `${attendanceSummary.present} present · ${attendanceSummary.absent} absent`
          : "Not recorded yet",
      accent: "#2E86AB",
    },
    {
      label: "Term",
      value: `T${user?.term || 1}`,
      note: `${user?.year || new Date().getFullYear()} · ${(user?.examType || "opener").charAt(0).toUpperCase() + (user?.examType || "opener").slice(1)}`,
      accent: "#993C1D",
    },
  ];

  return (
    <div
      className="ct-anim"
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
    >
      {/* Hero Banner */}
      <div
        style={{
          background: C.green,
          borderRadius: 16,
          padding: "24px 28px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background pattern */}
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.04,
            pointerEvents: "none",
          }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid-ov"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#c9963d"
                strokeWidth=".8"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-ov)" />
        </svg>

        <div style={{ position: "relative" }}>
          <p
            style={{
              fontFamily: FONT.sans,
              fontSize: 10.5,
              fontWeight: 700,
              color: C.gold,
              textTransform: "uppercase",
              letterSpacing: "0.09em",
              margin: "0 0 6px",
            }}
          >
            Class Teacher Hub · Grade {user?.classGrade || ""}{" "}
            {user?.classStream || ""}
          </p>
          <h1
            style={{
              fontFamily: FONT.serif,
              fontSize: "clamp(1.4rem, 4vw, 2rem)",
              fontWeight: 600,
              color: "#fdf9f2",
              margin: "0 0 8px",
              letterSpacing: "-0.01em",
              lineHeight: 1.25,
            }}
          >
            Good day, {user?.name?.split(" ")[0] || "Teacher"} 👋
          </h1>
          <p
            style={{
              fontFamily: FONT.sans,
              fontSize: 13,
              color: "#9eb8aa",
              margin: 0,
            }}
          >
            {activeStudents.length} learners · {offeredSubjects.length} subjects
            offered · Term {user?.term || 1}, {user?.year || 2024}
          </p>
        </div>
      </div>

      {/* Metric Strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
        }}
      >
        {metrics.map(({ label, value, note, accent }) => (
          <div
            key={label}
            style={{
              ...card,
              borderTop: `3px solid ${accent}`,
              padding: "14px 16px",
            }}
          >
            <p style={eyebrow}>{label}</p>
            <p
              style={{
                fontFamily: FONT.serif,
                fontSize: "1.8rem",
                fontWeight: 600,
                color: C.text,
                margin: "0 0 3px",
                lineHeight: 1,
              }}
            >
              {value}
            </p>
            <p style={metaText}>{note}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={card}>
        <p style={eyebrow}>Quick Actions</p>
        <h2 style={sectionTitle}>What would you like to do?</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 10,
          }}
        >
          {quickActions.map(({ label, desc, tab, accent, icon }) => (
            <button
              key={tab}
              onClick={() => onNavigate(tab)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "12px 14px",
                background: C.sand,
                border: `1px solid ${C.border}`,
                borderLeft: `3px solid ${accent}`,
                borderRadius: 10,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.18s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = C.cream;
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = C.sand;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
              <div>
                <p
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.text,
                    margin: "0 0 2px",
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 11.5,
                    color: C.textMuted,
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  {desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Subject Roster */}
      <div style={card}>
        <p style={eyebrow}>Subject Roster</p>
        <h2 style={sectionTitle}>Subjects &amp; Assigned Teachers</h2>
        {offeredSubjects.length === 0 ? (
          <p style={metaText}>No subjects registered for this class yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {offeredSubjects.map((sub) => {
              const assignment = assignments.find(
                (a) => a.subjectId === sub.id || a.subjectId === sub._id,
              );
              const teacherName = assignment?.teacherName || "Unassigned";
              const isElective = sub.enrollmentMode === "elective";
              return (
                <div
                  key={sub.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    background: C.sand,
                    borderRadius: 9,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: isElective ? "#185FA5" : C.gold,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily: FONT.sans,
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.text,
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {sub.name}
                    </p>
                    <p
                      style={{
                        fontFamily: FONT.sans,
                        fontSize: 11,
                        color: C.textMuted,
                        margin: 0,
                      }}
                    >
                      {teacherName}
                    </p>
                  </div>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 20,
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: FONT.sans,
                      background: isElective
                        ? "rgba(24,95,165,0.1)"
                        : "rgba(201,150,61,0.12)",
                      color: isElective ? "#185FA5" : C.gold,
                      flexShrink: 0,
                    }}
                  >
                    {isElective ? "Elective" : "Compulsory"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Students snapshot */}
      <div style={card}>
        <p style={eyebrow}>Student Roster</p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <h2 style={{ ...sectionTitle, margin: 0 }}>
            Class {user?.classGrade} {user?.classStream}
          </h2>
          <button
            onClick={() => onNavigate("students")}
            style={{
              padding: "6px 14px",
              background: "transparent",
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontFamily: FONT.sans,
              fontSize: 12,
              fontWeight: 600,
              color: C.textMuted,
              cursor: "pointer",
            }}
          >
            View all →
          </button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
            gap: 8,
          }}
        >
          {activeStudents.slice(0, 12).map((s) => (
            <div
              key={s.studentId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                background: C.sand,
                borderRadius: 9,
                border: `1px solid ${C.border}`,
              }}
            >
              <Avatar name={s.fullName} size={28} />
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: C.text,
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.name}
                </p>
                <p
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 10.5,
                    color: C.textMuted,
                    margin: 0,
                  }}
                >
                  {s.admissionNo || s.adm || "—"}
                </p>
              </div>
            </div>
          ))}
          {activeStudents.length > 12 && (
            <button
              onClick={() => onNavigate("students")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px 10px",
                background: "transparent",
                border: `1.5px dashed ${C.border}`,
                borderRadius: 9,
                fontFamily: FONT.sans,
                fontSize: 12,
                fontWeight: 600,
                color: C.textMuted,
                cursor: "pointer",
              }}
            >
              +{activeStudents.length - 12} more
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
