import { useState } from "react";
import { request } from "../../lib/api";
import type { Class } from "./types";
import styles from "./ResultsPublishingTab.module.css";

type Props = { classes: Class[] };

export const ResultsPublishingTab = ({ classes }: Props) => {
  const [classId, setClassId] = useState("");
  const [academicYear, setAcademicYear] = useState(String(new Date().getFullYear()));
  const [term, setTerm] = useState("1");
  const [examType, setExamType] = useState("ENDTERM");
  const [message, setMessage] = useState("");
  const [publishing, setPublishing] = useState(false);

  const publish = async () => {
    if (!classId) {
      setMessage("Select a class before publishing results.");
      return;
    }
    setPublishing(true);
    setMessage("");
    try {
      const response = await request<{ publishedStudents: number; accessLinks: unknown[] }>(
        "/results/publish",
        {
          method: "POST",
          body: JSON.stringify({
            classId,
            academicYear,
            term: Number(term),
            examType,
          }),
        },
      );
      setMessage(`${response.publishedStudents} student result(s) published. ${response.accessLinks.length} new secure link(s) created.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to publish results.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <section className={styles.panel}>
      <p className={styles.eyebrow}>Academic cycle</p>
      <h2 className={styles.title}>Publish results</h2>
      <p className={styles.intro}>
        Results remain unavailable to parents until this class, term, and examination period are published.
      </p>
      <div className={styles.form}>
        <label className={styles.field}>Class
          <select value={classId} onChange={(event) => setClassId(event.target.value)}>
            <option value="">Select class</option>
            {classes.map((schoolClass) => (
              <option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</option>
            ))}
          </select>
        </label>
        <label className={styles.field}>Academic year
          <input value={academicYear} onChange={(event) => setAcademicYear(event.target.value)} />
        </label>
        <label className={styles.field}>Term
          <select value={term} onChange={(event) => setTerm(event.target.value)}>
            <option value="1">Term 1</option><option value="2">Term 2</option><option value="3">Term 3</option>
          </select>
        </label>
        <label className={styles.field}>Exam
          <select value={examType} onChange={(event) => setExamType(event.target.value)}>
            <option value="OPENER">Opener</option><option value="MIDTERM">Midterm</option><option value="ENDTERM">End term</option>
          </select>
        </label>
      </div>
      <div className={styles.actions}>
        <button className={styles.publishButton} type="button" onClick={() => void publish()} disabled={publishing}>
          {publishing ? "Publishing..." : "Publish Results"}
        </button>
        {message && <p className={styles.message} role="status">{message}</p>}
      </div>
    </section>
  );
};
