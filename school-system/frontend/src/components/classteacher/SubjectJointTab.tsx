// components/classteacher/SubjectJointTab.tsx
// Allows class teacher to register (add/drop/change type) subjects for their class
import React, { useState, useCallback, useEffect } from "react";
import { C, FONT } from "./shared/constants";
import { api, getClassId, getSchoolId, request } from "../../lib/api";

interface SubjectJointTabProps {
  subjects: any[];       // classSubjectCatalog — already loaded by parent
  user: any;
  onRefresh: () => void;
}

const pill = (text: string, color: string) => {
  const colors: Record<string, { bg: string; fg: string }> = {
    gold: { bg: "rgba(201,150,61,0.12)", fg: "var(--ct-gold)" },
    blue: { bg: "rgba(24,95,165,0.1)", fg: "#185FA5" },
    red: { bg: "rgba(163,45,45,0.1)", fg: "#a32d2d" },
    green: { bg: "rgba(29,158,117,0.1)", fg: "#1D9E75" },
  };
  const c = colors[color] || colors.gold;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 9px",
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 700,
        fontFamily: FONT.sans,
        background: c.bg,
        color: c.fg,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      {text}
    </span>
  );
};

export const SubjectJointTab: React.FC<SubjectJointTabProps> = ({
  subjects,
  user,
  onRefresh,
}) => {
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form state for adding a new subject joint
  const [addMode, setAddMode] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [subjectType, setSubjectType] = useState<"COMPULSORY" | "ELECTIVE">("COMPULSORY");
  const [electiveCode, setElectiveCode] = useState("");
  const [saving, setSaving] = useState(false);

  // Load all available subjects (global school subjects)
  const loadAllSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const data: any[] = await api.get("/school/subjects");
      setAllSubjects(data || []);
    } catch (_) {
      setAllSubjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllSubjects();
  }, [loadAllSubjects]);

  const showMsg = (text: string, type: "success" | "error") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4000);
  };

  // Subjects NOT yet registered for this class
  const registeredIds = new Set(subjects.map((s) => s.id || s._id));
  const unregistered = allSubjects.filter(
    (s) => !registeredIds.has(s.id || s._id),
  );

  const handleToggleOffering = async (
    subjectId: string,
    currentIsOffered: boolean,
  ) => {
    try {
      await api.put("/school/class-subjects", {
        subjectId,
        classGrade: user.classGrade,
        classStream: user.classStream || "",
        isOffered: !currentIsOffered,
        enrollmentMode: "compulsory",
      });
      showMsg(
        currentIsOffered
          ? "Subject dropped from this class."
          : "Subject restored for this class.",
        "success",
      );
      onRefresh();
    } catch (err: any) {
      showMsg(err.message || "Failed to update subject.", "error");
    }
  };

  const handleChangeType = async (
    subjectId: string,
    newMode: "compulsory" | "elective",
    sharedSlotId?: string | null,
  ) => {
    try {
      await api.put("/school/class-subjects", {
        subjectId,
        classGrade: user.classGrade,
        classStream: user.classStream || "",
        isOffered: true,
        enrollmentMode: newMode,
        sharedSlotId: sharedSlotId || null,
      });
      showMsg("Subject type updated.", "success");
      onRefresh();
    } catch (err: any) {
      showMsg(err.message || "Failed to update subject type.", "error");
    }
  };

  const handleAddSubjectJoint = async () => {
    if (!selectedSubjectId) {
      showMsg("Please select a subject.", "error");
      return;
    }
    setSaving(true);
    try {
      // Register the subject for this class via class-subjects endpoint
      await api.put("/school/class-subjects", {
        subjectId: selectedSubjectId,
        classGrade: user.classGrade,
        classStream: user.classStream || "",
        isOffered: true,
        enrollmentMode: subjectType === "ELECTIVE" ? "elective" : "compulsory",
        sharedSlotId: subjectType === "ELECTIVE" && electiveCode ? electiveCode.trim() : null,
      });
      showMsg("Subject registered for this class.", "success");
      setAddMode(false);
      setSelectedSubjectId("");
      setSubjectType("COMPULSORY");
      setElectiveCode("");
      onRefresh();
    } catch (err: any) {
      showMsg(err.message || "Failed to register subject.", "error");
    } finally {
      setSaving(false);
    }
  };

  const offeredSubjects = subjects.filter((s) => s.isOffered !== false);
  const droppedSubjects = subjects.filter((s) => s.isOffered === false);

  return (
    <div className="ct-anim" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div>
        <p
          style={{
            fontFamily: FONT.sans,
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: C.gold,
            margin: "0 0 5px",
          }}
        >
          Class Configuration
        </p>
        <h2
          style={{
            fontFamily: FONT.serif,
            fontSize: "1.9rem",
            fontWeight: 600,
            color: C.text,
            margin: "0 0 6px",
          }}
        >
          Subject Registration
        </h2>
        <p
          style={{
            fontFamily: FONT.sans,
            fontSize: 13,
            color: C.textMuted,
            margin: 0,
          }}
        >
          Manage subjects offered for Grade {user?.classGrade} {user?.classStream}. Add, drop, or change type (compulsory / elective).
        </p>
      </div>

      {/* Feedback message */}
      {msg && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: 9,
            background: msg.type === "success" ? C.greenLight : "#fdeaea",
            color: msg.type === "success" ? "#1D9E75" : "#a32d2d",
            fontFamily: FONT.sans,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {msg.text}
        </div>
      )}

      {/* Add Subject Form */}
      {addMode ? (
        <div
          style={{
            background: C.white,
            border: `1.5px solid ${C.gold}`,
            borderRadius: 14,
            padding: "1.4rem",
          }}
        >
          <p style={{ fontFamily: FONT.sans, fontSize: 13, fontWeight: 700, color: C.text, margin: "0 0 14px" }}>
            Register a New Subject
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label
                style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 700, color: C.textMuted, display: "block", marginBottom: 5 }}
              >
                Select Subject
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 9,
                  fontFamily: FONT.sans,
                  fontSize: 13,
                  color: C.text,
                  background: C.cream,
                }}
              >
                <option value="">— choose subject —</option>
                {unregistered.map((s) => (
                  <option key={s.id || s._id} value={s.id || s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {unregistered.length === 0 && allSubjects.length > 0 && (
                <p style={{ fontFamily: FONT.sans, fontSize: 11, color: C.textMuted, margin: "4px 0 0" }}>
                  All school subjects are already registered for this class.
                </p>
              )}
            </div>

            <div>
              <label
                style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 700, color: C.textMuted, display: "block", marginBottom: 5 }}
              >
                Subject Type
              </label>
              <select
                value={subjectType}
                onChange={(e) => setSubjectType(e.target.value as "COMPULSORY" | "ELECTIVE")}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 9,
                  fontFamily: FONT.sans,
                  fontSize: 13,
                  color: C.text,
                  background: C.cream,
                }}
              >
                <option value="COMPULSORY">Compulsory</option>
                <option value="ELECTIVE">Elective</option>
              </select>
            </div>

            {subjectType === "ELECTIVE" && (
              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 700, color: C.textMuted, display: "block", marginBottom: 5 }}
                >
                  Elective Slot Code (optional — groups electives sharing the same time slot)
                </label>
                <input
                  type="text"
                  value={electiveCode}
                  onChange={(e) => setElectiveCode(e.target.value)}
                  placeholder="e.g. SLOT-A or leave blank"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: `1.5px solid ${C.border}`,
                    borderRadius: 9,
                    fontFamily: FONT.sans,
                    fontSize: 13,
                    color: C.text,
                    background: C.cream,
                    boxSizing: "border-box",
                  }}
                />
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button
              onClick={handleAddSubjectJoint}
              disabled={saving || !selectedSubjectId}
              style={{
                padding: "9px 20px",
                background: saving || !selectedSubjectId ? C.border : C.gold,
                color: "#fff",
                border: "none",
                borderRadius: 9,
                fontFamily: FONT.sans,
                fontSize: 13,
                fontWeight: 700,
                cursor: saving || !selectedSubjectId ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving…" : "Register Subject"}
            </button>
            <button
              onClick={() => { setAddMode(false); setSelectedSubjectId(""); setElectiveCode(""); }}
              style={{
                padding: "9px 18px",
                background: "transparent",
                border: `1px solid ${C.border}`,
                borderRadius: 9,
                fontFamily: FONT.sans,
                fontSize: 13,
                fontWeight: 600,
                color: C.textMuted,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={() => setAddMode(true)}
            style={{
              padding: "9px 20px",
              background: C.gold,
              color: "#fff",
              border: "none",
              borderRadius: 9,
              fontFamily: FONT.sans,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <span>+</span> Register Subject
          </button>
        </div>
      )}

      {/* Active Subjects */}
      <div
        style={{
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 18px",
            borderBottom: `1px solid ${C.border}`,
            background: C.cream,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <p
            style={{
              fontFamily: FONT.sans,
              fontSize: 11,
              fontWeight: 700,
              color: C.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: 0,
              flex: 1,
            }}
          >
            Active Subjects ({offeredSubjects.length})
          </p>
        </div>

        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: C.textMuted, fontFamily: FONT.sans, fontSize: 13 }}>
            Loading…
          </div>
        ) : offeredSubjects.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: C.textMuted, fontFamily: FONT.sans, fontSize: 13 }}>
            No subjects registered yet. Click "Register Subject" to add one.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.sand }}>
                {["Subject", "Type", "Slot Code", "Actions"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      fontFamily: FONT.sans,
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: C.textMuted,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {offeredSubjects.map((sub) => {
                const isElective = sub.enrollmentMode === "elective";
                return (
                  <tr
                    key={sub.id}
                    style={{ borderBottom: `1px solid ${C.border}` }}
                  >
                    <td
                      style={{
                        padding: "12px 14px",
                        fontFamily: FONT.sans,
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: C.text,
                      }}
                    >
                      {sub.name}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      {pill(isElective ? "Elective" : "Compulsory", isElective ? "blue" : "gold")}
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        fontFamily: FONT.sans,
                        fontSize: 12,
                        color: C.textMuted,
                      }}
                    >
                      {sub.sharedSlotId || "—"}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {/* Toggle type */}
                        <button
                          onClick={() =>
                            handleChangeType(
                              sub.id || sub._id,
                              isElective ? "compulsory" : "elective",
                              isElective ? null : (sub.sharedSlotId || null),
                            )
                          }
                          style={{
                            padding: "4px 10px",
                            background: "transparent",
                            border: `1px solid ${C.border}`,
                            borderRadius: 7,
                            fontFamily: FONT.sans,
                            fontSize: 11,
                            fontWeight: 600,
                            color: C.textMuted,
                            cursor: "pointer",
                          }}
                        >
                          Make {isElective ? "Compulsory" : "Elective"}
                        </button>
                        {/* Drop */}
                        <button
                          onClick={() =>
                            handleToggleOffering(sub.id || sub._id, true)
                          }
                          style={{
                            padding: "4px 10px",
                            background: "transparent",
                            border: "1px solid #a32d2d",
                            borderRadius: 7,
                            fontFamily: FONT.sans,
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#a32d2d",
                            cursor: "pointer",
                          }}
                        >
                          Drop
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Dropped Subjects */}
      {droppedSubjects.length > 0 && (
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 18px",
              borderBottom: `1px solid ${C.border}`,
              background: "#fafafa",
            }}
          >
            <p
              style={{
                fontFamily: FONT.sans,
                fontSize: 11,
                fontWeight: 700,
                color: C.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                margin: 0,
              }}
            >
              Dropped Subjects ({droppedSubjects.length})
            </p>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.sand }}>
                {["Subject", "Status", "Restore"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      fontFamily: FONT.sans,
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: C.textMuted,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {droppedSubjects.map((sub) => (
                <tr key={sub.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontFamily: FONT.sans,
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: C.textMuted,
                      textDecoration: "line-through",
                    }}
                  >
                    {sub.name}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    {pill("Dropped", "red")}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <button
                      onClick={() =>
                        handleToggleOffering(sub.id || sub._id, false)
                      }
                      style={{
                        padding: "4px 12px",
                        background: "transparent",
                        border: `1px solid ${C.gold}`,
                        borderRadius: 7,
                        fontFamily: FONT.sans,
                        fontSize: 11,
                        fontWeight: 700,
                        color: C.gold,
                        cursor: "pointer",
                      }}
                    >
                      Restore
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
