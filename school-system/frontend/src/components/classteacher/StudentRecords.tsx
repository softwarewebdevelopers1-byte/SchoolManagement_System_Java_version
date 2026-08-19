// components/classteacher/StudentRecords.tsx
import React, { useState } from "react";
import { Avatar } from "./shared/Avatar";
import { C, FONT } from "./shared/constants";

interface StudentRecordsProps {
  students: any[];
  subjects: any[];
  onViewStudent: (student: any) => void;
  classInfo: string;
}

const StatusPill: React.FC<{ status: string }> = ({ status }) => (
  <span
    style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      fontFamily: FONT.sans,
      letterSpacing: "0.03em",
      background:
        status === "Active" || status === "active" ? C.successBg : C.dangerBg,
      color:
        status === "Active" || status === "active"
          ? C.successText
          : C.dangerText,
    }}
  >
    {status}
  </span>
);

const SectionHeader: React.FC<{
  eyebrow: string;
  title: string;
  sub?: string;
  action?: React.ReactNode;
}> = ({ eyebrow, title, sub, action }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: "1.6rem",
      flexWrap: "wrap",
      gap: "12px",
    }}
  >
    <div>
      <p
        style={{
          fontFamily: FONT.sans,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          color: C.gold,
          margin: "0 0 5px",
        }}
      >
        {eyebrow}
      </p>
      <h2
        style={{
          fontFamily: FONT.serif,
          fontSize: "1.9rem",
          fontWeight: 600,
          color: C.text,
          margin: "0 0 4px",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h2>
      {sub && (
        <p
          style={{
            fontFamily: FONT.sans,
            fontSize: 13,
            color: C.textMuted,
            margin: 0,
          }}
        >
          {sub}
        </p>
      )}
    </div>
    {action}
  </div>
);

export const StudentRecords: React.FC<StudentRecordsProps> = ({
  students,
  onViewStudent,
  classInfo,
}) => {
  console.log("students ", students);

  const [search, setSearch] = useState("");
  const filtered = students.filter(
    (s) =>
      String(s.name || s.studentFullName || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      String(s.admissionNo || s.adm || s.studentAdm || "").includes(search),
  );

  return (
    <div className="ct-anim">
      <SectionHeader
        eyebrow="Roster"
        title="Student records"
        sub={`${classInfo} · ${students.length} learners enrolled`}
        action={
          <div style={{ display: "flex", gap: 10 }}>
            <input
              className="ct-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or ID…"
              style={{
                padding: "9px 14px",
                border: `1.5px solid ${C.border}`,
                borderRadius: 9,
                fontFamily: FONT.sans,
                fontSize: 13,
                color: C.text,
                background: C.cream,
                width: 220,
                transition: "all 0.2s",
              }}
            />
          </div>
        }
      />
      <div
        style={{
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          overflow: "auto",
          maxHeight: "70vh",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                background: C.cream,
                borderBottom: `2px solid ${C.text}`,
              }}
            >
              {[
                "Student",
                "Adm. No",
                "Email",
                "Guardian",
                "Guardian Phone",
                "Status",
                "Action",
              ].map((h) => (
                <th
                  key={h}
                  scope="col"
                  style={{
                    padding: "12px 14px",
                    textAlign: "left",
                    fontFamily: FONT.sans,
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.text,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    position: "sticky",
                    top: 0,
                    background: C.cream,
                    zIndex: 10,
                    boxShadow: `inset 0 -1px 0 ${C.text}`,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const studentName = s.name || s.studentFullName || "-";
              return (
                <tr
                  key={s.id}
                  className="ct-row"
                  style={{
                    borderTop: `1px solid ${C.borderLight}`,
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "var(--ct-hover, rgba(0,0,0,0.02))")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                  onClick={() => onViewStudent(s)}
                >
                  <td style={{ padding: "12px 14px" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <Avatar name={studentName} size={32} />
                      <span
                        style={{
                          fontFamily: FONT.sans,
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: C.text,
                        }}
                      >
                        {studentName}
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontFamily: FONT.sans,
                      fontSize: 12.5,
                      color: C.textMuted,
                    }}
                  >
                    {s.admissionNo || s.adm || s.studentAdm || "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontFamily: FONT.sans,
                      fontSize: 12.5,
                      color: C.textMuted,
                    }}
                  >
                    {s.email || "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontFamily: FONT.sans,
                      fontSize: 12.5,
                      color: C.textMuted,
                    }}
                  >
                    {s.guardianName || s.guardian || "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontFamily: FONT.sans,
                      fontSize: 12.5,
                      color: C.textMuted,
                    }}
                  >
                    {s.phoneNumber || s.guardianPhone || "-"}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <StatusPill status={s.status?.toLowerCase() || "Active"} />
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <button
                      className="ct-pill"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewStudent(s);
                      }}
                      style={{
                        padding: "5px 13px",
                        background: "transparent",
                        border: `1px solid ${C.border}`,
                        borderRadius: 20,
                        fontFamily: FONT.sans,
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.textMuted,
                        cursor: "pointer",
                        transition: "all 0.18s",
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
