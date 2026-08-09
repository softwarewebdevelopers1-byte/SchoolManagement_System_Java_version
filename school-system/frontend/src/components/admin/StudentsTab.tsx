import React, { useEffect, useMemo, useState } from "react";
import { Class, ClassSubjectSetting, Student, Subject } from "./types";
import {
  buildElectiveSubjectGroups,
  buildEnrolledSubjectsPayload,
  formatSubjectOfferingTag,
  getClassSubjectSetting,
  getElectiveSubjectIdsForClass,
} from "../../lib/subjectEnrollment";
import { useClassesData } from "../../lib/adminData";
import { getSchoolId, request } from "../../lib/api";

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

const StudentFormModal: React.FC<{
  student: Student | null;
  currentClass: any;
  gradeOptions: string[];
  streamOptions: string[];
  subjects: Subject[];
  classSubjectSettings: ClassSubjectSetting[];
  onClose: () => void;
  onSave: (payload: {
    studentFullName: string;
    studentAdm: string;
    email: string;
    phoneNumber: string;
    classId: string;
    schoolId: string;
    gender?: string;
    status?: string;
  }) => Promise<void>;
}> = ({ student, onClose, onSave }) => {
  const [isCompact, setIsCompact] = React.useState(
    () => typeof window !== "undefined" && window.innerWidth <= 640,
  );
  const [name, setName] = useState(student?.studentFullName || "");
  const [admissionNo, setAdmissionNo] = useState(student?.studentAdm || "");
  const [grade, setGrade] = useState(
    `${student?.classGrade} ${student?.classStream}`,
  );
  const { classesFound } = useClassesData() as any;

  const [classSelectedId, setclassSelectedId] = useState(() => {
    let c = classesFound?.filter((c: any) => c.className === grade);
    return c[0]?.classId;
  });
  // const [stream, setStream] = useState(currentClass?.stream || "");
  const [gender, setGender] = useState(student?.gender || "");
  const [status, setStatus] = useState(student?.status || "");
  const [email, setEmail] = useState(student?.email);
  const [guardianPhone, setGuardianPhone] = useState(
    student?.phoneNumber || "",
  );
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  React.useEffect(() => {
    const handleResize = () => setIsCompact(window.innerWidth <= 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      <div style={modalHeaderStyle}>
        <h3 style={modalTitleStyle}>
          {student ? "Update student" : "Add student"}
        </h3>
        <button onClick={onClose} style={closeButtonStyle}>
          x
        </button>
      </div>

      <div style={{ padding: isCompact ? "14px 14px 18px" : "18px 22px 22px" }}>
        {errorMsg && (
          <div
            style={{
              padding: "10px",
              marginBottom: "15px",
              background: "#fdeaea",
              color: "#a32d2d",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {errorMsg}
          </div>
        )}
        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Student name</label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Amina Wanjiru"
            style={inputStyle}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isCompact ? "1fr" : "1fr 1fr",
            gap: 12,
          }}
        >
          <div>
            <label style={labelStyle}>Admission no.</label>
            <input
              type="text"
              value={admissionNo}
              onChange={(event) => setAdmissionNo(event.target.value)}
              placeholder="e.g. ADM-1042"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Gender</label>
            <select
              value={gender}
              onChange={(event) => setGender(event.target.value)}
              style={inputStyle}
            >
              <option value="FEMALE">Female</option>
              <option value="MALE">Male</option>
              <option value="">Not set</option>
            </select>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isCompact ? "1fr" : "1fr 1fr",
            gap: 12,
            marginTop: "1rem",
          }}
        >
          <div>
            <label style={labelStyle}>class</label>
            <select
              value={grade}
              onChange={(event) => {
                setGrade(event.target.value);
                let c = classesFound?.filter(
                  (c: any) => c.className === event.target.value,
                );
                setclassSelectedId(c[0].classId);
              }}
              style={inputStyle}
            >
              <option value="">--select--</option>
              {classesFound.map((c: any) => {
                return (
                  <option key={c.classId} value={c.className}>
                    {c.className}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {student && (
          <div style={{ marginTop: "1rem" }}>
            <label style={labelStyle}>Status</label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              style={inputStyle}
            >
              <option value="ACTIVE">active</option>
              <option value="INACTIVE">inactive</option>
              <option value="DELETED">deleted</option>
            </select>
          </div>
        )}
        <div style={{ marginTop: "1rem" }}>
          <label style={labelStyle}>Guardian phone</label>
          <input
            type="text"
            value={guardianPhone}
            onChange={(event) => setGuardianPhone(event.target.value)}
            placeholder="+254..."
            style={inputStyle}
          />
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            marginTop: "1.5rem",
            flexDirection: isCompact ? "column-reverse" : "row",
          }}
        >
          <button onClick={onClose} style={secondaryButtonStyle}>
            Cancel
          </button>
          <button
            onClick={async () => {
              if (!name.trim() || !grade.trim()) {
                setErrorMsg("Fill in the required student details.");
                return;
              }
              setErrorMsg("");

              setSaving(true);
              try {
                await onSave({
                  studentFullName: name.trim(),
                  studentAdm: admissionNo.trim(),
                  gender: gender,
                  phoneNumber: guardianPhone.trim(),
                  classId: classSelectedId || "",
                  schoolId: getSchoolId()!,
                  email: "",
                  status: status,
                });
              } finally {
                setSaving(false);
              }
            }}
            style={primaryButtonStyle}
            disabled={saving}
          >
            {saving ? "Saving..." : student ? "Save changes" : "Enroll student"}
          </button>
        </div>
      </div>
    </div>
  );
};

interface StudentsTabProps {
  students: Student[];
  classes: any;
  subjects: Subject[];
  classSubjectSettings: ClassSubjectSetting[];
  onSaveStudent: (
    payload: {
      studentFullName: string;
      studentAdm: string;
      email: string;
      phoneNumber: string;
      classId: string;
      schoolId: string;
      gender?: string;
      status?: string;
    },
    studentId?: string,
  ) => Promise<void>;
  onDeleteStudent: (studentId: string) => Promise<void>;
  pill: (text: string, color: string) => string;
  showModal: (content: React.ReactNode) => void;
  closeModal: () => void;
  showConfirm: (msg: string, onOk: () => void, danger?: boolean) => void;
}

export const StudentsTab: React.FC<StudentsTabProps> = ({
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
  const [classFilter, setClassFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [students, setStudents] = useState<Student[]>([]);
  const pageSize = 50;

  useEffect(() => {
    (async () => {
      async function getStudents(): Promise<Student[]> {
        return await request(`/get/all/students?schoolId=${getSchoolId()!}`);
      }
      setStudents(await getStudents());
    })();
  }, []);
  const subjectLookup = useMemo(
    () =>
      subjects.reduce<Record<string, Subject>>((acc, subject) => {
        acc[subject.id] = subject;
        return acc;
      }, {}),
    [subjects],
  );

  const filteredStudents = students.filter((student) => {
    const query = search.toLowerCase();
    const matchesSearch =
      student.studentFullName?.toLowerCase().includes(query) ||
      student.studentAdm?.toLowerCase().includes(query);
    const matchesClass =
      classFilter === "all" || student.classId === classFilter;
    return matchesSearch && matchesClass;
  });
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedStudents = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setPage(1);
  }, [search, classFilter]);

  const openStudentModal = (studentId?: string) => {
    console.log("id--->");
    const student = studentId
      ? students.find((current) => current?.userId === studentId) || null
      : null;
    const currentClass = student
      ? `${student?.classGrade} ${student?.classStream}`
      : null;

    showModal(
      <StudentFormModal
        student={student}
        currentClass={currentClass}
        gradeOptions={Array.from(
          new Set(classes.map((current: any) => current.grade)),
        )}
        streamOptions={Array.from(
          new Set(classes.map((current: any) => current.stream || "")),
        )}
        subjects={subjects}
        classSubjectSettings={classSubjectSettings}
        onClose={closeModal}
        onSave={async (payload) => {
          await onSaveStudent(payload, studentId);
        }}
      />,
    );
  };

  const confirmDeleteStudent = (studentId: string, name: string) => {
    showConfirm(
      `Delete <strong>${name}</strong> from the enrolled students list?`,
      () => {
        void onDeleteStudent(studentId);
      },
      true,
    );
  };

  const totalActive = students.filter(
    (student) => student.status === "ACTIVE",
  ).length;

  return (
    <div className="anim">
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
          <p style={eyebrowStyle}>Students</p>
          <h2 style={pageTitleStyle}>Student management</h2>
        </div>

        <div
          style={{
            display: "flex",
            gap: 9,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or admission no."
            style={{ ...inputStyle, width: 220 }}
          />
          <select
            value={classFilter}
            onChange={(event) => setClassFilter(event.target.value)}
            style={{ ...inputStyle, width: 170 }}
          >
            <option value="all">All classes</option>
            {classes.map((currentClass: any) => (
              <option key={currentClass.classId} value={currentClass.classId}>
                {currentClass.className}
              </option>
            ))}
          </select>
          <button onClick={() => openStudentModal()} style={primaryButtonStyle}>
            + Add student
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <StatCard label="Enrolled students" value={students.length} />
        <StatCard
          label="Active students"
          value={totalActive}
          accent="var(--sText)"
        />
        <StatCard
          label="Classes with learners"
          value={
            students.filter((s) => s.status?.toLowerCase() === "active").length
          }
          accent="#1a4a99"
        />
      </div>

      <div
        style={{
          background: "var(--white)",
          border: "1px solid var(--border)",
          borderRadius: 13,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <table
          style={{ width: "100%", minWidth: 860, borderCollapse: "collapse" }}
        >
          <thead>
            <tr style={{ background: "var(--sand)" }}>
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
                    ...(heading === "Student"
                      ? {
                          position: "sticky",
                          left: 0,
                          zIndex: 2,
                          background: "var(--sand)",
                          minWidth: 210,
                        }
                      : heading === "Admission no."
                        ? {
                            position: "sticky",
                            left: 210,
                            zIndex: 2,
                            background: "var(--sand)",
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
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={6} style={emptyCellStyle}>
                  No enrolled students match this filter.
                </td>
              </tr>
            )}
            {pagedStudents.map((student) => {
              return (
                <tr
                  key={student.userId}
                  style={{ borderTop: "1px solid var(--borderL)" }}
                >
                  <td
                    style={{
                      padding: "10px 13px",
                      position: "sticky",
                      left: 0,
                      zIndex: 1,
                      background: "var(--white)",
                      minWidth: 210,
                      boxShadow: "1px 0 0 var(--borderL)",
                    }}
                  >
                    <p style={rowPrimaryTextStyle}>{student.studentFullName}</p>
                    <p style={rowMetaTextStyle}>{student.gender}</p>
                  </td>
                  <td
                    style={{
                      ...bodyTextStyle,
                      position: "sticky",
                      left: 210,
                      zIndex: 1,
                      background: "var(--white)",
                      minWidth: 130,
                      boxShadow: "1px 0 0 var(--borderL)",
                    }}
                  >
                    {student.studentAdm}
                  </td>
                  <td style={{ padding: "10px 13px" }}>
                    <p style={{ ...rowPrimaryTextStyle, fontWeight: 600 }}>
                      {`${student?.classGrade} ${student?.classStream}` ||
                        "Not assigned"}
                    </p>
                  </td>
                  <td style={{ padding: "10px 13px" }}>
                    <p style={rowMetaTextStyle}>{student.phoneNumber}</p>
                  </td>
                  <td style={{ padding: "10px 13px" }}>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: pill(
                          student.status || "Active",
                          student.status === "Active"
                            ? "green"
                            : student.status === "Completed"
                              ? "gold"
                              : "gray",
                        ),
                      }}
                    />
                  </td>
                  <td style={{ padding: "10px 13px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => {
                          openStudentModal(student.userId);
                          console.log(student);
                        }}
                        style={iconButtonStyle}
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
                          background: "var(--dBg)",
                          color: "var(--dText)",
                          border: "none",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {filteredStudents.length > pageSize && (
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
            Page {currentPage} of {totalPages} | {filteredStudents.length}{" "}
            students
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
