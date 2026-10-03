import React, { useCallback, useEffect, useState } from "react";
import { api, downloadApiFile, getSchoolId } from "../../lib/api";
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
  status: "PENDING" | "PROCESSING" | "VERIFIED" | "FAILED" | "SUPERSEDED";
  requestedAt: string;
  verifiedAt: string | null;
  documentSize: number | null;
  cleanupEligible: boolean;
  lastError: string | null;
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

export const ArchivesView: React.FC<ArchivesViewProps> = ({
  classGrade,
  classStream,
  title = "Academic Archives",
  allowManagement = false,
}) => {
  const toast = useNotifications();
  const [archives, setArchives] = useState<Archive[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [preview, setPreview] = useState<AttendancePreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [retryingId, setRetryingId] = useState("");

  const fetchArchives = useCallback(async () => {
    setLoading(true);
    try {
      const items = await api.get<Archive[]>("/school/archives");
      setArchives(Array.isArray(items) ? items : []);
    } catch (error) {
      toast.error(friendlyErrorMessage(error, "Unable to load archives right now."));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchArchives();
  }, [fetchArchives]);

  useEffect(() => {
    if (!allowManagement) return;
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
  }, [allowManagement, toast]);

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
    setSubmitting(true);
    try {
      await api.post("/admin/archives/attendance", {
        classId: selectedClass,
        startDate,
        endDate,
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

  const download = async (archive: Archive, kind: "pdf" | "snapshot") => {
    try {
      await downloadApiFile(
        `/school/archives/${encodeURIComponent(archive.id)}/${kind}`,
        `${archive.type.toLowerCase()}-${archive.id}.${kind === "pdf" ? "pdf" : "json"}`,
      );
    } catch (error) {
      toast.error(friendlyErrorMessage(error, "Unable to download this archive."));
    }
  };

  const filtered = archives.filter((archive) => {
    const className = archive.className.toLowerCase();
    if (classGrade && !className.includes(classGrade.toLowerCase())) return false;
    if (classStream && !className.includes(classStream.toLowerCase())) return false;
    const details = [
      archive.type,
      archive.className,
      archive.academicYear,
      archive.term,
      archive.examType,
      archive.startDate,
      archive.endDate,
      archive.status,
    ].join(" ").toLowerCase();
    return details.includes(search.trim().toLowerCase());
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
          Verified historical documents and structured snapshots. Source marks and attendance are retained.
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
            <select style={inputStyle} value={selectedClass} onChange={(event) => { setSelectedClass(event.target.value); setPreview(null); }}>
              <option value="">Select class</option>
              {classes.map((schoolClass) => (
                <option key={schoolClass.classId} value={schoolClass.classId}>{schoolClass.className}</option>
              ))}
            </select>
          </label>
          <label style={{ display: "grid", gap: 5, fontSize: 12, color: C.textMuted }}>
            Start date
            <input required type="date" style={inputStyle} value={startDate} onChange={(event) => { setStartDate(event.target.value); setPreview(null); }} />
          </label>
          <label style={{ display: "grid", gap: 5, fontSize: 12, color: C.textMuted }}>
            End date
            <input required type="date" style={inputStyle} value={endDate} onChange={(event) => { setEndDate(event.target.value); setPreview(null); }} />
          </label>
          <button type="button" style={buttonStyle} onClick={() => void previewAttendanceArchive()} disabled={previewLoading || submitting}>
            {previewLoading ? "Checking..." : "Preview"}
          </button>
          <button type="submit" style={buttonStyle} disabled={submitting || !preview?.ready}>
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
          <p style={{ gridColumn: "1 / -1", margin: 0, color: C.textFaint, fontSize: 12 }}>
            Only existing locked sheets in the selected range are archived. The current system has no school-day calendar,
            so missing dates are not inferred.
          </p>
        </form>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search type, class, period, or status"
          aria-label="Search archives"
          style={{ ...inputStyle, flex: 1 }}
        />
        <button type="button" style={buttonStyle} onClick={() => void fetchArchives()} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: C.textFaint }}>Loading archives...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: C.textMuted, background: C.white, borderRadius: 12 }}>
          No archives found.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", gap: 14 }}>
          {filtered.map((archive) => (
            <article key={archive.id} style={{
              display: "grid", gap: 10, padding: 16, background: C.white,
              border: `1px solid ${C.border}`, borderRadius: 12,
            }}>
              <div>
                <strong style={{ color: C.text }}>{archive.type === "RESULT" ? "Results" : "Attendance"} · {archive.className}</strong>
                <p style={{ margin: "5px 0", color: C.textMuted, fontSize: 12 }}>
                  {archive.type === "RESULT"
                    ? `${archive.academicYear} · Term ${archive.term} · ${archive.examType}`
                    : `${archive.startDate} to ${archive.endDate}`}
                  {" · "}v{archive.version}
                </p>
                <p style={{ margin: 0, color: C.textFaint, fontSize: 12 }}>
                  {archive.status} · {new Date(archive.requestedAt).toLocaleString()}
                  {archive.documentSize ? ` · ${(archive.documentSize / 1024).toFixed(1)} KB` : ""}
                </p>
              </div>
              {archive.lastError && <p role="alert" style={{ margin: 0, color: "#9a2d2d", fontSize: 12 }}>{archive.lastError}</p>}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {archive.status === "VERIFIED" && (
                  <>
                    <button type="button" style={buttonStyle} onClick={() => void download(archive, "pdf")}>Download PDF</button>
                    <button type="button" style={buttonStyle} onClick={() => void download(archive, "snapshot")}>Download snapshot</button>
                  </>
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
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
