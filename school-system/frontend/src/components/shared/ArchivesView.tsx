import React, { useCallback, useEffect, useState } from "react";
import { api, downloadApiFile, getSchoolId, openApiFile } from "../../lib/api";
import { C, FONT } from "../classteacher/shared/constants";
import {
  friendlyErrorMessage,
  useNotifications,
} from "./notifications/NotificationContext";

interface Archive {
  id: string;
  type: "RESULT" | "ATTENDANCE";
  classId: string;
  className: string;
  academicYear: string | null;
  term: number | null;
  examType: string | null;
  startDate: string | null;
  endDate: string | null;
  version: number;
  status: "PENDING" | "PROCESSING" | "CORRECTION" | "VERIFIED" | "FAILED" | "SUPERSEDED";
  requestedAt: string;
  verifiedAt: string | null;
  documentSize: number | null;
  schoolName?: string | null;
  studentCount?: number | null;
  recordedDays?: number | null;
  noSheetDays?: number | null;
  attendanceRate?: number | null;
  cleanupEligible: boolean;
  lastError: string | null;
  correctionReason: string | null;
}

interface ArchivePage {
  content: Archive[];
  page: number;
  size: number;
  hasNext: boolean;
}

interface ArchiveStudent {
  studentId: string;
  studentName: string;
  admissionNumber: string | null;
}

interface ArchiveStudentsPage {
  content: ArchiveStudent[];
  page: number;
  size: number;
  hasNext: boolean;
}

interface SchoolClass {
  classId: string;
  className: string;
}

interface AttendancePreview {
  calendarDays: number;
  foundSheets: number;
  duplicateSheets: number;
  lockedSheets: number;
  submittedSheets: number;
  draftSheets: number;
  missingCalendarDates: number;
  ready: boolean;
}

interface ArchivesViewProps {
  classGrade?: string;
  classStream?: string;
  title?: string;
  allowManagement?: boolean;
}

const buttonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 38,
  padding: "0 14px",
  borderRadius: 10,
  border: `1px solid ${C.border}`,
  background: C.white,
  color: C.text,
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  minHeight: 40,
  padding: "8px 10px",
  borderRadius: 8,
  border: `1px solid ${C.border}`,
  background: C.white,
  color: C.text,
  fontSize: 13,
};

const formatArchiveDate = (value: string | null) => {
  if (!value) return "Date unavailable";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
};

const archiveStatusLabel = (status: Archive["status"]) => {
  switch (status) {
    case "VERIFIED": return "✓ Verified";
    case "SUPERSEDED": return "✓ Superseded";
    case "PROCESSING": return "⏳ Processing";
    case "FAILED": return "! Failed";
    case "PENDING": return "Pending";
    case "CORRECTION": return "Correction";
  }
};

export const ArchivesView: React.FC<ArchivesViewProps> = ({
  classGrade,
  classStream,
  title = "Archives",
  allowManagement = false,
}) => {
  const toast = useNotifications();
  const [archives, setArchives] = useState<Archive[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [confirmMissingDates, setConfirmMissingDates] = useState(false);
  const [preview, setPreview] = useState<AttendancePreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [archiveType, setArchiveType] = useState<"ALL" | "RESULT" | "ATTENDANCE">("ALL");
  const [filterYear, setFilterYear] = useState("");
  const [filterTerm, setFilterTerm] = useState("");
  const [filterClassId, setFilterClassId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [retryingId, setRetryingId] = useState("");
  const [activeDownload, setActiveDownload] = useState("");
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [studentArchiveId, setStudentArchiveId] = useState("");
  const [studentArtifacts, setStudentArtifacts] = useState<ArchiveStudent[]>([]);
  const [studentPage, setStudentPage] = useState(0);
  const [studentHasNext, setStudentHasNext] = useState(false);
  const [studentLoading, setStudentLoading] = useState(false);
  const [correctionArchive, setCorrectionArchive] = useState<Archive | null>(null);
  const [correctionReason, setCorrectionReason] = useState("");
  const [correctionLoading, setCorrectionLoading] = useState(false);

  const fetchArchives = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: String(page),
        size: "20",
      });
      if (archiveType !== "ALL") query.set("type", archiveType);
      if (/^\d{4}$/.test(filterYear)) query.set("year", filterYear);
      if (filterTerm) query.set("term", filterTerm);
      if (filterClassId) query.set("classId", filterClassId);
      if (filterStatus) query.set("status", filterStatus);
      if (debouncedSearch) query.set("search", debouncedSearch);
      const result = await api.get<ArchivePage | Archive[]>(
        `/school/archives?${query.toString()}`,
      );
      if (Array.isArray(result)) {
        setArchives(result);
        setHasNext(false);
      } else {
        setArchives(result.content || []);
        setHasNext(result.hasNext);
      }
    } catch (error) {
      toast.error(friendlyErrorMessage(error, "Unable to load archives right now."));
    } finally {
      setLoading(false);
    }
  }, [archiveType, debouncedSearch, filterClassId, filterStatus, filterTerm, filterYear, page, toast]);

  useEffect(() => {
    void fetchArchives();
  }, [fetchArchives]);

  useEffect(() => {
    const schoolId = getSchoolId();
    if (!schoolId) return;
    let cancelled = false;
    void api.get<SchoolClass[]>(`/all/classes/${encodeURIComponent(schoolId)}`)
      .then((rows) => {
        if (!cancelled) setClasses(rows || []);
      })
      .catch((error) => {
        if (!cancelled) toast.error(friendlyErrorMessage(error, "Unable to load classes."));
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(0);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const requestAttendanceArchive = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedClass || !startDate || !endDate) {
      toast.warning("Select a class and date range.");
      return;
    }
    if (startDate > endDate) {
      toast.warning("The start date must not be after the end date.");
      return;
    }
    if (!preview?.ready) {
      toast.warning("Preview the range and confirm that every existing sheet is locked first.");
      return;
    }
    if (preview.missingCalendarDates > 0 && !confirmMissingDates) {
      toast.warning("Confirm that dates without attendance sheets are intentionally excluded.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/admin/archives/attendance", {
        classId: selectedClass,
        startDate,
        endDate,
        confirmMissingDates,
      });
      toast.success("Attendance archive queued. Source records remain in MySQL.");
      await fetchArchives();
    } catch (error) {
      toast.error(friendlyErrorMessage(error, "Unable to queue attendance archive."));
    } finally {
      setSubmitting(false);
    }
  };

  const previewAttendanceArchive = async () => {
    if (!selectedClass || !startDate || !endDate) {
      toast.warning("Select a class and date range to preview.");
      return;
    }
    setPreviewLoading(true);
    setPreview(null);
    try {
      const query = new URLSearchParams({ classId: selectedClass, startDate, endDate });
      const result = await api.get<AttendancePreview>(
        `/admin/archives/attendance/preview?${query.toString()}`,
      );
      setPreview(result);
    } catch (error) {
      toast.error(friendlyErrorMessage(error, "Unable to preview attendance range."));
    } finally {
      setPreviewLoading(false);
    }
  };

  const retry = async (archive: Archive) => {
    setRetryingId(archive.id);
    try {
      await api.post(`/school/archives/${encodeURIComponent(archive.id)}/retry`, {});
      toast.success("Archive retry queued.");
      await fetchArchives();
    } catch (error) {
      toast.error(friendlyErrorMessage(error, "Unable to retry this archive."));
    } finally {
      setRetryingId("");
    }
  };

  const download = async (archive: Archive, kind: "pdf" | "snapshot" | "manifest") => {
    const operation = `${archive.id}:${kind}`;
    if (activeDownload) return;
    setActiveDownload(operation);
    try {
      const path = archive.type === "ATTENDANCE"
        ? `/school/attendance-archives/${encodeURIComponent(archive.id)}/${kind}`
        : `/school/archives/${encodeURIComponent(archive.id)}/${kind}`;
      await downloadApiFile(
        path,
      );
      toast.success("Download started.");
    } catch (error) {
      toast.error(friendlyErrorMessage(error, "Unable to download this archive artifact."));
    } finally {
      setActiveDownload("");
    }
  };

  const viewAttendanceReport = async (archive: Archive) => {
    const operation = `${archive.id}:view`;
    if (activeDownload) return;
    setActiveDownload(operation);
    try {
      await openApiFile(
        `/school/attendance-archives/${encodeURIComponent(archive.id)}/pdf?disposition=inline`,
        "attendance-report.pdf",
      );
      toast.success("Attendance report opened.");
    } catch (error) {
      toast.error(friendlyErrorMessage(error, "Unable to open the attendance report."));
    } finally {
      setActiveDownload("");
    }
  };

  const viewResultReport = async (archive: Archive) => {
    const operation = `${archive.id}:view`;
    if (activeDownload) return;
    setActiveDownload(operation);
    try {
      await openApiFile(
        `/school/archives/${encodeURIComponent(archive.id)}/pdf?disposition=inline`,
        "results-report.pdf",
      );
      toast.success("Historical results opened.");
    } catch (error) {
      toast.error(friendlyErrorMessage(error, "Unable to open historical results."));
    } finally {
      setActiveDownload("");
    }
  };

  const loadStudentArtifacts = async (archiveId: string, requestedPage: number) => {
    setStudentLoading(true);
    try {
      const result = await api.get<ArchiveStudentsPage>(
        `/school/archives/${encodeURIComponent(archiveId)}/students?page=${requestedPage}&size=50`,
      );
      setStudentArtifacts(result.content || []);
      setStudentPage(result.page);
      setStudentHasNext(result.hasNext);
    } catch (error) {
      toast.error(friendlyErrorMessage(error, "Unable to load archived students."));
    } finally {
      setStudentLoading(false);
    }
  };

  const downloadStudentArtifact = async (
    archiveId: string,
    studentId: string,
    kind: "pdf" | "snapshot",
  ) => {
    if (activeDownload) return;
    const operation = `${archiveId}:${studentId}:${kind}`;
    setActiveDownload(operation);
    try {
      await downloadApiFile(
        `/school/archives/${encodeURIComponent(archiveId)}/students/${encodeURIComponent(studentId)}/${kind}`,
        `student-results-${studentId}.${kind === "pdf" ? "pdf" : "json"}`,
      );
      toast.success("Download started.");
    } catch (error) {
      toast.error(friendlyErrorMessage(error, "Unable to download this student archive."));
    } finally {
      setActiveDownload("");
    }
  };

  const viewStudentResult = async (archiveId: string, studentId: string) => {
    if (activeDownload) return;
    setActiveDownload(`${archiveId}:${studentId}:view`);
    try {
      await openApiFile(
        `/school/archives/${encodeURIComponent(archiveId)}/students/${encodeURIComponent(studentId)}/pdf?disposition=inline`,
        "student-results.pdf",
      );
      toast.success("Historical student results opened.");
    } catch (error) {
      toast.error(friendlyErrorMessage(error, "Unable to open historical student results."));
    } finally {
      setActiveDownload("");
    }
  };

  const requestResultCorrection = async (archive: Archive) => {
    if (!correctionReason.trim()) {
      toast.warning("Provide a reason for the correction.");
      return;
    }
    setCorrectionLoading(true);
    try {
      await api.post(
        `/admin/archives/results/${encodeURIComponent(archive.id)}/corrections`,
        { reason: correctionReason.trim() },
      );
      toast.success("Correction enabled. Edit and republish marks, then finalize the new archive version.");
      setCorrectionArchive(null);
      setCorrectionReason("");
      await fetchArchives();
    } catch (error) {
      toast.error(friendlyErrorMessage(error, "Unable to request this result correction."));
    } finally {
      setCorrectionLoading(false);
    }
  };

  const filtered = archives.filter((archive) => {
    const className = archive.className.toLowerCase();
    return (!classGrade || className.includes(classGrade.toLowerCase()))
      && (!classStream || className.includes(classStream.toLowerCase()));
  });

  return (
    <div className="ct-anim">
      <header style={{ marginBottom: 20 }}>
        <p style={{
          fontFamily: FONT.sans, fontSize: 11, fontWeight: 700, color: C.gold,
          textTransform: "uppercase", margin: "0 0 5px",
        }}>History</p>
        <h2 style={{ fontFamily: FONT.serif, fontSize: "1.9rem", fontWeight: 600, color: C.text, margin: 0 }}>
          {title}
        </h2>
        <p style={{ fontFamily: FONT.sans, fontSize: 13, color: C.textMuted, margin: "4px 0 0" }}>
          Historical school records for results and attendance.
        </p>
      </header>

      {allowManagement && (
        <form onSubmit={(event) => void requestAttendanceArchive(event)} style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 10, alignItems: "end", padding: 16, marginBottom: 18,
          background: C.white, border: `1px solid ${C.border}`, borderRadius: 12,
        }}>
          <label style={{ display: "grid", gap: 5, fontSize: 12, color: C.textMuted }}>
            Attendance class
            <select style={inputStyle} value={selectedClass} onChange={(event) => { setSelectedClass(event.target.value); setPreview(null); setConfirmMissingDates(false); }}>
              <option value="">Select class</option>
              {classes.map((schoolClass) => (
                <option key={schoolClass.classId} value={schoolClass.classId}>{schoolClass.className}</option>
              ))}
            </select>
          </label>
          <label style={{ display: "grid", gap: 5, fontSize: 12, color: C.textMuted }}>
            Start date
            <input required type="date" style={inputStyle} value={startDate} onChange={(event) => { setStartDate(event.target.value); setPreview(null); setConfirmMissingDates(false); }} />
          </label>
          <label style={{ display: "grid", gap: 5, fontSize: 12, color: C.textMuted }}>
            End date
            <input required type="date" style={inputStyle} value={endDate} onChange={(event) => { setEndDate(event.target.value); setPreview(null); setConfirmMissingDates(false); }} />
          </label>
          <button type="button" style={buttonStyle} onClick={() => void previewAttendanceArchive()} disabled={previewLoading || submitting}>
            {previewLoading ? "Checking..." : "Preview"}
          </button>
          <button type="submit" style={buttonStyle} disabled={submitting || !preview?.ready || (preview.missingCalendarDates > 0 && !confirmMissingDates)}>
            {submitting ? "Queueing..." : "Archive Locked Attendance"}
          </button>
          {preview && (
            <p style={{ gridColumn: "1 / -1", margin: 0, color: preview.ready ? "#16803c" : "#9a2d2d", fontSize: 12 }}>
              {preview.foundSheets} sheets found ({preview.lockedSheets} locked, {preview.submittedSheets} submitted,
              {" "}{preview.draftSheets} draft), {preview.duplicateSheets} duplicate-date sheets, and
              {" "}{preview.missingCalendarDates} dates without sheets across {preview.calendarDays} calendar days.
              {preview.ready ? " Ready to archive." : " Not ready: existing sheets must be locked and duplicate dates resolved."}
            </p>
          )}
          {preview?.missingCalendarDates ? (
            <label style={{ gridColumn: "1 / -1", display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: C.textMuted }}>
              <input
                type="checkbox"
                checked={confirmMissingDates}
                onChange={(event) => setConfirmMissingDates(event.target.checked)}
              />
              I confirm that dates without attendance sheets are intentionally excluded from this archive.
            </label>
          ) : null}
          <p style={{ gridColumn: "1 / -1", margin: 0, color: C.textFaint, fontSize: 12 }}>
            Only existing locked sheets in the selected range are archived. The current system has no school-day calendar,
            so missing dates are not inferred.
          </p>
        </form>
      )}

      <div role="tablist" aria-label="Archive type" style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {([
          ["ALL", "All"],
          ["RESULT", "Results"],
          ["ATTENDANCE", "Attendance"],
        ] as const).map(([type, label]) => (
          <button
            key={type}
            type="button"
            role="tab"
            aria-selected={archiveType === type}
            onClick={() => {
              setArchiveType(type);
              setPage(0);
              if (type === "ATTENDANCE") setFilterTerm("");
            }}
            style={{
              ...buttonStyle,
              color: archiveType === type ? C.white : C.text,
              background: archiveType === type ? "#25704e" : C.white,
              borderColor: archiveType === type ? "#25704e" : C.border,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(200px, 2fr) repeat(auto-fit, minmax(130px, 1fr))",
        gap: 8,
        marginBottom: 14,
      }}>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search historical records..."
          aria-label="Search archives"
          style={{ ...inputStyle, flex: 1 }}
        />
        <input
          type="number"
          min="1900"
          max="9999"
          value={filterYear}
          onChange={(event) => { setFilterYear(event.target.value); setPage(0); }}
          placeholder="Year"
          aria-label="Filter by year"
          style={inputStyle}
        />
        <select
          value={filterTerm}
          onChange={(event) => { setFilterTerm(event.target.value); setPage(0); }}
          aria-label="Filter results by term"
          style={inputStyle}
        >
          <option value="">All terms</option>
          <option value="1">Term 1 (results)</option>
          <option value="2">Term 2 (results)</option>
          <option value="3">Term 3 (results)</option>
        </select>
        <select
          value={filterClassId}
          onChange={(event) => { setFilterClassId(event.target.value); setPage(0); }}
          aria-label="Filter by class"
          style={inputStyle}
        >
          <option value="">All classes</option>
          {classes.map((schoolClass) => (
            <option key={schoolClass.classId} value={schoolClass.classId}>{schoolClass.className}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(event) => { setFilterStatus(event.target.value); setPage(0); }}
          aria-label="Filter by status"
          style={inputStyle}
        >
          <option value="">All statuses</option>
          <option value="VERIFIED">Verified</option>
          <option value="PROCESSING">Processing</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
          <option value="SUPERSEDED">Superseded</option>
          <option value="CORRECTION">Correction</option>
        </select>
        <button type="button" style={buttonStyle} onClick={() => void fetchArchives()} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: C.textFaint }}>Loading archives...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: C.textMuted, background: C.white, borderRadius: 12 }}>
          {archiveType === "RESULT"
            ? "No result archives yet. Finalized academic results will appear here."
            : archiveType === "ATTENDANCE"
              ? "No attendance archives yet. Archived attendance reports will appear here."
              : "No historical records yet. Finalized results and attendance records will appear here."}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", gap: 14 }}>
          {filtered.map((archive) => (
            <article key={archive.id} style={{
              display: "grid", gap: 10, padding: 16, background: C.white,
              border: `1px solid ${C.border}`, borderRadius: 12,
            }}>
              {archive.type === "ATTENDANCE" ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                    <strong style={{ color: C.text, fontSize: 15 }}>📅 Attendance Archive</strong>
                    <span style={{
                      borderRadius: 999, padding: "4px 9px", fontSize: 10, fontWeight: 800,
                      color: archive.status === "VERIFIED" || archive.status === "SUPERSEDED" ? "#17643e" : C.textMuted,
                      background: archive.status === "VERIFIED" || archive.status === "SUPERSEDED" ? "#e8f5ec" : "#f0f2f0",
                    }}>
                      {archiveStatusLabel(archive.status)}
                    </span>
                  </div>
                  <div>
                    <strong style={{ color: C.text }}>{archive.schoolName || "School"}</strong>
                    <p style={{ margin: "4px 0", color: C.textMuted, fontSize: 13 }}>Class {archive.className}</p>
                    <p style={{ margin: 0, color: C.textMuted, fontSize: 12 }}>
                      {formatArchiveDate(archive.startDate)} – {formatArchiveDate(archive.endDate)}
                    </p>
                  </div>
                  <div style={{
                    display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 8, padding: "10px 0", borderTop: `1px solid ${C.border}`,
                    borderBottom: `1px solid ${C.border}`,
                  }}>
                    {[
                      ["Students", archive.studentCount ?? "—"],
                      ["Recorded days", archive.recordedDays ?? "—"],
                      ["No-sheet days", archive.noSheetDays ?? "—"],
                      ["Attendance rate", archive.attendanceRate == null ? "N/A" : `${archive.attendanceRate.toFixed(1).replace(/\.0$/, "")}%`],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display: "grid", gap: 2 }}>
                        <span style={{ color: C.textFaint, fontSize: 10 }}>{label}</span>
                        <strong style={{ color: C.text, fontSize: 13 }}>{value}</strong>
                      </div>
                    ))}
                  </div>
                  <p style={{ margin: 0, color: C.textFaint, fontSize: 11 }}>
                    Created {new Date(archive.requestedAt).toLocaleDateString()} · Version v{archive.version}
                  </p>
                </>
              ) : (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                    <strong style={{ color: C.text }}>📊 Results Archive</strong>
                    <span style={{
                      borderRadius: 999, padding: "4px 9px", fontSize: 10, fontWeight: 800,
                      color: archive.status === "VERIFIED" || archive.status === "SUPERSEDED" ? "#17643e" : C.textMuted,
                      background: archive.status === "VERIFIED" || archive.status === "SUPERSEDED" ? "#e8f5ec" : "#f0f2f0",
                    }}>
                      {archiveStatusLabel(archive.status)}
                    </span>
                  </div>
                  <strong style={{ color: C.text }}>{archive.className}</strong>
                  <p style={{ margin: "5px 0", color: C.textMuted, fontSize: 12 }}>
                    {archive.academicYear} · Term {archive.term} · {archive.examType}
                  </p>
                  <p style={{ margin: 0, color: C.textMuted, fontSize: 12 }}>
                    {archive.studentCount ?? "—"} Students
                  </p>
                  <p style={{ margin: 0, color: C.textFaint, fontSize: 11 }}>
                    Version v{archive.version} · Finalized {new Date(archive.verifiedAt || archive.requestedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
              {archive.lastError && <p role="alert" style={{ margin: 0, color: "#9a2d2d", fontSize: 12 }}>{archive.lastError}</p>}
              {archive.status === "CORRECTION" && (
                <p style={{ margin: 0, color: C.textMuted, fontSize: 12 }}>
                  Correction requested: edit marks, republish results, then finalize this version.
                  {archive.correctionReason ? ` Reason: ${archive.correctionReason}` : ""}
                </p>
              )}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(archive.status === "VERIFIED" || archive.status === "SUPERSEDED") && (
                  <>
                    {archive.type === "ATTENDANCE" ? (
                      <>
                        <button
                          type="button"
                          style={{ ...buttonStyle, background: "#25704e", color: C.white, borderColor: "#25704e" }}
                          disabled={!!activeDownload}
                          onClick={() => void viewAttendanceReport(archive)}
                        >
                          {activeDownload === `${archive.id}:view` ? "Opening..." : "View Report"}
                        </button>
                        <button
                          type="button"
                          style={buttonStyle}
                          disabled={!!activeDownload}
                          onClick={() => void download(archive, "pdf")}
                        >
                          {activeDownload === `${archive.id}:pdf` ? "Downloading..." : "Download PDF"}
                        </button>
                        <details style={{ alignSelf: "center", color: C.textMuted, fontSize: 12 }}>
                          <summary style={{ cursor: "pointer", fontWeight: 700 }}>More</summary>
                          <div style={{ display: "grid", gap: 6, padding: "8px 0" }}>
                            <button type="button" style={buttonStyle} disabled={!!activeDownload} onClick={() => void download(archive, "snapshot")}>
                              {activeDownload === `${archive.id}:snapshot` ? "Downloading..." : "Download Data Snapshot"}
                            </button>
                            <button type="button" style={buttonStyle} disabled={!!activeDownload} onClick={() => void download(archive, "manifest")}>
                              {activeDownload === `${archive.id}:manifest` ? "Downloading..." : "Download Archive Manifest"}
                            </button>
                          </div>
                        </details>
                      </>
                    ) : (
                      <>
                        <button type="button" style={{ ...buttonStyle, background: "#25704e", color: C.white, borderColor: "#25704e" }} disabled={!!activeDownload} onClick={() => void viewResultReport(archive)}>
                          {activeDownload === `${archive.id}:view` ? "Opening..." : "View Results"}
                        </button>
                        <button type="button" style={buttonStyle} disabled={!!activeDownload} onClick={() => void download(archive, "pdf")}>
                          {activeDownload === `${archive.id}:pdf` ? "Downloading..." : "Download PDF"}
                        </button>
                        <details style={{ alignSelf: "center", color: C.textMuted, fontSize: 12 }}>
                          <summary style={{ cursor: "pointer", fontWeight: 700 }}>More</summary>
                          <div style={{ display: "grid", gap: 6, padding: "8px 0" }}>
                            <button type="button" style={buttonStyle} disabled={!!activeDownload} onClick={() => void download(archive, "snapshot")}>
                              Download Class Snapshot
                            </button>
                            <button type="button" style={buttonStyle} disabled={!!activeDownload} onClick={() => void download(archive, "manifest")}>
                              Download manifest
                            </button>
                          </div>
                        </details>
                      </>
                    )}
                    {archive.type === "RESULT" && (
                      <button
                        type="button"
                        style={buttonStyle}
                        onClick={() => {
                          if (studentArchiveId === archive.id) {
                            setStudentArchiveId("");
                            return;
                          }
                          setStudentArchiveId(archive.id);
                          setStudentArtifacts([]);
                          setStudentPage(0);
                          void loadStudentArtifacts(archive.id, 0);
                        }}
                      >
                        {studentArchiveId === archive.id ? "Hide historical students" : "Historical Students"}
                      </button>
                    )}
                  </>
                )}
                {allowManagement && archive.type === "RESULT" && archive.status === "VERIFIED" && (
                  <button
                    type="button"
                    style={buttonStyle}
                    onClick={() => {
                      setCorrectionArchive(archive);
                      setCorrectionReason("");
                    }}
                  >
                    Request correction
                  </button>
                )}
                {archive.status === "FAILED" && allowManagement && (
                  <button type="button" style={buttonStyle} disabled={retryingId === archive.id} onClick={() => void retry(archive)}>
                    {retryingId === archive.id ? "Queueing..." : "Retry"}
                  </button>
                )}
                <span style={{ alignSelf: "center", color: C.textFaint, fontSize: 11 }}>
                  {archive.cleanupEligible ? "Cleanup eligible" : "Source records retained"}
                </span>
              </div>
              {studentArchiveId === archive.id && (
                <div style={{ display: "grid", gap: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                  {studentLoading ? (
                    <span style={{ color: C.textMuted, fontSize: 12 }}>Loading archived students...</span>
                  ) : studentArtifacts.length === 0 ? (
                    <span style={{ color: C.textMuted, fontSize: 12 }}>No student result artifacts found.</span>
                  ) : studentArtifacts.map((student) => (
                    <div key={student.studentId} style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                      <span style={{ color: C.text, fontSize: 12 }}>
                        {student.studentName}{student.admissionNumber ? ` · ${student.admissionNumber}` : ""}
                      </span>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          style={buttonStyle}
                          disabled={!!activeDownload}
                          onClick={() => void viewStudentResult(archive.id, student.studentId)}
                        >
                          {activeDownload === `${archive.id}:${student.studentId}:view` ? "Opening..." : "View"}
                        </button>
                        <button
                          type="button"
                          style={buttonStyle}
                          disabled={!!activeDownload}
                          onClick={() => void downloadStudentArtifact(archive.id, student.studentId, "pdf")}
                        >
                          {activeDownload === `${archive.id}:${student.studentId}:pdf` ? "Downloading..." : "PDF"}
                        </button>
                        <button
                          type="button"
                          style={buttonStyle}
                          disabled={!!activeDownload}
                          onClick={() => void downloadStudentArtifact(archive.id, student.studentId, "snapshot")}
                        >
                          {activeDownload === `${archive.id}:${student.studentId}:snapshot` ? "Downloading..." : "Snapshot"}
                        </button>
                      </div>
                    </div>
                  ))}
                  {!studentLoading && studentArtifacts.length > 0 && (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <button
                        type="button"
                        style={buttonStyle}
                        disabled={studentPage === 0}
                        onClick={() => void loadStudentArtifacts(archive.id, studentPage - 1)}
                      >
                        Previous students
                      </button>
                      <span style={{ color: C.textMuted, fontSize: 11 }}>Page {studentPage + 1}</span>
                      <button
                        type="button"
                        style={buttonStyle}
                        disabled={!studentHasNext}
                        onClick={() => void loadStudentArtifacts(archive.id, studentPage + 1)}
                      >
                        More students
                      </button>
                    </div>
                  )}
                  {correctionArchive?.id === archive.id && (
                    <div style={{ display: "grid", gap: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                      <label style={{ display: "grid", gap: 5, color: C.textMuted, fontSize: 12 }}>
                        Correction reason
                        <textarea
                          rows={3}
                          maxLength={500}
                          value={correctionReason}
                          onChange={(event) => setCorrectionReason(event.target.value)}
                          style={{ ...inputStyle, resize: "vertical" }}
                        />
                      </label>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          style={buttonStyle}
                          disabled={correctionLoading}
                          onClick={() => void requestResultCorrection(archive)}
                        >
                          {correctionLoading ? "Requesting..." : `Create v${archive.version + 1} correction`}
                        </button>
                        <button
                          type="button"
                          style={buttonStyle}
                          disabled={correctionLoading}
                          onClick={() => setCorrectionArchive(null)}
                        >
                          Cancel
                        </button>
                      </div>
                      <p style={{ margin: 0, color: C.textFaint, fontSize: 11 }}>
                        This unlocks marks only for the current academic cycle. Version {archive.version} stays available
                        until the corrected version has been archived and verified.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
      {!loading && (page > 0 || hasNext) && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 18 }}>
          <button
            type="button"
            style={buttonStyle}
            disabled={page === 0}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
          >
            Previous
          </button>
          <span style={{ color: C.textMuted, fontSize: 12 }}>Page {page + 1}</span>
          <button
            type="button"
            style={buttonStyle}
            disabled={!hasNext}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
