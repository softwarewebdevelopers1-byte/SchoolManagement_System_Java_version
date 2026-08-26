import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Class, ClassSubjectSetting, Student, Subject } from "./types";
import { useClassesData } from "../../lib/adminData";
import { getSchoolId, request } from "../../lib/api";
import PhoneInput from "../shared/PhoneInput";

/* =========================================================
   STYLES
========================================================= */

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

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11.5,
  fontWeight: 700,
  color: "var(--textM)",
  letterSpacing: ".03em",
  marginBottom: 5,
};

const modalHeaderStyle: React.CSSProperties = {
  padding: "18px 22px 14px",
  borderBottom: "1px solid var(--border)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const modalTitleStyle: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: "1.3rem",
  fontWeight: 600,
  color: "var(--text)",
};

const closeButtonStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 7,
  background: "var(--sand)",
  border: "none",
  cursor: "pointer",
  fontSize: 16,
  fontWeight: 700,
  color: "var(--textMut)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid var(--border)",
  borderRadius: 8,
  fontSize: 13.5,
  color: "var(--text)",
  background: "var(--cream)",
  boxSizing: "border-box",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  background: "var(--sand)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  color: "var(--textM)",
  cursor: "pointer",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  background: "var(--gold)",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

const iconButtonStyle: React.CSSProperties = {
  padding: "4px 10px",
  borderRadius: 20,
  background: "var(--sand)",
  border: "1px solid var(--border)",
  cursor: "pointer",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--textMut)",
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

const smallLabelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "var(--textF)",
  textTransform: "uppercase",
  letterSpacing: ".05em",
  margin: "0 0 5px",
};

const metricValueStyle: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: "1.9rem",
  fontWeight: 600,
  color: "var(--text)",
  margin: 0,
};

const emptyCellStyle: React.CSSProperties = {
  padding: "2.5rem",
  textAlign: "center",
  fontSize: "1.1rem",
  color: "var(--textF)",
};

/* =========================================================
   STAT CARD
========================================================= */

const StatCard: React.FC<{
  label: string;
  value: number;
  accent?: string;
}> = ({ label, value, accent = "var(--gold)" }) => (
  <div
    style={{
      background: "var(--white)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      padding: "1rem 1.1rem",
      borderTop: `3px solid ${accent}`,
    }}
  >
    <p style={smallLabelStyle}>{label}</p>
    <p style={metricValueStyle}>{value}</p>
  </div>
);

/* =========================================================
   TYPES
========================================================= */

type StudentPayload = {
  studentFullName: string;
  studentAdm: string;
  email: string;
  guardianName?: string | null;
  phoneNumber: string;
  classId: string;
  schoolId: string;
  gender?: string;
  status?: string;
};

type MultipleStudentRow = {
  id: string;
  studentFullName: string;
  studentAdm: string;
  email: string;
  guardianName: string;
  phoneNumber: string;
  classId: string;
  gender: string;
};

/* =========================================================
   EMPTY MULTIPLE STUDENT ROW
========================================================= */

const createStudentRow = (): MultipleStudentRow => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  studentFullName: "",
  studentAdm: "",
  email: "",
  guardianName: "",
  phoneNumber: "",
  classId: "",
  gender: "",
});

/* =========================================================
   STUDENT FORM MODAL
========================================================= */

const StudentFormModal: React.FC<{
  student: Student | null;
  currentClass: any;
  gradeOptions: string[];
  streamOptions: string[];
  subjects: Subject[];
  classSubjectSettings: ClassSubjectSetting[];
  onClose: () => void;

  onSave: (payload: StudentPayload) => Promise<void>;

  onBulkSave?: (payload: StudentPayload[]) => Promise<void>;
}> = ({
  student,
  onClose,
  onSave,
  onBulkSave,
}) => {
  console.log(student);
  
  const [isCompact, setIsCompact] = useState(
    () =>
      typeof window !== "undefined" && window.innerWidth <= 640,
  );

  /*
   * false = existing single student form
   * true  = multiple student registration
   */
  const [multipleMode, setMultipleMode] = useState(false);

  /* =====================================================
     SINGLE STUDENT STATE
  ===================================================== */

  const [name, setName] = useState(
    student?.studentFullName || "",
  );

  const [admissionNo, setAdmissionNo] = useState(
    student?.studentAdm || "",
  );

  const [guardianName, setGuardianName] = useState(
    student?.guardianName || "",
  );

  const [gender, setGender] = useState(
    student?.gender || "",
  );

  const [status, setStatus] = useState(
    student?.status || "ACTIVE",
  );

  const [email, setEmail] = useState(
    student?.email || "",
  );

  const [guardianPhone, setGuardianPhone] = useState(
    student?.phoneNumber || "",
  );

  const [grade, setGrade] = useState(
    student
      ? `${student.classGrade || ""} ${
          student.classStream || ""
        }`.trim()
      : "",
  );

  const { classesFound } = useClassesData() as any;

  const [classSelectedId, setClassSelectedId] = useState(
    () => {
      if (!student || !classesFound?.length) return "";

      const studentClass = classesFound.find(
        (currentClass: any) =>
          currentClass.className ===
          `${student.classGrade || ""} ${
            student.classStream || ""
          }`.trim(),
      );

      return studentClass?.classId || student.classId || "";
    },
  );

  /* =====================================================
     MULTIPLE STUDENT STATE
  ===================================================== */

  const [multipleStudents, setMultipleStudents] = useState<
    MultipleStudentRow[]
  >([createStudentRow()]);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  /* =====================================================
     RESPONSIVE
  ===================================================== */

  useEffect(() => {
    const handleResize = () =>
      setIsCompact(window.innerWidth <= 640);

    window.addEventListener("resize", handleResize);

    return () =>
      window.removeEventListener("resize", handleResize);
  }, []);

  /* =====================================================
     MULTIPLE STUDENT HELPERS
  ===================================================== */

  const updateMultipleStudent = (
    rowId: string,
    field: keyof MultipleStudentRow,
    value: string,
  ) => {
    setMultipleStudents((previous) =>
      previous.map((row) =>
        row.id === rowId
          ? {
              ...row,
              [field]: value,
            }
          : row,
      ),
    );
  };

  const addStudentRow = () => {
    setMultipleStudents((previous) => [
      ...previous,
      createStudentRow(),
    ]);
  };

  const removeStudentRow = (rowId: string) => {
    setMultipleStudents((previous) => {
      if (previous.length <= 1) {
        return previous;
      }

      return previous.filter((row) => row.id !== rowId);
    });
  };

  const switchToMultipleMode = () => {
    setErrorMsg("");
    setMultipleMode(true);

    /*
     * Start with one blank row.
     * This intentionally does not copy the single form's
     * values because multiple enrollment should be clean.
     */
    setMultipleStudents([createStudentRow()]);
  };

  const switchToSingleMode = () => {
    setErrorMsg("");
    setMultipleMode(false);
  };

  /* =====================================================
     CLASS LOOKUP
  ===================================================== */

  const getClassIdFromName = (value: string) => {
    const found = classesFound?.find(
      (currentClass: any) =>
        currentClass.className === value,
    );

    return found?.classId || "";
  };

  /* =====================================================
     SINGLE SAVE
  ===================================================== */

  const handleSingleSave = async () => {
    if (!name.trim()) {
      setErrorMsg("Student full name is required.");
      return;
    }

    if (guardianPhone) {
      if (guardianPhone.length < 13) {
        setErrorMsg(
          "Phone number must have 9 digits after +254.",
        );
        return;
      }
    }

    setErrorMsg("");
    setSaving(true);

    try {
      await onSave({
        studentFullName: name.trim(),
        studentAdm: admissionNo.trim(),
        gender: gender || "",
        phoneNumber: guardianPhone.trim(),
        guardianName: guardianName.trim() || null,
        classId: classSelectedId || "",
        schoolId: getSchoolId()!,
        email: email.trim(),
        status: status.toUpperCase(),
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(
        err?.message || "Failed to save student.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     MULTIPLE SAVE
  ===================================================== */

  const handleMultipleSave = async () => {
    if (!multipleStudents.length) {
      setErrorMsg("Add at least one student.");
      return;
    }

    const invalidIndex = multipleStudents.findIndex(
      (row) => !row.studentFullName.trim(),
    );

    if (invalidIndex >= 0) {
      setErrorMsg(
        `Student ${invalidIndex + 1}: full name is required.`,
      );
      return;
    }

    const schoolId = getSchoolId();

    if (!schoolId) {
      setErrorMsg(
        "School information could not be determined.",
      );
      return;
    }

    /*
     * Phone validation only when phone is provided.
     */
    const invalidPhoneIndex = multipleStudents.findIndex(
      (row) =>
        row.phoneNumber.trim() &&
        row.phoneNumber.trim().length < 13,
    );

    if (invalidPhoneIndex >= 0) {
      setErrorMsg(
        `Student ${
          invalidPhoneIndex + 1
        }: phone number must have 9 digits after +254.`,
      );
      return;
    }

    setErrorMsg("");
    setSaving(true);

    try {
      const payload: StudentPayload[] =
        multipleStudents.map((row) => ({
          studentFullName:
            row.studentFullName.trim(),

          studentAdm:
            row.studentAdm.trim(),

          email:
            row.email.trim(),

          guardianName:
            row.guardianName.trim() || null,

          phoneNumber:
            row.phoneNumber.trim(),

          classId:
            row.classId || "",

          schoolId,

          gender:
            row.gender || "NOT_SET",
        }));

      /*
       * IMPORTANT:
       *
       * The existing bulk API is retained.
       *
       * No backend endpoint is changed.
       */
      if (onBulkSave) {
        await onBulkSave(payload);
      } else {
        await request("/register/students/bulk", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      onClose();
    } catch (err: any) {
      setErrorMsg(
        err?.message ||
          "Failed to enroll the students.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     MULTIPLE STUDENT ROW
  ===================================================== */

  const renderMultipleStudentRow = (
    row: MultipleStudentRow,
    index: number,
  ) => (
    <div
      key={row.id}
      style={{
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: isCompact ? 12 : 14,
        marginBottom: 12,
        background: "var(--white)",
      }}
    >
      {/* ROW HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 800,
              color: "var(--text)",
            }}
          >
            Student {index + 1}
          </p>

          <p
            style={{
              margin: "3px 0 0",
              fontSize: 10,
              color: "var(--textMut)",
            }}
          >
            Full name is required. Other details are optional.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 6,
          }}
        >
          <button
            type="button"
            onClick={addStudentRow}
            title="Add another student"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--sand)",
              color: "var(--text)",
              cursor: "pointer",
              fontSize: 18,
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            +
          </button>

          <button
            type="button"
            onClick={() =>
              removeStudentRow(row.id)
            }
            disabled={multipleStudents.length <= 1}
            title="Remove student"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "1px solid var(--border)",
              background:
                multipleStudents.length <= 1
                  ? "var(--sand)"
                  : "var(--dBg)",
              color:
                multipleStudents.length <= 1
                  ? "var(--textF)"
                  : "var(--dText)",
              cursor:
                multipleStudents.length <= 1
                  ? "not-allowed"
                  : "pointer",
              fontSize: 18,
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            −
          </button>
        </div>
      </div>

      {/* NAME */}

      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>
          Student full name <span style={{ color: "var(--gold)" }}>*</span>
        </label>

        <input
          type="text"
          value={row.studentFullName}
          onChange={(event) =>
            updateMultipleStudent(
              row.id,
              "studentFullName",
              event.target.value,
            )
          }
          placeholder="e.g. Amina Wanjiku"
          style={inputStyle}
          autoComplete="off"
        />
      </div>

      {/* ADMISSION + GENDER */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isCompact
            ? "1fr"
            : "1fr 1fr",
          gap: 12,
        }}
      >
        <div>
          <label style={labelStyle}>
            Admission no. <span style={{ color: "var(--textF)" }}>(optional)</span>
          </label>

          <input
            type="text"
            value={row.studentAdm}
            onChange={(event) =>
              updateMultipleStudent(
                row.id,
                "studentAdm",
                event.target.value,
              )
            }
            placeholder="e.g. ADM-1042"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>
            Gender <span style={{ color: "var(--textF)" }}>(optional)</span>
          </label>

          <select
            value={row.gender}
            onChange={(event) =>
              updateMultipleStudent(
                row.id,
                "gender",
                event.target.value,
              )
            }
            style={inputStyle}
          >
            <option value="">
              -- select --
            </option>

            <option value="FEMALE">
              Female
            </option>

            <option value="MALE">
              Male
            </option>

            <option value="NOT_SET">
              Not set
            </option>
          </select>
        </div>
      </div>

      {/* CLASS */}

      <div style={{ marginTop: 12 }}>
        <label style={labelStyle}>
          Class <span style={{ color: "var(--textF)" }}>(optional)</span>
        </label>

        <select
          value={row.classId}
          onChange={(event) =>
            updateMultipleStudent(
              row.id,
              "classId",
              event.target.value,
            )
          }
          style={inputStyle}
        >
          <option value="">
            -- select class --
          </option>

          {(classesFound || []).map(
            (currentClass: any) => (
              <option
                key={currentClass.classId}
                value={currentClass.classId}
              >
                {currentClass.className}
              </option>
            ),
          )}
        </select>
      </div>

      {/* GUARDIAN */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isCompact
            ? "1fr"
            : "1fr 1fr",
          gap: 12,
          marginTop: 12,
        }}
      >
        <div>
          <label style={labelStyle}>
            Guardian name <span style={{ color: "var(--textF)" }}>(optional)</span>
          </label>

          <input
            type="text"
            value={row.guardianName}
            onChange={(event) =>
              updateMultipleStudent(
                row.id,
                "guardianName",
                event.target.value,
              )
            }
            placeholder="e.g. Alex Wanjiku"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>
            Email <span style={{ color: "var(--textF)" }}>(optional)</span>
          </label>

          <input
            type="email"
            value={row.email}
            onChange={(event) =>
              updateMultipleStudent(
                row.id,
                "email",
                event.target.value,
              )
            }
            placeholder="example@edunex.com"
            style={inputStyle}
          />
        </div>
      </div>

      {/* PHONE */}

      <div style={{ marginTop: 12 }}>
        <label style={labelStyle}>
          Guardian phone <span style={{ color: "var(--textF)" }}>(optional)</span>
        </label>

        <PhoneInput
          value={row.phoneNumber}
          onChange={(event) =>
            updateMultipleStudent(
              row.id,
              "phoneNumber",
              event.target.value,
            )
          }
          name={`phone-${row.id}`}
          style={inputStyle}
        />
      </div>
    </div>
  );

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div>
      {/* HEADER */}

      <div style={modalHeaderStyle}>
        <div>
          <h3 style={modalTitleStyle}>
            {student
              ? "Update student"
              : multipleMode
                ? "Enroll multiple students"
                : "Add student"}
          </h3>

          {!student && (
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 10.5,
                color: "var(--textMut)",
              }}
            >
              Add one student or enroll several students at once.
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          style={closeButtonStyle}
          type="button"
        >
          ×
        </button>
      </div>

      <div
        style={{
          padding: isCompact
            ? "14px 14px 18px"
            : "18px 22px 22px",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        {/* ERROR */}

        {errorMsg && (
          <div
            style={{
              padding: "10px 12px",
              marginBottom: 15,
              background: "#fdeaea",
              color: "#a32d2d",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* =================================================
            MODE SWITCH
        ================================================= */}

        {!student && (
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 18,
              padding: 4,
              borderRadius: 10,
              background: "var(--sand)",
              border: "1px solid var(--border)",
            }}
          >
            <button
              type="button"
              onClick={switchToSingleMode}
              style={{
                flex: 1,
                padding: "9px 12px",
                borderRadius: 7,
                border: "none",
                cursor: "pointer",
                background: !multipleMode
                  ? "var(--white)"
                  : "transparent",
                color: "var(--text)",
                fontWeight: 700,
                fontSize: 12,
                boxShadow: !multipleMode
                  ? "0 1px 3px rgba(0,0,0,.08)"
                  : "none",
              }}
            >
              Single student
            </button>

            <button
              type="button"
              onClick={switchToMultipleMode}
              style={{
                flex: 1,
                padding: "9px 12px",
                borderRadius: 7,
                border: "none",
                cursor: "pointer",
                background: multipleMode
                  ? "var(--white)"
                  : "transparent",
                color: "var(--text)",
                fontWeight: 700,
                fontSize: 12,
                boxShadow: multipleMode
                  ? "0 1px 3px rgba(0,0,0,.08)"
                  : "none",
              }}
            >
              Multiple students
            </button>
          </div>
        )}

        {/* =================================================
            MULTIPLE STUDENT FORM
        ================================================= */}

        {!student && multipleMode ? (
          <>
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 9,
                background: "var(--sand)",
                border: "1px solid var(--border)",
                marginBottom: 14,
                fontSize: 11.5,
                color: "var(--textM)",
              }}
            >
              <strong>
                Quick enrollment:
              </strong>{" "}
              Add as many students as needed using{" "}
              <strong>+</strong>. Only the{" "}
              <strong>student full name</strong> is required.
              You can fill in the remaining details whenever they
              are available.
            </div>

            {multipleStudents.map(
              renderMultipleStudentRow,
            )}

            {/* ADD ANOTHER */}

            <button
              type="button"
              onClick={addStudentRow}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 9,
                border: "1.5px dashed var(--gold)",
                background: "transparent",
                color: "var(--gold)",
                cursor: "pointer",
                fontSize: 12.5,
                fontWeight: 800,
                marginTop: 2,
              }}
            >
              + Add another student
            </button>

            {/* ACTIONS */}

            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                marginTop: "1.5rem",
                flexDirection: isCompact
                  ? "column-reverse"
                  : "row",
              }}
            >
              <button
                onClick={onClose}
                style={secondaryButtonStyle}
                type="button"
                disabled={saving}
              >
                Cancel
              </button>

              <button
                onClick={handleMultipleSave}
                style={{
                  ...primaryButtonStyle,
                  opacity: saving ? 0.7 : 1,
                }}
                type="button"
                disabled={saving}
              >
                {saving
                  ? "Enrolling..."
                  : `Enroll ${multipleStudents.length} student${
                      multipleStudents.length === 1
                        ? ""
                        : "s"
                    }`}
              </button>
            </div>
          </>
        ) : (
          /* =================================================
             EXISTING SINGLE STUDENT FORM
          ================================================= */
          <>
            {/* NAME */}

            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>
                Student full name{" "}
                <span style={{ color: "var(--gold)" }}>
                  *
                </span>
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="e.g. Amina Wanjiku"
                style={inputStyle}
              />
            </div>

            {/* GUARDIAN */}

            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>
                Guardian name{" "}
                {!student && (
                  <span style={{ color: "var(--textF)" }}>
                    (optional)
                  </span>
                )}
              </label>

              <input
                type="text"
                value={guardianName}
                onChange={(event) =>
                  setGuardianName(event.target.value)
                }
                placeholder="e.g. Alex"
                style={inputStyle}
              />
            </div>

            {/* EMAIL */}

            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>
                Email{" "}
                {!student && (
                  <span style={{ color: "var(--textF)" }}>
                    (optional)
                  </span>
                )}
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="e.g. example@edunex.com"
                style={inputStyle}
              />
            </div>

            {/* ADMISSION + GENDER */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isCompact
                  ? "1fr"
                  : "1fr 1fr",
                gap: 12,
              }}
            >
              <div>
                <label style={labelStyle}>
                  Admission no.{" "}
                  {!student && (
                    <span style={{ color: "var(--textF)" }}>
                      (optional)
                    </span>
                  )}
                </label>

                <input
                  type="text"
                  value={admissionNo}
                  onChange={(event) =>
                    setAdmissionNo(event.target.value)
                  }
                  placeholder="e.g. ADM-1042"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Gender{" "}
                  {!student && (
                    <span style={{ color: "var(--textF)" }}>
                      (optional)
                    </span>
                  )}
                </label>

                <select
                  value={gender}
                  onChange={(event) =>
                    setGender(event.target.value)
                  }
                  style={inputStyle}
                >
                  <option value="">
                    -- select --
                  </option>

                  <option value="FEMALE">
                    Female
                  </option>

                  <option value="MALE">
                    Male
                  </option>

                  <option value="NOT_SET">
                    Not set
                  </option>
                </select>
              </div>
            </div>

            {/* CLASS */}

            <div style={{ marginTop: "1rem" }}>
              <label style={labelStyle}>
                Class
              </label>

              <select
                value={grade}
                onChange={(event) => {
                  const selectedClassName =
                    event.target.value;

                  setGrade(selectedClassName);

                  const selectedClass =
                    classesFound?.find(
                      (currentClass: any) =>
                        currentClass.className ===
                        selectedClassName,
                    );

                  setClassSelectedId(
                    selectedClass?.classId || "",
                  );
                }}
                style={inputStyle}
              >
                <option value="">
                  -- select --
                </option>

                {(classesFound || []).map(
                  (currentClass: any) => (
                    <option
                      key={currentClass.classId}
                      value={currentClass.className}
                    >
                      {currentClass.className}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* STATUS - UPDATE ONLY */}

            {student && (
              <div style={{ marginTop: "1rem" }}>
                <label style={labelStyle}>
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value)
                  }
                  style={inputStyle}
                >
                  <option value="ACTIVE">
                    active
                  </option>

                  <option value="INACTIVE">
                    inactive
                  </option>

                  <option value="DELETED">
                    deleted
                  </option>
                </select>
              </div>
            )}

            {/* PHONE */}

            <div style={{ marginTop: "1rem" }}>
              <label style={labelStyle}>
                Guardian phone{" "}
                {!student && (
                  <span style={{ color: "var(--textF)" }}>
                    (optional)
                  </span>
                )}
              </label>

              <PhoneInput
                value={guardianPhone}
                onChange={(event) =>
                  setGuardianPhone(event.target.value)
                }
                name="phone"
                style={inputStyle}
              />
            </div>

            {/* ACTIONS */}

            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                marginTop: "1.5rem",
                flexDirection: isCompact
                  ? "column-reverse"
                  : "row",
              }}
            >
              <button
                onClick={onClose}
                style={secondaryButtonStyle}
                type="button"
                disabled={saving}
              >
                Cancel
              </button>

              <button
                onClick={handleSingleSave}
                style={{
                  ...primaryButtonStyle,
                  opacity: saving ? 0.7 : 1,
                }}
                type="button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : student
                    ? "Save changes"
                    : "Enroll student"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   STUDENTS TAB PROPS
========================================================= */

interface StudentsTabProps {
  students: Student[];
  classes: any;
  subjects: Subject[];
  classSubjectSettings: ClassSubjectSetting[];

  onSaveStudent: (
    payload: StudentPayload,
    studentId?: string,
  ) => Promise<void>;

  onDeleteStudent: (
    studentId: string,
  ) => Promise<void>;

  pill: (
    text: string,
    color: string,
  ) => string;

  showModal: (
    content: React.ReactNode,
  ) => void;

  closeModal: () => void;

  showConfirm: (
    msg: string,
    onOk: () => void,
    danger?: boolean,
  ) => void;
}

/* =========================================================
   STUDENTS TAB
========================================================= */

export const StudentsTab: React.FC<
  StudentsTabProps
> = ({
  students,
  classes,
  subjects,
  classSubjectSettings,
  onSaveStudent,
  onDeleteStudent,
  showModal,
  closeModal,
  showConfirm,
  pill,
}) => {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] =
    useState("all");

  const [page, setPage] = useState(1);

  const [uploading, setUploading] =
    useState(false);

  const [uploadMessage, setUploadMessage] =
    useState("");

  const pageSize = 50;

  /* =====================================================
     EXISTING EXCEL / CSV IMPORT
     ===================================================== */

  const handleBulkFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    try {
      setUploading(true);
      setUploadMessage("");

      const workbook = XLSX.read(
        await file.arrayBuffer(),
        {
          type: "array",
        },
      );

      const firstSheet =
        workbook.Sheets[
          workbook.SheetNames[0]
        ];

      const rows =
        XLSX.utils.sheet_to_json<
          Record<string, unknown>
        >(firstSheet, {
          defval: "",
        });

      const normalized = (value: unknown) =>
        String(value ?? "")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ");

      const classKey = (value: unknown) =>
        normalized(value).replace(
          /^(grade|class)\s+/,
          "",
        );

      const classByName = new Map(
        classes.map((currentClass: any) => [
          classKey(
            currentClass.className ||
              currentClass.name,
          ),
          currentClass,
        ]),
      );

      const payload = rows.map((row) => {
        const values = Object.fromEntries(
          Object.entries(row).map(
            ([key, value]) => [
              normalized(key),
              value,
            ],
          ),
        );

        const className = normalized(
          values.classname ||
            values.class ||
            values["class name"],
        );

        const classFound =
          classByName.get(
            classKey(className),
          );

        const classIdValue =
          values.classid ||
          values["class id"] ||
          (classFound as any)?.classId ||
          "";

        const classId =
          String(classIdValue).trim();

        return {
          studentFullName: String(
            values.studentfullname ||
              values.name ||
              "",
          ).trim(),

          studentAdm: String(
            values.studentadm ||
              values.admissionno ||
              values.admission ||
              "",
          ).trim(),

          email: String(
            values.email || "",
          ).trim(),

          guardianName: String(
            values.guardianname ||
              values.guardian ||
              "",
          ).trim(),

          phoneNumber: String(
            values.phonenumber ||
              values.phone ||
              "",
          ).trim(),

          gender:
            String(
              values.gender || "",
            )
              .trim()
              .toUpperCase() || null,

          classId,

          schoolId: getSchoolId(),
        };
      });

      const invalidRow =
        payload.findIndex(
          (student) =>
            !student.studentFullName ||
            !student.classId ||
            !student.schoolId,
        );

      if (
        !payload.length ||
        invalidRow >= 0
      ) {
        const availableClasses =
          classes
            .map(
              (currentClass: any) =>
                currentClass.className ||
                currentClass.name,
            )
            .filter(Boolean)
            .join(", ");

        throw new Error(
          invalidRow >= 0
            ? `Row ${
                invalidRow + 2
              } needs studentFullName and a valid existing class. Available classes: ${
                availableClasses ||
                "none"
              }.`
            : "The file has no student rows.",
        );
      }

      /*
       * EXISTING ENDPOINT — UNCHANGED
       */
      await request(
        "/register/students/bulk",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );

      setUploadMessage(
        `${payload.length} students imported successfully.`,
      );

      window.location.reload();
    } catch (error) {
      setUploadMessage(
        error instanceof Error
          ? error.message
          : "Unable to import students.",
      );
    } finally {
      setUploading(false);
    }
  };

  /* =====================================================
     SUBJECT LOOKUP
     ===================================================== */

  const subjectLookup = useMemo(
    () =>
      subjects.reduce<
        Record<string, Subject>
      >((acc, subject) => {
        acc[subject.id] = subject;
        return acc;
      }, {}),
    [subjects],
  );

  /* =====================================================
     FILTERING
     ===================================================== */

  const filteredStudents =
    students.filter((student) => {
      const query =
        search.toLowerCase();

      const matchesSearch =
        student.studentFullName
          ?.toLowerCase()
          .includes(query) ||
        student.studentAdm
          ?.toLowerCase()
          .includes(query);

      const matchesClass =
        classFilter === "all" ||
        student.classId === classFilter;

      return (
        matchesSearch &&
        matchesClass
      );
    });

  /* =====================================================
     PAGINATION
     ===================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredStudents.length /
        pageSize,
    ),
  );

  const currentPage = Math.min(
    page,
    totalPages,
  );

  const pagedStudents =
    filteredStudents.slice(
      (currentPage - 1) *
        pageSize,
      currentPage * pageSize,
    );

  useEffect(() => {
    setPage(1);
  }, [search, classFilter]);

  /* =====================================================
     OPEN STUDENT MODAL
     ===================================================== */

  const openStudentModal = (
    studentId?: string,
  ) => {
    const student = studentId
      ? students.find(
          (current) =>
            current?.userId ===
            studentId,
        ) || null
      : null;

    const currentClass = student
      ? `${student.classGrade || ""} ${
          student.classStream || ""
        }`.trim()
      : null;

    showModal(
      <StudentFormModal
        student={student}
        currentClass={currentClass}
        gradeOptions={Array.from(
          new Set(
            classes.map(
              (current: any) =>
                current.grade,
            ),
          ),
        )}
        streamOptions={Array.from(
          new Set(
            classes.map(
              (current: any) =>
                current.stream || "",
            ),
          ),
        )}
        subjects={subjects}
        classSubjectSettings={
          classSubjectSettings
        }
        onClose={closeModal}

        /*
         * Existing single-student save.
         * Endpoint is not changed.
         */
        onSave={async (payload) => {
          await onSaveStudent(
            payload,
            studentId,
          );
        }}

        /*
         * Multiple enrollment.
         *
         * Uses the existing bulk endpoint.
         * Nothing else in the API is changed.
         */
        onBulkSave={async (payload) => {
          await request(
            "/register/students/bulk",
            {
              method: "POST",
              body: JSON.stringify(
                payload,
              ),
            },
          );

          /*
           * Keep existing behavior:
           * refresh the dashboard after
           * successful bulk enrollment.
           */
          window.location.reload();
        }}
      />,
    );
  };

  /* =====================================================
     DELETE
     ===================================================== */

  const confirmDeleteStudent = (
    studentId: string,
    name: string,
  ) => {
    showConfirm(
      `Delete <strong>${name}</strong> from the enrolled students list?`,
      () => {
        void onDeleteStudent(
          studentId,
        );
      },
      true,
    );
  };

  /* =====================================================
     STATS
     ===================================================== */

  const totalActive =
    students.filter(
      (student) =>
        student.status
          .toLowerCase() ===
        "active",
    ).length;

  /* =====================================================
     RENDER
     ===================================================== */

  return (
    <div className="anim">
      {/* =================================================
          HEADER
      ================================================= */}

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
          <p style={eyebrowStyle}>
            Students
          </p>

          <h2 style={pageTitleStyle}>
            Student management
          </h2>
        </div>

        <div
          style={{
            display: "flex",
            gap: 9,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* SEARCH */}

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search name or admission no."
            style={{
              ...inputStyle,
              width: 220,
            }}
          />

          {/* CLASS FILTER */}

          <select
            value={classFilter}
            onChange={(event) =>
              setClassFilter(
                event.target.value,
              )
            }
            style={{
              ...inputStyle,
              width: 170,
            }}
          >
            <option value="all">
              All classes
            </option>

            {classes.map(
              (currentClass: any) => (
                <option
                  key={
                    currentClass.classId
                  }
                  value={
                    currentClass.classId
                  }
                >
                  {
                    currentClass.className
                  }
                </option>
              ),
            )}
          </select>

          {/* ADD STUDENT */}

          <button
            onClick={() =>
              openStudentModal()
            }
            style={
              primaryButtonStyle
            }
          >
            + Add student
          </button>

          {/* IMPORT */}

          <label
            style={{
              ...secondaryButtonStyle,
              cursor: uploading
                ? "wait"
                : "pointer",
            }}
          >
            {uploading
              ? "Importing..."
              : "Import CSV / Excel"}

            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={
                handleBulkFile
              }
              disabled={uploading}
              style={{
                display: "none",
              }}
            />
          </label>
        </div>
      </div>

      {/* =================================================
          UPLOAD MESSAGE
      ================================================= */}

      {uploadMessage && (
        <div
          style={{
            ...emptyCellStyle,
            minHeight: 0,
            padding: "10px 14px",
            marginBottom: 12,
          }}
        >
          {uploadMessage}
        </div>
      )}

      {/* =================================================
          STATS
      ================================================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <StatCard
          label="Enrolled students"
          value={students.length}
        />

        <StatCard
          label="Active students"
          value={totalActive}
          accent="var(--sText)"
        />

        <StatCard
          label="Classes with learners"
          value={classes?.length || 0}
          accent="#1a4a99"
        />
      </div>

      {/* =================================================
          STUDENT TABLE
      ================================================= */}

      <div
        style={{
          background: "var(--white)",
          border:
            "1px solid var(--border)",
          borderRadius: 13,
          overflowX: "auto",
          WebkitOverflowScrolling:
            "touch",
        }}
      >
        <table
          style={{
            width: "100%",
            minWidth: 860,
            borderCollapse:
              "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                background:
                  "var(--sand)",
              }}
            >
              {[
                "Student",
                "Admission no.",
                "Class",
                "Guardian",
                "Status",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  style={{
                    ...tableHeadingStyle,

                    ...(heading ===
                    "Student"
                      ? {
                          position:
                            "sticky",
                          left: 0,
                          zIndex: 2,
                          background:
                            "var(--sand)",
                          minWidth: 210,
                        }
                      : heading ===
                        "Admission no."
                        ? {
                            position:
                              "sticky",
                            left: 210,
                            zIndex: 2,
                            background:
                              "var(--sand)",
                            minWidth: 130,
                          }
                        : {}),
                  }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredStudents.length ===
              0 && (
              <tr>
                <td
                  colSpan={6}
                  style={
                    emptyCellStyle
                  }
                >
                  No enrolled students
                  match this filter.
                </td>
              </tr>
            )}

            {pagedStudents.map(
              (student) => (
                <tr
                  key={
                    student.userId
                  }
                  style={{
                    borderTop:
                      "1px solid var(--borderL)",
                  }}
                >
                  {/* STUDENT */}

                  <td
                    style={{
                      padding:
                        "10px 13px",
                      position:
                        "sticky",
                      left: 0,
                      zIndex: 1,
                      background:
                        "var(--white)",
                      minWidth: 210,
                      boxShadow:
                        "1px 0 0 var(--borderL)",
                    }}
                  >
                    <p
                      style={
                        rowPrimaryTextStyle
                      }
                    >
                      {
                        student.studentFullName
                      }
                    </p>

                    <p
                      style={
                        rowMetaTextStyle
                      }
                    >
                      {
                        student.gender
                      }
                    </p>
                  </td>

                  {/* ADMISSION */}

                  <td
                    style={{
                      ...bodyTextStyle,
                      position:
                        "sticky",
                      left: 210,
                      zIndex: 1,
                      background:
                        "var(--white)",
                      minWidth: 130,
                      boxShadow:
                        "1px 0 0 var(--borderL)",
                    }}
                  >
                    {
                      student.studentAdm
                    }
                  </td>

                  {/* CLASS */}

                  <td
                    style={{
                      padding:
                        "10px 13px",
                    }}
                  >
                    <p
                      style={{
                        ...rowPrimaryTextStyle,
                        fontWeight: 600,
                      }}
                    >
                      {`${student?.classGrade || ""} ${
                        student?.classStream ||
                        ""
                      }`.trim() ||
                        "Not assigned"}
                    </p>
                  </td>

                  {/* GUARDIAN */}

                  <td
                    style={{
                      padding:
                        "10px 13px",
                    }}
                  >
                    <p
                      style={
                        rowMetaTextStyle
                      }
                    >
                      {
                        student.guardianName
                      }
                    </p>
                  </td>

                  {/* STATUS */}

                  <td
                    style={{
                      padding:
                        "10px 13px",
                    }}
                  >
                    <span
                      dangerouslySetInnerHTML={{
                        __html: pill(
                          student.status ||
                            "ACTIVE",
                          student.status ===
                            "ACTIVE"
                            ? "green"
                            : student.status ===
                                "Completed"
                              ? "gold"
                              : "gray",
                        ),
                      }}
                    />
                  </td>

                  {/* ACTIONS */}

                  <td
                    style={{
                      padding:
                        "10px 13px",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        gap: 6,
                      }}
                    >
                      <button
                        onClick={() =>
                          openStudentModal(
                            student.userId,
                          )
                        }
                        style={
                          iconButtonStyle
                        }
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          confirmDeleteStudent(
                            student.userId!,
                            student.studentFullName,
                          )
                        }
                        style={{
                          ...iconButtonStyle,
                          background:
                            "var(--dBg)",
                          color:
                            "var(--dText)",
                          border: "none",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      {/* =================================================
          PAGINATION
      ================================================= */}

      {filteredStudents.length >
        pageSize && (
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: 12,
            marginTop: 12,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color:
                "var(--textMut)",
            }}
          >
            Page {currentPage} of{" "}
            {totalPages} |{" "}
            {filteredStudents.length}{" "}
            students
          </span>

          <div
            style={{
              display: "flex",
              gap: 8,
            }}
          >
            <button
              style={
                secondaryButtonStyle
              }
              disabled={
                currentPage <= 1
              }
              onClick={() =>
                setPage(
                  (previous) =>
                    Math.max(
                      1,
                      previous - 1,
                    ),
                )
              }
            >
              Previous
            </button>

            <button
              style={
                secondaryButtonStyle
              }
              disabled={
                currentPage >=
                totalPages
              }
              onClick={() =>
                setPage(
                  (previous) =>
                    Math.min(
                      totalPages,
                      previous + 1,
                    ),
                )
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
