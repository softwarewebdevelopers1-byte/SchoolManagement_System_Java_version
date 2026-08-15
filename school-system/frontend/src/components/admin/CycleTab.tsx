import React, { useEffect, useState } from "react";
import styles from "./AdminDashboard.module.css";
import { getSchoolId, request } from "../../lib/api";
import { req } from "./types";

interface CycleTabProps {
  onBulkTermUpdate: (
    term: number,
    year: number,
    examType: string,
  ) => Promise<void>;
  onSchoolCycleUpdate: () => Promise<void>;
  onFinalGradeUpdate: (finalGrade: string) => Promise<void>;
  initialData?: {
    term: number;
    year: number;
    examType: string;
    finalGrade: string;
  };
  finalGrade?: string;
  gradeOptions?: string[];
}

export const CycleTab: React.FC<CycleTabProps> = ({
  onBulkTermUpdate,
  onSchoolCycleUpdate,
  onFinalGradeUpdate,
  gradeOptions = [],
}) => {
  const [initialData, setSchoolSettings] = useState<req>() || {};
  const [term, setTerm] = useState<number>();
  const [year, setYear] = useState<number>();
  const [examType, setExamType] = useState<string>();
  const [selectedFinalGrade, setSelectedFinalGrade] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [savingExamType, setSavingExamType] = useState(false);
  const [savingFinalGrade, setSavingFinalGrade] = useState(false);

  useEffect(() => {
    async function getTermYearAndExamType(): Promise<req> {
      return await request(
        `/schools/get/term/exam/${encodeURIComponent(getSchoolId() || "")}`,
      );
    }
    (async () => {
      setSchoolSettings(await getTermYearAndExamType());
    })();
  }, []);

  useEffect(() => {
    setTerm(initialData?.term || 1);
    setYear(initialData?.year);
    setExamType(initialData?.examType);
    setSelectedFinalGrade(initialData?.finalGrade);
  }, [initialData]);

  const handleSaveTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onBulkTermUpdate(
        term || 1,
        year || new Date().getFullYear(),
        examType || "OPENER",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExamType = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingExamType(true);
    try {
      await onBulkTermUpdate(
        term || 1,
        year || new Date().getFullYear(),
        examType || "OPENER",
      );
    } finally {
      setSavingExamType(false);
    }
  };

  const handlePromoteSchoolCycle = async () => {
    setPromoting(true);
    try {
      await onSchoolCycleUpdate();
    } finally {
      setPromoting(false);
    }
  };

  const handleSaveFinalGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFinalGrade(true);
    try {
      await onFinalGradeUpdate(selectedFinalGrade || "");
    } finally {
      setSavingFinalGrade(false);
    }
  };

  return (
    <div className={styles.anim} style={{ padding: "0 4px" }}>
      <div style={{ marginBottom: 24 }}>
        <p style={eyebrowStyle}>Academic Cycle</p>
        <h2 style={titleStyle}>Academic Cycle Management</h2>
      </div>

      <div style={noticeStyle}>
        <h4 style={{ margin: "0 0 8px", color: "var(--gold)", fontSize: 14 }}>
          Critical Action
        </h4>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>
          Promotion is now a separate global action. Term and exam phase can be
          changed independently without promoting learners.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 18,
          alignItems: "start",
        }}
      >
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Promote school cycle</h3>
          <p style={helperTextStyle}>
            Move every active learner to the next class using the backend cycle
            rules. No extra input is required.
          </p>
          <button
            type="button"
            onClick={handlePromoteSchoolCycle}
            disabled={promoting}
            style={{
              ...buttonStyle,
              opacity: promoting ? 0.7 : 1,
              cursor: promoting ? "not-allowed" : "pointer",
            }}
          >
            {promoting
              ? "Updating school cycle..."
              : "Update all students to next class"}
          </button>
        </div>

        <div style={cardStyle}>
          <form
            onSubmit={handleSaveTerm}
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
          >
            <div>
              <label style={labelStyle}>Current Term</label>
              <select
                value={term}
                onChange={(e) => setTerm(Number(e.target.value))}
                style={inputStyle}
                required
              >
                <option value={0}>--select--</option>
                <option value={1}>Term 1</option>
                <option value={2}>Term 2</option>
                <option value={3}>Term 3</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...buttonStyle,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Saving term..." : "Update Term"}
            </button>
          </form>
        </div>

        <div style={cardStyle}>
          <form
            onSubmit={handleSaveExamType}
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
          >
            <div>
              <label style={labelStyle}>Exam / CAT Phase</label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                style={inputStyle}
                required
              >
                <option value="">--select--</option>
                <option value="OPENER">Opener Exam</option>
                <option value="MIDTERM">Mid Term</option>
                <option value="CLOSING">Closing Exam</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={savingExamType}
              style={{
                ...buttonStyle,
                opacity: savingExamType ? 0.7 : 1,
                cursor: savingExamType ? "not-allowed" : "pointer",
              }}
            >
              {savingExamType ? "Saving exam type..." : "Update Exam Type"}
            </button>
          </form>
        </div>

        <div style={cardStyle}>
          <form
            onSubmit={handleSaveFinalGrade}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <div>
              <label style={labelStyle}>Final school grade</label>
              <input
                list="final-grade-options"
                value={selectedFinalGrade}
                onChange={(e) => setSelectedFinalGrade(e.target.value)}
                style={inputStyle}
                placeholder="Example: 8"
                required
              />
              <datalist id="final-grade-options">
                {gradeOptions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 12.5,
                lineHeight: 1.45,
                color: "var(--textMut)",
              }}
            >
              When the cycle changes, active learners currently in this grade
              are isolated from current classes and stored as exited learners.
            </p>
            <button
              type="submit"
              disabled={savingFinalGrade}
              style={{
                ...buttonStyle,
                opacity: savingFinalGrade ? 0.7 : 1,
                cursor: savingFinalGrade ? "not-allowed" : "pointer",
              }}
            >
              {savingFinalGrade ? "Saving..." : "Save Final Grade"}
            </button>
          </form>
        </div>
      </div>

      <div style={{ marginTop: 40 }}>
        <h4
          style={{
            fontFamily: "var(--serif)",
            color: "var(--text)",
            fontSize: 18,
            marginBottom: 15,
          }}
        >
          Frequently Asked Questions
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {[
            {
              q: "What happens to old marks?",
              a: "Old marks remain in the database and can be reviewed by cycle and stream from Admin Marks Entry.",
            },
            {
              q: "What happens to final-grade learners?",
              a: "They become completed, lose class membership and elective enrollment, and appear under Exited Learners for leadership review.",
            },
          ].map((faq, i) => (
            <div key={i} style={faqCardStyle}>
              <p
                style={{
                  fontWeight: 700,
                  fontSize: 13,
                  margin: "0 0 5px",
                  color: "var(--text)",
                }}
              >
                {faq.q}
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--textMut)",
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "var(--textMut)",
  textTransform: "uppercase",
  letterSpacing: ".06em",
  margin: "0 0 4px",
};

const titleStyle: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: "1.8rem",
  fontWeight: 600,
  color: "var(--text)",
  margin: 0,
};

const cardTitleStyle: React.CSSProperties = {
  margin: "0 0 8px",
  fontFamily: "var(--serif)",
  fontSize: "1.2rem",
  color: "var(--text)",
};

const helperTextStyle: React.CSSProperties = {
  margin: "0 0 14px",
  fontSize: 13,
  lineHeight: 1.5,
  color: "var(--textMut)",
};

const noticeStyle: React.CSSProperties = {
  background: "var(--goldP)",
  border: "1px solid var(--border)",
  color: "var(--textM)",
  padding: "1.2rem",
  borderRadius: 13,
  marginBottom: 24,
};

const cardStyle: React.CSSProperties = {
  background: "var(--white)",
  border: "1px solid var(--border)",
  borderRadius: 13,
  padding: "2rem",
  maxWidth: 520,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 8,
  fontSize: 11,
  fontWeight: 700,
  color: "var(--textMut)",
  textTransform: "uppercase",
  letterSpacing: ".03em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid var(--border)",
  borderRadius: 9,
  fontFamily: "var(--sans)",
  fontSize: 14,
  color: "var(--text)",
  background: "var(--cream)",
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  background: "var(--iText)",
  color: "#fff",
  border: "none",
  borderRadius: 9,
  padding: "12px",
  fontSize: 14,
  fontWeight: 700,
  fontFamily: "var(--sans)",
  marginTop: 8,
  transition: "all 0.2s",
};

const faqCardStyle: React.CSSProperties = {
  padding: 16,
  background: "var(--white)",
  border: "1px solid var(--border)",
  borderRadius: 12,
};
