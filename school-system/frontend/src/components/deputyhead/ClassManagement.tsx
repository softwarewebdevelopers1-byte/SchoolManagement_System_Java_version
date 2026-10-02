// components/deputyhead/ClassManagement.tsx
import React, { useState } from "react";
import { ArrowUpRight, BookOpen, GraduationCap, Users } from "lucide-react";
import { SectionHeader } from "./shared/SectionHeader";
import { C, F } from "./shared/constants";

interface ClassManagementProps {
  classes?: any[];
  students?: any[];
  staff?: any[];
  term?: number;
  year?: number;
}

export const ClassManagement: React.FC<ClassManagementProps> = ({ 
  classes = [], 
  students = [], 
  term = 1,
  year = 2024
}) => {
  const [selectedClass, setSelectedClass] = useState<any>(null);

  return (
    <div className="dh-anim">
      <SectionHeader
        eyebrow="Classes"
        title="Class management"
        sub={`${classes.length} ${classes.length === 1 ? "class" : "classes"} · Grades 7–9 · Term ${term}, ${year}`}
      />
      {classes.length ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
            gap: 18,
            alignItems: "stretch",
          }}
        >
          {classes.map((c, i) => (
            <button
              key={c.id || i}
              type="button"
              className="dh-card"
              onClick={() => setSelectedClass(c)}
              aria-label={`View students in ${c.name}`}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                gap: 18,
                width: "100%",
                minWidth: 0,
                padding: 20,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                background: C.white,
                color: C.text,
                textAlign: "left",
                cursor: "pointer",
                transition: "box-shadow .2s, transform .2s, border-color .2s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 13, minWidth: 0 }}>
                  <div
                    aria-hidden="true"
                    style={{
                      display: "grid",
                      placeItems: "center",
                      width: 46,
                      height: 46,
                      flexShrink: 0,
                      borderRadius: 13,
                      background: C.goldPale,
                      color: C.gold,
                    }}
                  >
                    <GraduationCap size={23} strokeWidth={1.8} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <span
                      style={{
                        display: "inline-block",
                        marginBottom: 4,
                        color: C.textFaint,
                        fontFamily: F.sans,
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: ".09em",
                        textTransform: "uppercase",
                      }}
                    >
                      Grade {c.grade}
                    </span>
                    <h3
                      style={{
                        overflow: "hidden",
                        margin: 0,
                        color: C.text,
                        fontFamily: F.sans,
                        fontSize: 17,
                        fontWeight: 800,
                        lineHeight: 1.25,
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.name}
                    </h3>
                  </div>
                </div>
                <ArrowUpRight aria-hidden="true" size={18} color={C.textFaint} />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  minHeight: 20,
                  color: C.textMuted,
                  fontFamily: F.sans,
                  fontSize: 12,
                }}
              >
                <Users aria-hidden="true" size={15} />
                <span>
                  {c.teacher && c.teacher !== "🔔"
                    ? c.teacher
                    : "No class teacher assigned"}
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 10,
                  paddingTop: 15,
                  borderTop: `1px solid ${C.borderLight}`,
                }}
              >
                {[
                  {
                    label: "Students",
                    value: c.students ?? 0,
                    icon: <Users size={15} />,
                  },
                  {
                    label: "Subjects",
                    value: c.subjects ?? 0,
                    icon: <BookOpen size={15} />,
                  },
                  {
                    label: "Class average",
                    value: c.avg > 0 ? `${c.avg}%` : "—",
                    icon: null,
                  },
                  {
                    label: "Current term",
                    value: `Term ${c.term || term}`,
                    icon: null,
                  },
                ].map((metric) => (
                  <div key={metric.label} style={{ minWidth: 0, padding: "3px 2px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 5,
                        color: C.textMuted,
                        fontFamily: F.sans,
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      {metric.icon}
                      <span>{metric.label}</span>
                    </div>
                    <strong
                      style={{
                        display: "block",
                        overflow: "hidden",
                        color: C.text,
                        fontFamily: F.sans,
                        fontSize: 16,
                        fontWeight: 800,
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {metric.value}
                    </strong>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div
          style={{
            padding: "36px 20px",
            border: `1px dashed ${C.border}`,
            borderRadius: 16,
            background: C.white,
            color: C.textMuted,
            fontFamily: F.sans,
            textAlign: "center",
          }}
        >
          No classes are available to display yet.
        </div>
      )}

    {selectedClass && (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 20,
        }}
        onClick={() => setSelectedClass(null)}
      >
        <div
          onClick={(e) => {
            e.stopPropagation()
            console.log(selectedClass)
          }}
          style={{
            background: C.white,
            borderRadius: 16,
            width: "100%",
            maxWidth: 600,
            maxHeight: "85vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: "24px 24px 16px", borderBottom: `1px solid ${C.borderLight}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <h2 style={{ margin: 0, fontFamily: F.serif, fontSize: 24, color: C.text }}>{selectedClass.name}</h2>
              <button 
                onClick={() => setSelectedClass(null)}
                style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: C.textMuted }}
              >
                ×
              </button>
            </div>
            <p style={{ margin: 0, fontFamily: F.sans, fontSize: 14, color: C.textMid }}>
              <strong>Class Teacher:</strong> {selectedClass.teacher || "Unassigned"}
            </p>
          </div>
          <div style={{ padding: 24, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 450 }}>
                <thead>
                  <tr style={{ background: C.sand, textAlign: "left" }}>
                    <th style={{ 
                      padding: "8px 12px", 
                      fontFamily: F.sans, 
                      fontSize: 12, 
                      color: C.textMuted, 
                      position: "sticky", 
                      top: 0, 
                      left: 0,
                      background: C.sand, 
                      zIndex: 10, 
                      boxShadow: `inset 0 -1px 0 ${C.borderLight}, 2px 0 5px rgba(0,0,0,0.05)` 
                    }}>Name</th>
                    <th style={{ padding: "8px 12px", fontFamily: F.sans, fontSize: 12, color: C.textMuted, position: "sticky", top: 0, background: C.sand, zIndex: 1, boxShadow: `inset 0 -1px 0 ${C.borderLight}` }}>Adm No</th>
                    <th style={{ padding: "8px 12px", fontFamily: F.sans, fontSize: 12, color: C.textMuted, position: "sticky", top: 0, background: C.sand, zIndex: 1, boxShadow: `inset 0 -1px 0 ${C.borderLight}` }}>Gender</th>
                  </tr>
                </thead>
                <tbody>
                  {students.filter(s => s.classGrade === selectedClass.grade && (s.classStream || "") === (selectedClass.stream || "")).map((s, i) => (
                    <tr key={s.id || i} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                      <td style={{ 
                        padding: "10px 12px", 
                        fontFamily: F.sans, 
                        fontSize: 13, 
                        color: C.text,
                        position: "sticky",
                        left: 0,
                        background: C.white,
                        zIndex: 5,
                        boxShadow: "2px 0 5px rgba(0,0,0,0.05)"
                      }}>{s.name}</td>
                      <td style={{ padding: "10px 12px", fontFamily: F.sans, fontSize: 13, color: C.textMid }}>{s.admissionNo || s.adm || "-"}</td>
                      <td style={{ padding: "10px 12px", fontFamily: F.sans, fontSize: 13, color: C.textMuted }}>{s.gender || "-"}</td>
                    </tr>
                  ))}
                  {students.filter(s => s.classGrade === selectedClass.grade && (s.classStream || "") === (selectedClass.stream || "")).length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ padding: 20, textAlign: "center", color: C.textMuted, fontFamily: F.sans }}>No students found for this class.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
  );
};
