// components/deputyhead/TeacherManagement.tsx (continued)
import React, { useEffect, useState } from "react";
import { SectionHeader } from "./shared/SectionHeader";
import { Avatar } from "./shared/Avatar";
import { C, F } from "./shared/constants";
import { api } from "../../lib/api";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface TeacherManagementProps {
  staff?: any[];
}

export const TeacherManagement: React.FC<TeacherManagementProps> = ({ staff = [] }) => {
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [teacherSummary, setTeacherSummary] = useState<any>(null);
  const filtered = staff.filter(
    (t) =>
      (t.name || t.teachersName || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.department || "").toLowerCase().includes(search.toLowerCase()),
  );
  const activeCount = staff.filter((t) => t.status === "active" || t.status === "Active").length;

  useEffect(() => {
    (async () => {
      try {
        const data: any = await api.get("/stats/teachers/summary");
        setTeacherSummary(data?.data || data || null);
      } catch {
        setTeacherSummary(null);
      }
    })();
  }, []);

  return (
    <div className="dh-anim">
      <SectionHeader
        eyebrow="Staff"
        title="Teacher management"
        sub={`${staff.length} teachers on record · ${activeCount} currently active`}
        action={
          <input
            className="dh-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or department…"
            style={{
              padding: "9px 14px",
              border: `1.5px solid ${C.border}`,
              borderRadius: 9,
              fontFamily: F.sans,
              fontSize: 13,
              color: C.text,
              background: C.cream,
              width: 220,
              transition: "all .2s",
            }}
          />
        }
      />
      {teacherSummary && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div
            style={{
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 13,
              padding: "1.3rem",
            }}
          >
            <p
              style={{
                fontFamily: F.sans,
                fontSize: 10.5,
                fontWeight: 700,
                color: C.textMuted,
                textTransform: "uppercase",
                letterSpacing: ".06em",
                margin: "0 0 1rem",
              }}
            >
              Teacher status breakdown
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Active", value: teacherSummary.active || 0 },
                    { name: "On leave", value: teacherSummary.onLeave || 0 },
                    { name: "Suspended", value: teacherSummary.suspended || 0 },
                  ].filter((item) => item.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {[
                    { name: "Active", value: teacherSummary.active || 0, color: "#163325" },
                    { name: "On leave", value: teacherSummary.onLeave || 0, color: "#c9963d" },
                    { name: "Suspended", value: teacherSummary.suspended || 0, color: "#b42318" },
                  ]
                    .filter((entry) => entry.value > 0)
                    .map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: C.white,
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div
            style={{
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 13,
              padding: "1.3rem",
            }}
          >
            <p
              style={{
                fontFamily: F.sans,
                fontSize: 10.5,
                fontWeight: 700,
                color: C.textMuted,
                textTransform: "uppercase",
                letterSpacing: ".06em",
                margin: "0 0 1rem",
              }}
            >
              Subject coverage
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={(teacherSummary.subjectCoverage || []).slice(0, 10)}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e7ece9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#6d7c74" }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="subjectName"
                  tick={{ fontSize: 11, fill: "#6d7c74" }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    background: C.white,
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="teacherCount" name="Teachers" fill={C.gold} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      <div
        style={{
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: 13,
          overflow: "auto",
          maxHeight: "70vh",
          WebkitOverflowScrolling: "touch"
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
          <thead>
            <tr style={{ background: C.sand }}>
              {[
                "Teacher",
                "Department",
                "Class",
                "Students",
                "Status",
                "",
              ].map((h, i) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    fontFamily: F.sans,
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: C.textMuted,
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                    position: "sticky",
                    top: 0,
                    left: i === 0 ? 0 : undefined,
                    background: C.sand,
                    zIndex: i === 0 ? 15 : 10,
                    boxShadow: i === 0 
                      ? `inset 0 -1px 0 ${C.borderLight}, 2px 0 5px rgba(0,0,0,0.05)` 
                      : `inset 0 -1px 0 ${C.borderLight}`,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr
                key={t.id}
                className="dh-row"
                style={{ borderTop: `1px solid ${C.borderLight}`, transition: "background 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--ct-hover, rgba(0,0,0,0.02))"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ 
                  padding: "11px 14px",
                  position: "sticky",
                  left: 0,
                  zIndex: 5,
                  background: C.white,
                  boxShadow: "2px 0 5px rgba(0,0,0,0.05), 1px 0 0 var(--borderL)",
                  minWidth: 180
                }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 9 }}
                  >
                    <Avatar name={t.name} size={30} />
                    <span
                      style={{
                        fontFamily: F.sans,
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: C.text,
                      }}
                    >
                      {t.name}
                    </span>
                  </div>
                </td>
                <td
                  style={{
                    padding: "11px 14px",
                    fontFamily: F.sans,
                    fontSize: 13,
                    color: C.textMid,
                  }}
                >
                  {t.department || "General"}
                </td>
                <td
                  style={{
                    padding: "11px 14px",
                    fontFamily: F.sans,
                    fontSize: 13,
                    color: C.textMuted,
                  }}
                >
                  {t.classGrade ? `Grade ${t.classGrade}${t.classStream || ""}` : "None"}
                </td>
                <td
                  style={{
                    padding: "11px 14px",
                    fontFamily: F.serif,
                    fontSize: 16,
                    fontWeight: 600,
                    color: C.text,
                  }}
                >
                  {t.subjects?.length || 0} subjects
                </td>
                <td style={{ padding: "11px 14px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: 10.5,
                      fontWeight: 700,
                      background:
                        t.status === "active" || t.status === "Active" ? C.successBg : C.warnBg,
                      color: t.status === "active" || t.status === "Active" ? C.successText : C.warnText,
                    }}
                  >
                    {t.status || "Active"}
                  </span>
                </td>
                <td style={{ padding: "11px 14px" }}>
                  <button
                    className="dh-pill"
                    onClick={() => setSelectedTeacher(t)}
                    style={{
                      padding: "4px 12px",
                      background: "transparent",
                      border: `1px solid ${C.border}`,
                      borderRadius: 20,
                      fontFamily: F.sans,
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: C.textMuted,
                      cursor: "pointer",
                      transition: "all .18s",
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>

    {selectedTeacher && (
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
        onClick={() => setSelectedTeacher(null)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: C.white,
            borderRadius: 16,
            width: "100%",
            maxWidth: 500,
            maxHeight: "85vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: "24px 24px 16px", borderBottom: `1px solid ${C.borderLight}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar name={selectedTeacher.name} size={40} />
                <div>
                  <h2 style={{ margin: 0, fontFamily: F.serif, fontSize: 22, color: C.text }}>{selectedTeacher.name}</h2>
                  <p style={{ margin: 0, fontFamily: F.sans, fontSize: 13, color: C.textMid }}>{selectedTeacher.roleLabel}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTeacher(null)}
                style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: C.textMuted }}
              >
                ×
              </button>
            </div>
          </div>
          <div style={{ padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <p style={{ margin: "0 0 4px", fontFamily: F.sans, fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>Contact Info</p>
              <p style={{ margin: 0, fontFamily: F.sans, fontSize: 14, color: C.text }}><strong>Email:</strong> {selectedTeacher.email || "N/A"}</p>
              <p style={{ margin: "4px 0 0", fontFamily: F.sans, fontSize: 14, color: C.text }}><strong>Phone:</strong> {selectedTeacher.phone || "N/A"}</p>
            </div>
            <div>
              <p style={{ margin: "0 0 4px", fontFamily: F.sans, fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>Assignment</p>
              <p style={{ margin: 0, fontFamily: F.sans, fontSize: 14, color: C.text }}><strong>Department:</strong> {selectedTeacher.department || "General"}</p>
              <p style={{ margin: "4px 0 0", fontFamily: F.sans, fontSize: 14, color: C.text }}><strong>Class:</strong> {selectedTeacher.classGrade ? `Grade ${selectedTeacher.classGrade}${selectedTeacher.classStream || ""}` : "None"}</p>
            </div>
            <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", padding: 16, background: C.cream, borderRadius: 8 }}>
              <span style={{ fontFamily: F.sans, fontSize: 14, fontWeight: 600, color: C.textMid }}>Status</span>
              <span style={{ 
                fontFamily: F.sans, 
                fontSize: 14, 
                fontWeight: 700, 
                color: selectedTeacher.status === "active" || selectedTeacher.status === "Active" ? C.successText : C.warnText 
              }}>
                {selectedTeacher.status || "Active"}
              </span>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
  );
};
