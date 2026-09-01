import React, { useState } from "react";
import styles from "./AdminDashboard.module.css";
import { Class } from "./types";
import { getSchoolId, request } from "../../lib/api";

const miniButtonStyle: React.CSSProperties = {
  padding: "5px 10px",
  background: "var(--goldL)",
  border: "1px solid var(--gold)",
  borderRadius: 6,
  fontSize: 11,
  fontWeight: 700,
  color: "var(--gold)",
  cursor: "pointer",
};

const modalHeaderStyle: React.CSSProperties = {
  padding: "20px 22px 16px",
  borderBottom: "1px solid var(--border)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const modalTitleStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--serif)",
  fontSize: "1.3rem",
  color: "var(--text)",
};

const closeButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: 22,
  color: "var(--textMut)",
  cursor: "pointer",
  lineHeight: 1,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--textMut)",
  textTransform: "uppercase",
  letterSpacing: ".05em",
  marginBottom: 6,
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "9px 18px",
  background: "var(--sand)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  color: "var(--textM)",
  cursor: "pointer",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "9px 18px",
  background: "var(--gold)",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "var(--gold)",
  textTransform: "uppercase",
  letterSpacing: ".09em",
  margin: "0 0 3px",
};

const pageTitleStyle: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: "1.8rem",
  fontWeight: 600,
  color: "var(--text)",
  margin: 0,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid var(--border)",
  borderRadius: 8,
  fontSize: 13.5,
  color: "var(--text)",
  background: "var(--cream)",
};

const noticeStyle: React.CSSProperties = {
  marginBottom: 12,
  background: "var(--sand)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: "11px 14px",
  fontSize: 12.5,
  color: "var(--textM)",
};

const tableHeadingStyle: React.CSSProperties = {
  padding: "9px 13px",
  textAlign: "left",
  fontSize: 10,
  fontWeight: 700,
  color: "var(--textMut)",
  letterSpacing: ".06em",
  textTransform: "uppercase",
  position: "sticky",
  top: 0,
  background: "var(--sand)",
  zIndex: 10,
  boxShadow: "inset 0 -1px 0 var(--borderL)",
};

const rowPrimaryTextStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "var(--text)",
  margin: 0,
};

const rowMetaTextStyle: React.CSSProperties = {
  fontSize: 10.5,
  color: "var(--textMut)",
  margin: 0,
};

const bodyTextStyle: React.CSSProperties = {
  padding: "10px 13px",
  fontSize: 12.5,
  color: "var(--textM)",
};

const emptyStateStyle: React.CSSProperties = {
  padding: "2.5rem",
  textAlign: "center",
  fontSize: "1.1rem",
  color: "var(--textF)",
};

const ClassTeacherModal: React.FC<{
  currentClass: Class;
  teachers: any;
  onClose: () => void;
  onSave: (teacherId: string) => Promise<void>;
}> = ({ currentClass, teachers, onClose, onSave }) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedTeacher = teachers.find(
    (t: any) => t.usersId === selectedTeacherId,
  );
  const isBusy =
    selectedTeacher &&
    Boolean(
      (selectedTeacher?.classGrade && selectedTeacher.classGrade !== "null") ||
        (selectedTeacher?.classStream &&
          selectedTeacher.classStream !== "null"),
    );

  return (
    <div>
      <div style={modalHeaderStyle}>
        <h3 style={modalTitleStyle}>Assign Class Teacher</h3>
        <button onClick={onClose} style={closeButtonStyle}>
          x
        </button>
      </div>

      <div style={{ padding: "18px 22px 22px" }}>
        <p style={{ fontSize: 13, color: "var(--textM)", marginBottom: 15 }}>
          Assigning a teacher to <strong>{currentClass.name}</strong>.
        </p>

        {error && (
          <div
            style={{
              ...noticeStyle,
              background: "var(--dBg)",
              color: "var(--dText)",
              border: `1px solid var(--dText)`,
              marginBottom: 15,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: "1.2rem" }}>
          <label style={labelStyle}>Select teacher</label>
          <select
            value={selectedTeacherId}
            onChange={(event) => {
              setSelectedTeacherId(event.target.value);
              setError("");
            }}
            style={inputStyle}
          >
            <option value="">-- Choose a teacher --</option>
            {teachers.map((teacher: any) => {
              const alreadyAssigned =
                (teacher?.classGrade && teacher.classGrade !== "null") ||
                (teacher?.classStream && teacher.classStream !== "null");
              const assignedLabel = alreadyAssigned
                ? `Grade ${
                    teacher.classGrade && teacher.classGrade !== "null"
                      ? teacher.classGrade
                      : ""
                  }${
                    teacher.classStream && teacher.classStream !== "null"
                      ? ` ${teacher.classStream}`
                      : ""
                  }`.trim()
                : "";
              return (
                <option key={teacher.usersId} value={teacher.usersId}>
                  {`${teacher?.firstName ? teacher.firstName : teacher?.email} ${teacher?.lastName ? teacher.lastName : " "}`}{" "}
                  {alreadyAssigned
                    ? `(Already assigned to ${assignedLabel})`
                    : ""}
                </option>
              );
            })}
          </select>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            marginTop: "1.5rem",
          }}
        >
          <button onClick={onClose} style={secondaryButtonStyle}>
            Cancel
          </button>
          <button
            onClick={async () => {
              if (!selectedTeacherId) return;
              if (isBusy) {
                const assignedLabel = `Grade ${
                  selectedTeacher?.classGrade && selectedTeacher.classGrade !== "null"
                    ? selectedTeacher.classGrade
                    : ""
                }${
                  selectedTeacher?.classStream && selectedTeacher.classStream !== "null"
                    ? ` ${selectedTeacher.classStream}`
                    : ""
                }`.trim();
                setError(
                  `${selectedTeacher?.firstName} is already assigned to ${assignedLabel}. Please unassign them first.`,
                );
                return;
              }
              setSaving(true);
              try {
                await onSave(selectedTeacherId);
              } finally {
                setSaving(false);
              }
            }}
            style={{
              ...primaryButtonStyle,
              opacity: isBusy ? 0.6 : 1,
              cursor: isBusy ? "not-allowed" : "pointer",
            }}
            disabled={saving}
          >
            {saving ? "Assigning..." : "Confirm Assignment"}
          </button>
        </div>
      </div>
    </div>
  );
};

const splitClassName = (className: string) => {
  const [grade = "", ...streamParts] = String(className || "")
    .trim()
    .split(/\s+/);
  return {
    grade,
    classStream: streamParts.join(" "),
  };
};

const RenameClassModal: React.FC<{
  currentClass: any;
  action: "save" | "create";
  onClose: () => void;
  onSaved: () => void;
}> = ({ currentClass, action, onClose, onSaved }) => {
  const parsed = splitClassName(currentClass?.className || "");
  const [grade, setGrade] = useState(
    currentClass?.grade || parsed?.grade || "",
  );
  const [stream, setStream] = useState(
    currentClass?.stream || parsed?.classStream || "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  return (
    <div>
      <div style={modalHeaderStyle}>
        <h3 style={modalTitleStyle}>Rename Class</h3>
        <button onClick={onClose} style={closeButtonStyle}>
          x
        </button>
      </div>
      <div style={{ padding: "18px 22px 22px", display: "grid", gap: 14 }}>
        {error && (
          <div
            style={{
              ...noticeStyle,
              background: "var(--dBg)",
              color: "var(--dText)",
            }}
          >
            {error}
          </div>
        )}
        <label>
          <span style={labelStyle}>Grade</span>
          <input
            value={grade}
            onChange={(event) => setGrade(event.target.value)}
            style={inputStyle}
          />
        </label>
        <label>
          <span style={labelStyle}>Stream</span>
          <input
            value={stream}
            onChange={(event) => setStream(event.target.value)}
            style={inputStyle}
          />
        </label>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={secondaryButtonStyle}>
            Cancel
          </button>
          <button
            onClick={async () => {
              if (!grade.trim()) {
                setError("Grade is required.");
                return;
              }
              setSaving(true);
              setError("");
              try {
                if (action === "save") {
                  await request("/update/class", {
                    method: "PATCH",
                    body: JSON.stringify({
                      classId: currentClass.classId,
                      schoolId: getSchoolId(),
                      grade: Number.isNaN(Number(grade))
                        ? grade
                        : Number(grade),
                      classStream: stream.trim(),
                      classTeacherId: currentClass.classTeacherId || null,
                    }),
                  });
                } else {
                  await request("/create/school/class", {
                    method: "POST",
                    body: JSON.stringify({
                      schoolId: getSchoolId(),
                      grade: Number.isNaN(Number(grade))
                        ? grade
                        : Number(grade),
                      classStream: stream.trim(),
                    }),
                  });
                }
                onSaved();
                onClose();
              } catch (error) {
                setError(
                  error instanceof Error
                    ? error.message
                    : "Unable to rename class.",
                );
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
            style={{ ...primaryButtonStyle, opacity: saving ? 0.65 : 1 }}
          >
            {saving ? "Saving..." : "Save class"}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ClassesTabProps {
  classes: Class[];
  teachers: any;
  onRefresh: () => void | Promise<void>;
  onUnassignClassTeacher: (teacherId: string) => Promise<void>;
  avatar: (name: string, size: number) => string;
  showModal: (content: React.ReactNode) => void;
  closeModal: () => void;
  showConfirm: (msg: string, onOk: () => void, danger?: boolean) => void;
  showSuccess: (msg: string) => void;
  onBulkTermUpdate?: (
    term: number,
    year: number,
    examType: string,
  ) => Promise<void>;
  onSwitchTab?: (tab: string) => void;
}

export const ClassesTab: React.FC<ClassesTabProps> = ({
  classes,
  teachers,
  onRefresh,
  avatar,
  showModal,
  closeModal,
  showConfirm,
  showSuccess,
}) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const classesFound = classes;
  const refresh = () => {
    void onRefresh();
  };
  const openAssignModal = (currentClass: any) => {
    showModal(
      <ClassTeacherModal
        currentClass={currentClass}
        teachers={teachers}
        onClose={closeModal}
        onSave={async (teacherId) => {
          await request("/update/class", {
            method: "PATCH",
            body: JSON.stringify({
              classId: currentClass?.classId,
              schoolId: getSchoolId(),
              classTeacherId: teacherId,
            }),
          }).then(() => {
            closeModal();
            refresh();
          });
        }}
      />,
    );
  };

  const openRenameModal = (currentClass: any, action: "save" | "create") => {
    showModal(
      <RenameClassModal
        action={action}
        currentClass={currentClass}
        onClose={closeModal}
        onSaved={refresh}
      />,
    );
  };

  const handleUnassign = (classId: any, currentClass: any) => {
    showConfirm(
      `Unassign <strong>${currentClass.classTeacher}</strong> from this class?`,
      async () => {
        const response: any = await request(`/unassign/classteacher`, {
          method: "PATCH",
          body: JSON.stringify({
            classId: classId,
            schoolId: getSchoolId(),
          }),
        });
        closeModal();
        refresh();
        if (response?.unassigned) {
          showSuccess(
            "Class teacher unassigned. The teacher now has no roles and will be redirected to the unassigned page on next login.",
          );
        }
      },
      true,
    );
  };

  const filteredClasses = classesFound?.filter((currentClass: any) => {
    const query = search.toLowerCase();
    const parsed = splitClassName(currentClass.className);
    const grade = String(
      currentClass.grade || parsed.grade || "",
    ).toLowerCase();
    const stream = String(
      currentClass.stream || parsed.classStream || "",
    ).toLowerCase();
    return (
      grade.includes(query) ||
      stream.includes(query) ||
      String(currentClass.className || "")
        .toLowerCase()
        .includes(query)
    );
  });
  const totalPages = Math.max(1, Math.ceil(filteredClasses.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedClasses = filteredClasses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  React.useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className={styles.anim}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.3rem",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <p style={eyebrowStyle}>Classes</p>
          <h2 style={pageTitleStyle}>Class management</h2>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => {
              openRenameModal(null, "create");
            }}
            style={{ ...primaryButtonStyle, background: "var(--gold)" }}
          >
            Create Class
          </button>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by grade or stream"
            style={{ ...inputStyle, width: 210 }}
          />
        </div>
      </div>

      <div style={noticeStyle}>
        Classes in this view are generated from real enrolled students and any
        class teachers assigned through the staff form.
      </div>

      <div
        style={{
          background: "var(--white)",
          border: "1px solid var(--border)",
          borderRadius: 13,
          overflow: "auto",
          maxHeight: "70vh",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--sand)" }}>
              {[
                "Class",
                "Grade",
                "Term",
                "Students",
                "Class Teacher",
                "Subjects",
                "Actions",
              ].map((heading) => (
                <th key={heading} style={tableHeadingStyle}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedClasses.map((currentClass: any) => {
              const classMeta = splitClassName(currentClass.className);
              return (
                <tr
                  key={currentClass.classId}
                  style={{
                    borderTop: "1px solid var(--borderL)",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "var(--ct-hover, rgba(0,0,0,0.02))")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td style={{ padding: "10px 13px" }}>
                    <p style={rowPrimaryTextStyle}>{currentClass.className}</p>
                  </td>
                  <td style={bodyTextStyle}>
                    {currentClass.grade || classMeta.grade}
                    {currentClass.stream || classMeta.classStream
                      ? ` ${currentClass.stream || classMeta.classStream}`
                      : ""}
                  </td>
                  <td style={bodyTextStyle}>
                    <span style={{ fontWeight: 600, color: "var(--gold)" }}>
                      T{currentClass.term || 1}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: "var(--textMut)",
                        marginLeft: 4,
                      }}
                    >
                      {currentClass.year || new Date().getFullYear()}
                    </span>
                  </td>
                  <td
                    style={{
                      ...bodyTextStyle,
                      fontWeight: 700,
                      color: "var(--text)",
                    }}
                  >
                    {currentClass.totalStudents}
                  </td>
                  <td style={{ padding: "10px 13px" }}>
                    {currentClass?.classTeacher ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <div
                            dangerouslySetInnerHTML={{
                              __html: avatar(
                                `${currentClass.classTeacher?.split(" ")[0]?.charAt(0)} ${currentClass.classTeacher?.split(" ")[1]?.charAt(0)}`,
                                26,
                              ),
                            }}
                          />
                          <div>
                            <p style={rowPrimaryTextStyle}>
                              {currentClass.classTeacher}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 5 }}>
                          <button
                            onClick={() =>
                              handleUnassign(currentClass.classId, currentClass)
                            }
                            style={{
                              ...miniButtonStyle,
                              background: "var(--dBg)",
                              color: "var(--dText)",
                              border: "1px solid var(--dText)",
                            }}
                          >
                            Unassign
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => openAssignModal(currentClass)}
                        style={miniButtonStyle}
                      >
                        Assign teacher
                      </button>
                    )}
                  </td>
                  <td style={bodyTextStyle}>
                    {currentClass.offeredSubjectIds
                      ? currentClass.offeredSubjectIds.length
                      : 0}
                  </td>
                  <td style={bodyTextStyle}>
                    <button
                      onClick={() => openRenameModal(currentClass, "save")}
                      style={miniButtonStyle}
                    >
                      Rename
                    </button>
                  </td>
                </tr>
              );
            })}

            {filteredClasses?.length === 0 && (
              <tr>
                <td colSpan={5} style={emptyStateStyle}>
                  No classes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filteredClasses.length > pageSize && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginTop: 12,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{ fontSize: 12, fontWeight: 700, color: "var(--textMut)" }}
          >
            Page {currentPage} of {totalPages} | {filteredClasses.length} classes
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              style={secondaryButtonStyle}
              disabled={currentPage <= 1}
              onClick={() => setPage((previous) => Math.max(1, previous - 1))}
            >
              Previous
            </button>
            <button
              style={secondaryButtonStyle}
              disabled={currentPage >= totalPages}
              onClick={() =>
                setPage((previous) => Math.min(totalPages, previous + 1))
              }
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
