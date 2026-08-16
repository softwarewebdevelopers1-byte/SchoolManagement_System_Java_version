import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getClassId, getCurrentTeacherProfileId, request } from "../../lib/api";

type AttendanceStatus = "PRESENT" | "ABSENT" | string;

interface AttendanceRecord {
  id?: string;
  studentId?: string;
  admissionNumber?: string;
  studentName?: string;
  name?: string;
  status?: AttendanceStatus;
  present?: boolean;
  studentAdm?: string;
}

interface AttendanceHistoryResponse {
  id?: string;
  attendanceSheetId?: string;
  date?: string;
  className?: string;
  classId?: string;
  teacherName?: string;
  totalStudents?: number;
  presentCount?: number;
  absentCount?: number;
  records?: AttendanceRecord[];
  attendanceRecords?: AttendanceRecord[];
  students?: AttendanceRecord[];
}

interface AttendanceHistoryProps {
  /**
   * Endpoint used to load the attendance sheet for the selected date.
   *
   * Example:
   * /api/attendance/class/history
   *
   * The selected date is appended as ?date=YYYY-MM-DD.
   */
  endpoint?: string;

  /**
   * Optional class ID if your backend requires it.
   * The request becomes:
   * ?date=YYYY-MM-DD&classId=<classId>
   */
  classId?: string;

  /**
   * Optional bearer token. If your app already handles authentication
   * through cookies, leave this undefined.
   */
  token?: string;

  /**
   * Optional callback when a sheet is successfully loaded.
   */
  onSheetLoaded?: (sheet: AttendanceHistoryResponse) => void;
}

const COLORS = {
  darkGreen: "#163325",
  gold: "#c9963d",
  white: "#ffffff",
  softGreen: "#f2f7f4",
  softGold: "#fbf6eb",
  border: "#dfe8e3",
  text: "#1f2d26",
  muted: "#6d7c74",
  danger: "#b42318",
  softDanger: "#fff1f0",
};

const DEFAULT_ENDPOINT = "/api/attendance/class/history";

const formatDate = (date: string) => {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
};

const getRecords = (sheet: AttendanceHistoryResponse): AttendanceRecord[] =>
  sheet.records ?? sheet.attendanceRecords ?? sheet.students ?? [];

const getStatus = (record: AttendanceRecord): AttendanceStatus => {
  if (record.status) return record.status.toUpperCase();

  if (typeof record.present === "boolean") {
    return record.present ? "PRESENT" : "ABSENT";
  }

  return "UNKNOWN";
};

export default function ClassTeacherAttendanceHistory({
  endpoint = DEFAULT_ENDPOINT,
  classId,
  token,
  onSheetLoaded,
}: AttendanceHistoryProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [sheet, setSheet] = useState<AttendanceHistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const loadAttendanceSheet = useCallback(
    async (date: string) => {
      if (!date) return;

      setLoading(true);
      setError("");
      setSearched(true);
      setSheet(null);

      try {
        const params = new URLSearchParams({ date });

        if (classId) {
          params.set("classId", classId);
        }

        const response: any = await request(
          `/attendance/get/attendance-sheet`,
          {
            method: "POST",
            body: JSON.stringify({
              classId: getClassId() || "",
              date,
              teacherId: getCurrentTeacherProfileId() || "",
            }),
          },
        );

        if (response.status === 404) {
          setError(`No attendance sheet was found for ${formatDate(date)}.`);
          return;
        }

        // if (!response.ok) {
        //   const message = await response.text();
        //   throw new Error(
        //     message || `Unable to load attendance sheet (${response.status}).`,
        //   );
        // }

        const data: AttendanceHistoryResponse = await response;

        setSheet(data);
        onSheetLoaded?.(data);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Something went wrong while loading the attendance sheet.",
        );
      } finally {
        setLoading(false);
      }
    },
    [classId, endpoint, onSheetLoaded, token],
  );

  useEffect(() => {
    // Intentionally does not fetch automatically.
    // The class teacher chooses a date and clicks Search.
  }, []);

  const records = useMemo(() => (sheet ? getRecords(sheet) : []), [sheet]);

  const totalStudents =
    sheet?.totalStudents ??
    (records.length > 0 ? records.length : undefined) ??
    0;

  const presentCount =
    sheet?.presentCount ??
    records.filter((record) => getStatus(record) === "PRESENT").length;

  const absentCount =
    sheet?.absentCount ??
    records.filter((record) => getStatus(record) === "ABSENT").length;

  const attendanceRate =
    totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loadAttendanceSheet(selectedDate);
  };

  return (
    <div className="attendance-history-page">
      <style>{`
        .attendance-history-page {
          min-height: 100%;
          padding: 28px;
          background: #f8faf9;
          color: ${COLORS.text};
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
          box-sizing: border-box;
        }

        .attendance-history-page *,
        .attendance-history-page *::before,
        .attendance-history-page *::after {
          box-sizing: border-box;
        }

        .attendance-history-container {
          max-width: 1180px;
          margin: 0 auto;
        }

        .attendance-history-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .attendance-history-title-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .attendance-history-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: ${COLORS.darkGreen};
          color: ${COLORS.white};
          font-size: 22px;
          box-shadow: 0 8px 20px rgba(22, 51, 37, 0.16);
        }

        .attendance-history-title {
          margin: 0;
          color: ${COLORS.darkGreen};
          font-size: clamp(23px, 3vw, 30px);
          line-height: 1.2;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .attendance-history-subtitle {
          margin: 5px 0 0;
          color: ${COLORS.muted};
          font-size: 14px;
        }

        .attendance-history-search-card {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          padding: 18px;
          margin-bottom: 22px;
          background: ${COLORS.white};
          border: 1px solid ${COLORS.border};
          border-radius: 16px;
          box-shadow: 0 5px 18px rgba(22, 51, 37, 0.05);
        }

        .attendance-history-field {
          flex: 1;
          min-width: 220px;
        }

        .attendance-history-label {
          display: block;
          margin-bottom: 7px;
          color: ${COLORS.darkGreen};
          font-size: 13px;
          font-weight: 700;
        }

        .attendance-history-input {
          width: 100%;
          height: 46px;
          padding: 0 13px;
          border: 1px solid #cbd8d1;
          border-radius: 10px;
          outline: none;
          color: ${COLORS.text};
          background: ${COLORS.white};
          font-size: 14px;
          transition: 0.2s ease;
        }

        .attendance-history-input:focus {
          border-color: ${COLORS.gold};
          box-shadow: 0 0 0 3px rgba(201, 150, 61, 0.15);
        }

        .attendance-history-search-button {
          height: 46px;
          min-width: 125px;
          padding: 0 20px;
          border: 0;
          border-radius: 10px;
          background: ${COLORS.darkGreen};
          color: ${COLORS.white};
          font-size: 14px;
          font-weight: 750;
          cursor: pointer;
          transition: transform 0.15s ease, background 0.15s ease;
        }

        .attendance-history-search-button:hover:not(:disabled) {
          background: #0f281b;
          transform: translateY(-1px);
        }

        .attendance-history-search-button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .attendance-history-error,
        .attendance-history-empty {
          padding: 22px;
          border-radius: 14px;
          text-align: center;
          border: 1px solid;
        }

        .attendance-history-error {
          color: ${COLORS.danger};
          background: ${COLORS.softDanger};
          border-color: #f3c6c2;
        }

        .attendance-history-empty {
          color: ${COLORS.muted};
          background: ${COLORS.white};
          border-color: ${COLORS.border};
        }

        .attendance-history-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 22px;
        }

        .attendance-history-stat {
          padding: 18px;
          background: ${COLORS.white};
          border: 1px solid ${COLORS.border};
          border-radius: 15px;
          box-shadow: 0 5px 18px rgba(22, 51, 37, 0.04);
        }

        .attendance-history-stat-label {
          color: ${COLORS.muted};
          font-size: 12px;
          font-weight: 650;
          margin-bottom: 8px;
        }

        .attendance-history-stat-value {
          color: ${COLORS.darkGreen};
          font-size: 25px;
          font-weight: 850;
        }

        .attendance-history-stat.gold {
          background: ${COLORS.softGold};
          border-color: #ead7ad;
        }

        .attendance-history-stat.gold .attendance-history-stat-value {
          color: ${COLORS.gold};
        }

        .attendance-history-sheet {
          overflow: hidden;
          background: ${COLORS.white};
          border: 1px solid ${COLORS.border};
          border-radius: 17px;
          box-shadow: 0 7px 22px rgba(22, 51, 37, 0.05);
        }

        .attendance-history-sheet-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 20px 22px;
          border-bottom: 1px solid ${COLORS.border};
        }

        .attendance-history-sheet-title {
          margin: 0;
          color: ${COLORS.darkGreen};
          font-size: 17px;
          font-weight: 800;
        }

        .attendance-history-date {
          margin: 5px 0 0;
          color: ${COLORS.muted};
          font-size: 13px;
        }

        .attendance-history-badge {
          padding: 7px 11px;
          border-radius: 999px;
          background: ${COLORS.softGold};
          color: #8b661f;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .attendance-history-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .attendance-history-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 650px;
        }

        .attendance-history-table th {
          padding: 13px 18px;
          text-align: left;
          color: ${COLORS.darkGreen};
          background: ${COLORS.softGreen};
          border-bottom: 1px solid ${COLORS.border};
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.45px;
        }

        .attendance-history-table td {
          padding: 14px 18px;
          border-bottom: 1px solid #edf2ef;
          color: ${COLORS.text};
          font-size: 13px;
        }

        .attendance-history-table tbody tr:last-child td {
          border-bottom: 0;
        }

        .attendance-history-table tbody tr:hover {
          background: #fbfcfb;
        }

        .attendance-history-student {
          font-weight: 750;
          color: ${COLORS.darkGreen};
        }

        .attendance-history-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 82px;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 850;
        }

        .attendance-history-status.present {
          color: ${COLORS.darkGreen};
          background: ${COLORS.softGreen};
        }

        .attendance-history-status.absent {
          color: ${COLORS.danger};
          background: ${COLORS.softDanger};
        }

        .attendance-history-status.unknown {
          color: #6b7280;
          background: #f3f4f6;
        }

        .attendance-history-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 45px 20px;
          color: ${COLORS.darkGreen};
          font-size: 14px;
          font-weight: 700;
        }

        .attendance-history-spinner {
          width: 20px;
          height: 20px;
          border: 3px solid #dbe7e0;
          border-top-color: ${COLORS.gold};
          border-radius: 50%;
          animation: attendanceHistorySpin 0.75s linear infinite;
        }

        @keyframes attendanceHistorySpin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 800px) {
          .attendance-history-page {
            padding: 18px;
          }

          .attendance-history-header {
            flex-direction: column;
          }

          .attendance-history-search-card {
            flex-direction: column;
            align-items: stretch;
          }

          .attendance-history-field {
            min-width: 0;
          }

          .attendance-history-summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .attendance-history-search-button {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .attendance-history-page {
            padding: 13px;
          }

          .attendance-history-summary {
            grid-template-columns: 1fr 1fr;
          }

          .attendance-history-stat {
            padding: 14px;
          }

          .attendance-history-stat-value {
            font-size: 21px;
          }

          .attendance-history-sheet-header {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <div className="attendance-history-container">
        <header className="attendance-history-header">
          <div className="attendance-history-title-row">
            <div className="attendance-history-icon" aria-hidden="true">
              ✓
            </div>

            <div>
              <h1 className="attendance-history-title">Attendance History</h1>
              <p className="attendance-history-subtitle">
                Search previous class attendance sheets by date.
              </p>
            </div>
          </div>
        </header>

        <form
          className="attendance-history-search-card"
          onSubmit={handleSubmit}
        >
          <div className="attendance-history-field">
            <label
              className="attendance-history-label"
              htmlFor="attendance-history-date"
            >
              Select attendance date
            </label>

            <input
              id="attendance-history-date"
              className="attendance-history-input"
              type="date"
              value={selectedDate}
              onChange={(event) => {
                setSelectedDate(event.target.value);
                setError("");
              }}
              required
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          <button
            className="attendance-history-search-button"
            type="submit"
            disabled={!selectedDate || loading}
          >
            {loading ? "Searching..." : "Search Sheet"}
          </button>
        </form>

        {loading && (
          <div className="attendance-history-sheet">
            <div className="attendance-history-loading">
              <span className="attendance-history-spinner" />
              Loading attendance sheet for {formatDate(selectedDate)}...
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="attendance-history-error" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && searched && !sheet && (
          <div className="attendance-history-empty">
            No attendance sheet was found for the selected date.
          </div>
        )}

        {!loading && sheet && (
          <>
            <section
              className="attendance-history-summary"
              aria-label="Attendance summary"
            >
              <div className="attendance-history-stat">
                <div className="attendance-history-stat-label">
                  Total Students
                </div>
                <div className="attendance-history-stat-value">
                  {totalStudents}
                </div>
              </div>

              <div className="attendance-history-stat">
                <div className="attendance-history-stat-label">Present</div>
                <div className="attendance-history-stat-value">
                  {presentCount}
                </div>
              </div>

              <div className="attendance-history-stat">
                <div className="attendance-history-stat-label">Absent</div>
                <div className="attendance-history-stat-value">
                  {absentCount}
                </div>
              </div>

              <div className="attendance-history-stat gold">
                <div className="attendance-history-stat-label">
                  Attendance Rate
                </div>
                <div className="attendance-history-stat-value">
                  {attendanceRate}%
                </div>
              </div>
            </section>

            <section className="attendance-history-sheet">
              <div className="attendance-history-sheet-header">
                <div>
                  <h2 className="attendance-history-sheet-title">
                    {sheet.className || "Class Attendance Sheet"}
                  </h2>

                  <p className="attendance-history-date">
                    {sheet.date
                      ? formatDate(sheet.date)
                      : formatDate(selectedDate)}
                    {sheet.teacherName ? ` • ${sheet.teacherName}` : ""}
                  </p>
                </div>

                <span className="attendance-history-badge">
                  {sheet.attendanceSheetId || sheet.id
                    ? `Sheet #${sheet.attendanceSheetId || sheet.id}`
                    : "Attendance Sheet"}
                </span>
              </div>

              {records.length === 0 ? (
                <div className="attendance-history-empty">
                  The attendance sheet was loaded, but no student records were
                  returned by the API.
                </div>
              ) : (
                <div className="attendance-history-table-wrapper">
                  <table className="attendance-history-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Admission No.</th>
                        <th>Student</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {records.map((record, index) => {
                        console.log("record ", record);

                        const status = getStatus(record);
                        const normalizedStatus = status.toLowerCase();

                        return (
                          <tr
                            key={
                              record.id ||
                              record.studentId ||
                              record.studentAdm ||
                              index
                            }
                          >
                            <td>{index + 1}</td>
                            <td>
                              {record.studentAdm || record.studentId || "—"}
                            </td>
                            <td className="attendance-history-student">
                              {record.studentName || record.name || "Unknown"}
                            </td>
                            <td>
                              <span
                                className={`attendance-history-status ${
                                  normalizedStatus === "present"
                                    ? "present"
                                    : normalizedStatus === "absent"
                                      ? "absent"
                                      : "unknown"
                                }`}
                              >
                                {status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
