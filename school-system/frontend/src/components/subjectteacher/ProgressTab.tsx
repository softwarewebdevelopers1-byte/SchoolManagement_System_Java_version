// components/subjectteacher/ProgressTab.tsx
import React, { useMemo } from "react";
import styles from "./SubjectTeacherDashboard.module.css";
import { Subject, Student, MarksData } from "./types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ProgressTabProps {
  subjects: Subject[];
  activeSubjectId: string;
  students: Student[];
  marksData: MarksData;
  onSubjectChange: (subjectId: string) => void;
  avatar: (name: string, size: number) => string;
  gc: (value: number) => string;
}

export const ProgressTab: React.FC<ProgressTabProps> = ({
  subjects,
  activeSubjectId,
  students,
  marksData,
  onSubjectChange,
  avatar,
  gc,
}) => {
  const currentSubject =
    subjects.find((s) => s.id === activeSubjectId) || subjects[0];
  const subjectMarks = marksData[activeSubjectId] || {};
  const marksReadyCount = students.filter((s) => {
    const m = subjectMarks[s.id];
    return m && m.cat1 !== null && m.cat2 !== null;
  }).length;

  const distribution = useMemo(() => {
    const buckets = [
      { range: "0-20", min: 0, max: 20, count: 0 },
      { range: "21-40", min: 21, max: 40, count: 0 },
      { range: "41-60", min: 41, max: 60, count: 0 },
      { range: "61-80", min: 61, max: 80, count: 0 },
      { range: "81-100", min: 81, max: 100, count: 0 },
    ];
    students.forEach((student) => {
      const marks = subjectMarks[student.id];
      if (!marks || marks.cat1 === null || marks.cat2 === null) return;
      const total = Number(marks.cat1 || 0) + Number(marks.cat2 || 0);
      const maxTotal = Number(marks.cat1Max || 40) + Number(marks.cat2Max || 40);
      const pct = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
      const bucket = buckets.find((b) => pct >= b.min && pct <= b.max);
      if (bucket) bucket.count += 1;
    });
    return buckets.filter((b) => b.count > 0);
  }, [students, subjectMarks]);

  return (
    <div className={styles.anim}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Learner Progress</p>
          <h2 className={styles.sectionTitle}>Student Progress</h2>
          <p className={styles.sectionSub}>
            Performance across all assigned streams
          </p>
        </div>
        <select
          className={styles.dhInput}
          value={activeSubjectId}
          onChange={(e) => onSubjectChange(e.target.value)}
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} – {s.grade}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.metricGrid} style={{ marginBottom: 12 }}>
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Learners</p>
          <p className={styles.metricValue}>{students.length}</p>
          <p className={styles.metricNote}>{currentSubject.grade}</p>
        </div>
        <div
          className={styles.metricCard}
          style={{ borderTopColor: "var(--gold)" }}
        >
          <p className={styles.metricLabel}>Marks ready</p>
          <p className={styles.metricValue}>{marksReadyCount}</p>
          <p className={styles.metricNote}>With CAT scores</p>
        </div>
      </div>

      {distribution.length > 0 && (
        <div className={styles.card} style={{ marginBottom: 14 }}>
          <p
            style={{
              fontFamily: "var(--sans)",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--textMut)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: "0 0 1rem",
            }}
          >
            Score distribution
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={distribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7ece9" />
              <XAxis
                dataKey="range"
                tick={{ fontSize: 11, fill: "#6d7c74" }}
              />
              <YAxis tick={{ fontSize: 11, fill: "#6d7c74" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" name="Learners" fill="#c9963d" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>CAT 1</th>
                <th>CAT 2</th>
                <th>Progress</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const marks = subjectMarks[student.id] || {
                  cat1: null,
                  cat2: null,
                };
                const pct =
                  marks.cat1 !== null
                    ? Math.round((Number(marks.cat1) / 40) * 100)
                    : null;
                const trend =
                  marks.cat1 !== null && marks.cat2 !== null
                    ? marks.cat2 > marks.cat1
                      ? "↑"
                      : "↓"
                    : "–";
                const tColor =
                  trend === "↑"
                    ? "var(--sText)"
                    : trend === "↓"
                      ? "var(--dText)"
                      : "var(--textF)";

                return (
                  <tr key={student.id}>
                    <td>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: avatar(student.name, 26),
                        }}
                      />
                      <div>
                        <p
                          style={{
                            fontWeight: 600,
                            color: "var(--text)",
                            margin: 0,
                            fontSize: "13px",
                          }}
                        >
                          {student.name}
                        </p>
                        <p
                          style={{
                            fontSize: "10.5px",
                            color: "var(--textMut)",
                            margin: 0,
                          }}
                        >
                          {student.adm}
                        </p>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontFamily: "var(--serif)",
                          fontSize: "15px",
                          fontWeight: 600,
                          color:
                            marks.cat1 !== null
                              ? gc(Math.round((Number(marks.cat1) / 40) * 100))
                              : "var(--textF)",
                        }}
                      >
                        {marks.cat1 !== null ? marks.cat1 : "–"}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontFamily: "var(--serif)",
                          fontSize: "15px",
                          fontWeight: 600,
                          color:
                            marks.cat2 !== null
                              ? gc(Math.round((Number(marks.cat2) / 40) * 100))
                              : "var(--textF)",
                        }}
                      >
                        {marks.cat2 !== null ? marks.cat2 : "–"}
                      </span>
                    </td>
                    <td>
                      {pct !== null ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <div className={styles.barWrap}>
                            <div
                              className={styles.barFill}
                              style={{ width: `${pct}%`, background: gc(pct) }}
                            />
                          </div>
                          <span style={{ fontSize: "12px", color: gc(pct) }}>
                            {pct}%
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: "var(--textF)" }}>–</span>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          color: tColor,
                        }}
                      >
                        {trend}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
