import React, { useEffect, useMemo, useState } from "react";
import { api, getSchoolId } from "../../lib/api";
import { useCbcGradingBands } from "../../lib/cbcGrading";

interface TeacherRemarkTabProps {
  subjectId: string;
  subjectName: string;
  teacherId: string;
}

export const TeacherRemarkTab: React.FC<TeacherRemarkTabProps> = ({
  subjectId,
  subjectName,
  teacherId,
}) => {
  const { bands, loading: gradingLoading } = useCbcGradingBands();
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const schoolId = useMemo(() => getSchoolId(), []);

  useEffect(() => {
    const load = async () => {
      if (!schoolId || !subjectId || !teacherId) {
        return;
      }
      try {
        const data: any[] = await api.get("/teacher-remarks", {
          schoolId,
          subjectId,
          teacherId,
        });
        const next: Record<string, string> = {};
        (data || []).forEach((item) => {
          if (item?.gradeBand) {
            next[String(item.gradeBand)] = item.remark || "";
          }
        });
        setRemarks(next);
      } catch {
        setRemarks({});
      }
    };

    void load();
  }, [schoolId, subjectId, teacherId]);

  const handleChange = (gradeBand: string, value: string) => {
    setRemarks((current) => ({ ...current, [gradeBand]: value }));
  };

  const handleSave = async (gradeBand: string) => {
    if (!schoolId || !subjectId || !teacherId) return;
    try {
      setSaving(true);
      setError(null);
      await api.put("/teacher-remarks", {
        schoolId,
        subjectId,
        teacherId,
        gradeBand,
        remark: remarks[gradeBand] || "",
      });
      setMessage(`Saved remark for ${gradeBand}.`);
      setTimeout(() => setMessage(null), 2500);
    } catch (err: any) {
      setError(err?.message || "Unable to save remark.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    if (!schoolId || !subjectId || !teacherId) return;
    try {
      setSaving(true);
      setError(null);
      await Promise.all(
        (bands || []).map((band) =>
          api.put("/teacher-remarks", {
            schoolId,
            subjectId,
            teacherId,
            gradeBand: band.grade,
            remark: remarks[band.grade] || "",
          }),
        ),
      );
      setMessage("All remarks saved successfully.");
      setTimeout(() => setMessage(null), 2500);
    } catch (err: any) {
      setError(err?.message || "Unable to save all remarks.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "grid", gap: 6 }}>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: ".09em", textTransform: "uppercase", color: "var(--gold)" }}>
          Remarks
        </p>
        <h2 style={{ margin: 0, fontFamily: "var(--serif)", fontSize: "1.8rem", color: "var(--text)" }}>
          {subjectName}
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: "var(--textMut)" }}>
          Add a tailored remark for each CBC grade band. These will be used in the student report slip for this subject.
        </p>
      </div>

      {message && (
        <div style={{ padding: "10px 12px", borderRadius: 10, background: "var(--sBg)", color: "var(--sText)", fontSize: 12.5, fontWeight: 700 }}>
          {message}
        </div>
      )}
      {error && (
        <div style={{ padding: "10px 12px", borderRadius: 10, background: "var(--dBg)", color: "var(--dText)", fontSize: 12.5, fontWeight: 700 }}>
          {error}
        </div>
      )}

      {gradingLoading ? (
        <div style={{ padding: 18, borderRadius: 12, background: "var(--cream)", color: "var(--textMut)" }}>Loading grading bands...</div>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving || bands.length === 0}
            style={{ justifySelf: "start", padding: "11px 18px", borderRadius: 10, border: "none", background: "var(--text)", color: "var(--white)", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}
          >
            {saving ? "Saving..." : "Save all remarks"}
          </button>
          {(bands || []).map((band) => (
            <div key={band.bandId || band.grade} style={{ border: "1px solid var(--border)", borderRadius: 14, background: "var(--white)", padding: 16, display: "grid", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--textMut)" }}>Grade band</p>
                  <strong style={{ fontSize: 20, color: "var(--text)" }}>{band.grade}</strong>
                </div>
                <span style={{ padding: "6px 9px", borderRadius: 999, background: "var(--sand)", color: "var(--text)", fontSize: 12, fontWeight: 700 }}>
                  {band.minScore}-{band.maxScore}
                </span>
              </div>
              <textarea
                value={remarks[band.grade] || ""}
                onChange={(event) => handleChange(band.grade, event.target.value)}
                rows={4}
                placeholder={`Write the remark for ${band.grade}...`}
                style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 10, resize: "vertical", padding: 12, fontSize: 13, fontFamily: "inherit", background: "var(--cream)" }}
              />
              <button
                type="button"
                onClick={() => handleSave(band.grade)}
                disabled={saving}
                style={{ justifySelf: "flex-end", padding: "10px 18px", borderRadius: 10, border: "none", background: "var(--gold)", color: "#fff", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}
              >
                {saving ? "Saving..." : `Save ${band.grade}`}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
