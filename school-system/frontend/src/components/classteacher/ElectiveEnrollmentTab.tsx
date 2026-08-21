// components/classteacher/ElectiveEnrollmentTab.tsx
// Class teacher can enroll students of their class into elective subjects
import React, { useState, useCallback, useEffect } from "react";
import { C, FONT } from "./shared/constants";
import { api, getSchoolId, request } from "../../lib/api";
import { Avatar } from "./shared/Avatar";

interface ElectiveEnrollmentTabProps {
  students: any[];
  subjects: any[]; // classSubjectCatalog (includes isOffered, enrollmentMode)
  user: any;
  // onRefresh: () => void;
}

const buildElectiveGroups = (subjects: any[]) => {
  const electives = subjects.filter(
    (s) => s.isOffered !== false && s.enrollmentMode === "ELECTIVE",
  );
  // Group by sharedSlotId
  const groups: Record<string, any[]> = {};
  const noSlot: any[] = [];
  electives.forEach((s) => {
    if (s.sharedSlotId) {
      const key = String(s.sharedSlotId);
      groups[key] = groups[key] || [];
      groups[key].push(s);
    } else {
      noSlot.push(s);
    }
  });
  return { groups, noSlot, electives };
};

const isEnrolled = (student: any, subjectId: string) => {
  return (student.enrolledSubjects || []).some(
    (e: any) => String(e).trim() === String(subjectId).trim(),
  );
};

export const ElectiveEnrollmentTab: React.FC<ElectiveEnrollmentTabProps> = ({
  students,
  subjects,
  user,
  // onRefresh,
}) => {
  const [saving, setSaving] = useState<string | null>(null); // subjectId being saved
  const [msg, setMsg] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());

  const showMsg = (text: string, type: "success" | "error") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4000);
  };

  const { electives } = buildElectiveGroups(subjects);

  const activeStudents = students.filter(
    (s) => String(s.status || "Active").toLowerCase() === "active",
  );

  const filteredStudents = activeStudents.filter(
    (s) =>
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      String(s.admissionNo || s.adm || "").includes(search),
  );

  const currentSubject = electives.find((e) => e.id === selectedSubjectId);

  const handleEnrollOne = async (
    studentId: string,
    action: "enroll" | "unenroll",
  ) => {
    if (!selectedSubjectId) return;
    setSaving(studentId);
    try {
      action === "enroll"
        ? await request("/register/singlestudent/subject-joint", {
            method: "POST",
            body: JSON.stringify({
              schoolId: getSchoolId(),
              subjectJoint: selectedSubjectId,
              studentId: studentId,
              electiveCode: currentSubject?.sharedSlotId,
            }),
          })
        : await request("/delete/single/enrollment", {
            method: "DELETE",
            body: JSON.stringify({
              schoolId: getSchoolId(),
              subjectJointId: selectedSubjectId,
              studentId: studentId,
              enrollmentCode: currentSubject?.sharedSlotId,
            }),
          });

      showMsg(
        action === "enroll"
          ? "Student enrolled successfully."
          : "Student unenrolled.",
        "success",
      );
      // onRefresh();
    } catch (err: any) {
      showMsg(err.message || "Operation failed.", "error");
    } finally {
      setSaving(null);
    }
  };

  const handleBulkAction = async (action: "enroll" | "unenroll") => {
    console.log("Bulk action hitted, enrollment mode ", action);
    if (!selectedSubjectId || bulkSelected.size === 0) return;
    setSaving("bulk");
    const enrolledSubjectCode = subjects.filter(
      (v) => v.id == selectedSubjectId,
    );
    try {
      console.log(Array.from(bulkSelected));

      action === "enroll"
        ? await request("/register/multpile/students/subject-joint", {
            method: "POST",
            body: JSON.stringify({
              studentsId: Array.from(bulkSelected),
              subjectId: selectedSubjectId,
              schoolId: getSchoolId(),
              electiveCode: enrolledSubjectCode[0]?.sharedSlotId,
            }),
          })
        : await request("/delete/multiple/enrollment", {
            method: "DELETE",
            body: JSON.stringify({
              studentIds: Array.from(bulkSelected),
              schoolId: getSchoolId(),
              enrollmentCode: enrolledSubjectCode[0]?.sharedSlotId,
            }),
          });
      showMsg(
        `${bulkSelected.size} student(s) ${action === "enroll" ? "enrolled" : "unenrolled"}.`,
        "success",
      );
      setBulkSelected(new Set());
      // onRefresh();
    } catch (err: any) {
      showMsg(err.message || "Bulk operation failed.", "error");
    } finally {
      setSaving(null);
    }
  };

  const toggleBulkSelect = (studentId: string) => {
    setBulkSelected((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (bulkSelected.size === filteredStudents.length) {
      setBulkSelected(new Set());
    } else {
      setBulkSelected(new Set(filteredStudents.map((s) => String(s.id))));
    }
  };

  // Set first elective as default
  useEffect(() => {
    if (electives.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(electives[0].id);
    }
  }, [electives, selectedSubjectId]);

  return (
    <div
      className="ct-anim"
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
    >
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
          Enrollment
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
          Elective Subject Enrollment
        </h2>
        <p
          style={{
            fontFamily: FONT.sans,
            fontSize: 13,
            color: C.textMuted,
            margin: 0,
          }}
        >
          Enroll or unenroll students of Grade {user?.classGrade}{" "}
          {user?.classStream} into elective subjects.
        </p>
      </div>

      {/* Message */}
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

      {electives.length === 0 ? (
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            background: C.white,
            border: `1px dashed ${C.border}`,
            borderRadius: 14,
            color: C.textMuted,
            fontFamily: FONT.sans,
            fontSize: 14,
          }}
        >
          No elective subjects are registered for this class yet.
          <br />
          <button
            style={{
              marginTop: 14,
              padding: "8px 18px",
              background: C.gold,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontFamily: FONT.sans,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
            onClick={() => {}}
          >
            Go to Subject Registration →
          </button>
        </div>
      ) : (
        <>
          {/* Subject selector + bulk actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "14px 16px",
            }}
          >
            <div style={{ flex: 1, minWidth: 200 }}>
              <label
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: C.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Elective Subject
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  setBulkSelected(new Set());
                }}
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
                {electives.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                    {e.sharedSlotId ? ` (Slot: ${e.sharedSlotId})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div style={{ flex: 1, minWidth: 180 }}>
              <label
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: C.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Search Students
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name or admission no…"
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

            {/* Bulk actions */}
            {bulkSelected.size > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-end",
                  paddingTop: 18,
                }}
              >
                <button
                  onClick={() => handleBulkAction("enroll")}
                  disabled={saving === "bulk"}
                  style={{
                    padding: "9px 16px",
                    background: C.gold,
                    color: "#fff",
                    border: "none",
                    borderRadius: 9,
                    fontFamily: FONT.sans,
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {saving === "bulk" ? "…" : `Enroll ${bulkSelected.size}`}
                </button>
                <button
                  onClick={() => handleBulkAction("unenroll")}
                  disabled={saving === "bulk"}
                  style={{
                    padding: "9px 16px",
                    background: "transparent",
                    border: "1px solid #a32d2d",
                    borderRadius: 9,
                    fontFamily: FONT.sans,
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: "#a32d2d",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {saving === "bulk" ? "…" : `Unenroll ${bulkSelected.size}`}
                </button>
              </div>
            )}
          </div>

          {/* Students table */}
          <div
            style={{
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            {/* Summary bar */}
            {currentSubject && (
              <div
                style={{
                  padding: "10px 16px",
                  background: "rgba(201,150,61,0.06)",
                  borderBottom: `1px solid ${C.border}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <p
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.text,
                    margin: 0,
                  }}
                >
                  {currentSubject.name}
                </p>
                {currentSubject.sharedSlotId && (
                  <span
                    style={{
                      fontFamily: FONT.sans,
                      fontSize: 11,
                      color: C.textMuted,
                      background: C.sand,
                      padding: "2px 8px",
                      borderRadius: 6,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    Slot: {currentSubject.sharedSlotId}
                  </span>
                )}
                <span
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 12,
                    color: C.textMuted,
                    marginLeft: "auto",
                  }}
                >
                  {
                    activeStudents.filter((s) =>
                      isEnrolled(s, selectedSubjectId),
                    ).length
                  }{" "}
                  enrolled / {activeStudents.length} total
                </span>
              </div>
            )}

            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 480,
                }}
              >
                <thead>
                  <tr style={{ background: C.sand }}>
                    <th
                      style={{
                        padding: "10px 14px",
                        width: 36,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={
                          filteredStudents.length > 0 &&
                          bulkSelected.size === filteredStudents.length
                        }
                        onChange={toggleSelectAll}
                        style={{ cursor: "pointer" }}
                      />
                    </th>
                    {["Student", "Adm No", "Status", "Action"].map((h) => (
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
                  {filteredStudents.map((student) => {
                    const enrolled = selectedSubjectId
                      ? isEnrolled(student, selectedSubjectId)
                      : false;
                    const sid = String(student.id);
                    const isSaving = saving === sid;

                    return (
                      <tr
                        key={student.id}
                        style={{
                          borderBottom: `1px solid ${C.border}`,
                          background: enrolled
                            ? "rgba(29,158,117,0.03)"
                            : "transparent",
                          transition: "background 0.15s",
                        }}
                      >
                        <td style={{ padding: "10px 14px", width: 36 }}>
                          <input
                            type="checkbox"
                            checked={bulkSelected.has(sid)}
                            onChange={() => toggleBulkSelect(sid)}
                            style={{ cursor: "pointer" }}
                          />
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 9,
                            }}
                          >
                            <Avatar name={student.name} size={30} />
                            <span
                              style={{
                                fontFamily: FONT.sans,
                                fontSize: 13.5,
                                fontWeight: 600,
                                color: C.text,
                              }}
                            >
                              {student.name}
                            </span>
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "10px 14px",
                            fontFamily: FONT.sans,
                            fontSize: 12.5,
                            color: C.textMuted,
                          }}
                        >
                          {student.admissionNo || student.adm || "—"}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "3px 9px",
                              borderRadius: 20,
                              fontSize: 10.5,
                              fontWeight: 700,
                              fontFamily: FONT.sans,
                              background: enrolled
                                ? "rgba(29,158,117,0.12)"
                                : C.sand,
                              color: enrolled ? "#1D9E75" : C.textMuted,
                            }}
                          >
                            {enrolled ? "Enrolled" : "Not enrolled"}
                          </span>
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          {enrolled ? (
                            <button
                              disabled={isSaving || !selectedSubjectId}
                              onClick={() => handleEnrollOne(sid, "unenroll")}
                              style={{
                                padding: "5px 13px",
                                background: "transparent",
                                border: "1px solid #a32d2d",
                                borderRadius: 7,
                                fontFamily: FONT.sans,
                                fontSize: 11.5,
                                fontWeight: 700,
                                color: "#a32d2d",
                                cursor: isSaving ? "not-allowed" : "pointer",
                                opacity: isSaving ? 0.6 : 1,
                              }}
                            >
                              {isSaving ? "…" : "Unenroll"}
                            </button>
                          ) : (
                            <button
                              disabled={isSaving || !selectedSubjectId}
                              onClick={() => handleEnrollOne(sid, "enroll")}
                              style={{
                                padding: "5px 13px",
                                background: C.gold,
                                border: "none",
                                borderRadius: 7,
                                fontFamily: FONT.sans,
                                fontSize: 11.5,
                                fontWeight: 700,
                                color: "#fff",
                                cursor: isSaving ? "not-allowed" : "pointer",
                                opacity: isSaving ? 0.6 : 1,
                              }}
                            >
                              {isSaving ? "…" : "Enroll"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredStudents.length === 0 && (
                <div
                  style={{
                    padding: "40px 24px",
                    textAlign: "center",
                    color: C.textMuted,
                    fontFamily: FONT.sans,
                    fontSize: 14,
                  }}
                >
                  No students match your search.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
