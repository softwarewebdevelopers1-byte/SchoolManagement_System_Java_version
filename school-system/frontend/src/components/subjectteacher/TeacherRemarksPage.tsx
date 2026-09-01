import React, { useEffect, useMemo, useState } from "react";
import { api, getSchoolId, normalizeUser } from "../../lib/api";
import { TeacherRemarkTab } from "./TeacherRemarkTab";

interface RemarkSubject {
  id: string;
  name: string;
  mainTeacherId?: string | null;
}

const TeacherRemarksPage: React.FC = () => {
  const user = useMemo(() => {
    const saved = localStorage.getItem("user");
    if (!saved) return null;
    try {
      const session = JSON.parse(saved);
      return normalizeUser(session.user || session);
    } catch {
      return null;
    }
  }, []);
  const [subjects, setSubjects] = useState<RemarkSubject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const teacherId = String(user?.teacherId || user?.teacherProfileId || "");

  useEffect(() => {
    const loadSubjects = async () => {
      if (!getSchoolId() || !teacherId) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.get<any[]>("/school/subjects");
        const assigned = (data || [])
          .map((subject) => ({
            id: String(subject.id || subject.subjectId || ""),
            name: subject.name || subject.subjectName || "Subject",
            mainTeacherId: subject.mainTeacherId || subject.mainTeacher?.id || null,
          }))
          .filter((subject) => subject.id && String(subject.mainTeacherId) === teacherId);
        setSubjects(assigned);
        setSelectedSubjectId(assigned[0]?.id || "");
      } catch (err: any) {
        setError(err?.message || "Unable to load assigned subjects.");
      } finally {
        setLoading(false);
      }
    };
    void loadSubjects();
  }, [teacherId]);

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId);

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)", padding: "32px 5vw" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gap: 24 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--gold)" }}>Teacher workspace</p>
            <h1 style={{ margin: "6px 0", fontFamily: "var(--serif)", fontSize: "2rem", color: "var(--text)" }}>Subject remarks</h1>
            <p style={{ margin: 0, color: "var(--textMut)", fontSize: 13 }}>Write the grade-band remarks used on student reports.</p>
          </div>
          <button type="button" onClick={() => { localStorage.removeItem("user"); window.location.href = "/login"; }} style={{ padding: "10px 16px", border: "1px solid var(--border)", borderRadius: 10, background: "var(--white)", color: "var(--text)", fontWeight: 700, cursor: "pointer" }}>Log out</button>
        </header>

        {loading ? <div style={{ color: "var(--textMut)" }}>Loading assigned subjects...</div> : error ? <div style={{ color: "var(--dText)" }}>{error}</div> : subjects.length === 0 ? <div style={{ padding: 24, border: "1px solid var(--border)", borderRadius: 12, background: "var(--white)", color: "var(--textMut)" }}>No subjects are assigned to you as the main teacher.</div> : (
          <>
            {subjects.length > 1 && <select value={selectedSubjectId} onChange={(event) => setSelectedSubjectId(event.target.value)} style={{ width: "100%", maxWidth: 360, padding: "11px 12px", border: "1px solid var(--border)", borderRadius: 10, background: "var(--white)", color: "var(--text)" }}>
              {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </select>}
            {selectedSubject && <TeacherRemarkTab subjectId={selectedSubject.id} subjectName={selectedSubject.name} teacherId={teacherId} />}
          </>
        )}
      </div>
    </main>
  );
};

export default TeacherRemarksPage;