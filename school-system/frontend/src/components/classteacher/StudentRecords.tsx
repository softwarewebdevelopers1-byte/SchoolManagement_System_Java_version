// components/classteacher/StudentRecords.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Avatar } from "./shared/Avatar";
import { C, FONT } from "./shared/constants";
import { request, getSchoolId } from "../../lib/api";

interface StudentRecordsProps {
  classId: string;
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

export const StudentRecords: React.FC<StudentRecordsProps> = ({
  classId,
  classInfo,
}) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const isFirstPage = page === 0;
  const isLastPage = totalPages <= 1 || page >= totalPages - 1;

  const fetchStudents = async () => {
    if (!classId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await request<{
        content: any[];
        number: number;
        size: number;
        totalElements: number;
        totalPages: number;
      }>(`/get/students?classId=${encodeURIComponent(classId)}&page=${page}&size=${size}`);
      setStudents(response?.content || []);
      setTotalPages(response?.totalPages || 1);
      setTotalElements(response?.totalElements || 0);
    } catch (err: any) {
      setError(err?.message || "Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [classId, page, size]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;
    return students.filter(
      (s) =>
        String(s.fullName || s.studentFullName || "")
          .toLowerCase()
          .includes(query) ||
        String(s.admissionNo || s.adm || s.studentAdm || "")
          .toLowerCase()
          .includes(query),
    );
  }, [students, search]);

  return (
    <div className="ct-anim">
      <SectionHeader
        eyebrow="Roster"
        title="Student records"
        sub={`${classInfo} · ${totalElements} learners enrolled`}
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
      {error && (
        <div
          style={{
            padding: 16,
            background: "#fdeaea",
            color: "#a32d2d",
            borderRadius: 8,
            marginBottom: 12,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}
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
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: "2.5rem",
                    textAlign: "center",
                    fontSize: "1.1rem",
                    color: C.textMuted,
                  }}
                >
                  {loading ? "Loading..." : "No students found."}
                </td>
              </tr>
            )}
            {filtered.map((s) => {
              const studentName = s.fullName || s.studentFullName || "-";
              return (
                <tr
                  key={s.studentId}
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
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
            Page {page + 1} of {totalPages} | {totalElements} learners
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              style={secondaryButtonStyle}
              disabled={isFirstPage || page === 0 || loading}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </button>
            <button
              style={secondaryButtonStyle}
              disabled={isLastPage || page >= totalPages - 1 || loading}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
