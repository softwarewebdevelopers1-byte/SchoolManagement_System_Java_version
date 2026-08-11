// components/classteacher/SubjectAssignments.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { C, FONT } from "./shared/constants";
import {
  formatSubjectOfferingTag,
  type SubjectEnrollmentMode,
} from "../../lib/subjectEnrollment";
import { api, getClassId } from "../../lib/api";

const generateElectivePairId = () => `EL-${crypto.randomUUID()}`;

interface SubjectAssignmentsProps {
  subjects: any[];
  assignments: any[];
  classGrade: string;
  classStream: string;
  classTeacherName: string;
  onSwitchToSubjectDashboard: () => void;
  canSwitchToSubjectDashboard: boolean;
  onToggleSubjectOffering: (
    subjectId: string,
    isOffered: boolean,
    enrollmentMode?: SubjectEnrollmentMode,
    sharedSlotId?: string | null,
  ) => Promise<void>;
  onRefresh?: () => void;
}

const normalizeMode = (value: any): SubjectEnrollmentMode => {
  const normalized = String(value || "compulsory").toLowerCase();
  return normalized === "elective" ? "elective" : "compulsory";
};

const getSubjectId = (subject: any) =>
  String(subject?.id || subject?._id || subject?.subjectId || "");

export const SubjectAssignments: React.FC<SubjectAssignmentsProps> = ({
  subjects,
  assignments,
  classGrade,
  classStream,
  classTeacherName,
  onSwitchToSubjectDashboard,
  canSwitchToSubjectDashboard,
  onToggleSubjectOffering,
  onRefresh,
}) => {
  const [busySubjectId, setBusySubjectId] = useState("");
  const [feedback, setFeedback] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configSubjectId, setConfigSubjectId] = useState("");
  const [configMode, setConfigMode] =
    useState<SubjectEnrollmentMode>("compulsory");
  const [configSharedSlot, setConfigSharedSlot] = useState("");
  const [configSharedSlotCopied, setConfigSharedSlotCopied] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [addSubjectId, setAddSubjectId] = useState("");
  const [addSubjectType, setAddSubjectType] =
    useState<SubjectEnrollmentMode>("compulsory");
  const [addElectiveCode, setAddElectiveCode] = useState("");
  const [addElectiveCodeCopied, setAddElectiveCodeCopied] = useState(false);
  const [addSaving, setAddSaving] = useState(false);

  const loadAllSubjects = useCallback(async () => {
    try {
      const data: any[] = await api.get("/school/subjects");
      setAllSubjects(data || []);
    } catch (err: any) {
      setAllSubjects([]);
      setFeedback({
        text: err?.message || "Unable to load available subjects.",
        type: "error",
      });
    }
  }, []);

  useEffect(() => {
    void loadAllSubjects();
  }, [loadAllSubjects]);

  const registeredIds = useMemo(
    () => new Set(subjects.map((subject) => getSubjectId(subject))),
    [subjects],
  );
  const unregistered = allSubjects.filter(
    (subject) => !registeredIds.has(getSubjectId(subject)),
  );
  const offeredSubjects = subjects.filter(
    (subject) => subject.isOffered !== false,
  );
  const droppedSubjects = subjects.filter(
    (subject) => subject.isOffered === false,
  );
  const subjectsWithTeachers = offeredSubjects.map((subject) => {
    const subjectId = getSubjectId(subject);
    const assignment = assignments.find((item) => {
      const assignedSubjectId = String(
        item.subjectId?._id || item.subjectId || item.id || "",
      );
      return assignedSubjectId === subjectId;
    });

    return {
      ...subject,
      id: subjectId,
      enrollmentMode: normalizeMode(subject.enrollmentMode),
      assignedTeacher: assignment ? assignment.teacherName : "Not assigned",
      isClassTeacher: assignment
        ? assignment.teacherName === classTeacherName
        : false,
    };
  });

  const myTeachingLoad = subjectsWithTeachers.filter(
    (subject) => subject.isClassTeacher,
  ).length;
  const supportingTeachersCount = new Set(
    subjectsWithTeachers
      .filter(
        (subject) =>
          subject.assignedTeacher !== "Not assigned" && !subject.isClassTeacher,
      )
      .map((subject) => subject.assignedTeacher),
  ).size;

  const copyText = async (
    value: string,
    onCopied: (copied: boolean) => void,
  ) => {
    if (!value.trim()) return;
    try {
      await navigator.clipboard.writeText(value.trim());
      onCopied(true);
    } catch (_) {
      onCopied(false);
    }
  };

  const openConfig = (subject: any) => {
    setConfigSubjectId(getSubjectId(subject));
    setConfigMode(normalizeMode(subject.enrollmentMode));
    setConfigSharedSlot(subject.sharedSlotId || "");
    setConfigSharedSlotCopied(false);
    setConfigModalOpen(true);
  };

  const saveConfig = async () => {
    setFeedback(null);
    try {
      await onToggleSubjectOffering(
        configSubjectId,
        true,
        configMode,
        configMode === "elective" ? configSharedSlot.trim() || null : null,
      );
      setFeedback({
        text: "Subject configuration saved successfully.",
        type: "success",
      });
      setConfigModalOpen(false);
      onRefresh?.();
    } catch (err: any) {
      setFeedback({
        text: err?.message || "Failed to save subject configuration.",
        type: "error",
      });
    }
  };

  const toggleSubject = async (
    subjectId: string,
    isOffered: boolean,
    subjectName: string,
  ) => {
    const confirmed = window.confirm(
      isOffered
        ? `Add ${subjectName} back to Grade ${classGrade}${classStream}?`
        : `Drop ${subjectName} for Grade ${classGrade}${classStream}?`,
    );
    if (!confirmed) return;

    setBusySubjectId(subjectId);
    setFeedback(null);
    try {
      const subject = subjects.find((item) => getSubjectId(item) === subjectId);
      await onToggleSubjectOffering(
        subjectId,
        isOffered,
        normalizeMode(subject?.enrollmentMode),
        subject?.sharedSlotId || null,
      );
      setFeedback({
        text: isOffered
          ? `${subjectName} is active for this class again.`
          : `${subjectName} has been dropped for this class.`,
        type: "success",
      });
      onRefresh?.();
    } catch (err: any) {
      setFeedback({
        text: err?.message || "Unable to update this subject.",
        type: "error",
      });
    } finally {
      setBusySubjectId("");
    }
  };

  const handleAddSubject = async () => {
    if (!addSubjectId) {
      setFeedback({ text: "Please select a subject.", type: "error" });
      return;
    }

    setAddSaving(true);
    setFeedback(null);
    try {
      console.log(addElectiveCode.toUpperCase());

      await api.post("/register/subject-joint", {
        subjectId: addSubjectId,
        classId: getClassId(),
        enrollmentMode: addSubjectType,
        electiveCode:
          addSubjectType === "elective" && addElectiveCode.trim()
            ? addElectiveCode.trim().toUpperCase()
            : null,
      });
      setFeedback({ text: "Subject added to this class.", type: "success" });
      setAddModalOpen(false);
      setAddSubjectId("");
      setAddSubjectType("compulsory");
      setAddElectiveCode("");
      setAddElectiveCodeCopied(false);
      onRefresh?.();
    } catch (err: any) {
      setFeedback({
        text: err?.message || "Failed to add subject to this class.",
        type: "error",
      });
    } finally {
      setAddSaving(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <section style={heroStyle}>
        <div>
          <p style={eyebrowStyle}>Subject overview</p>
          <h2 style={titleStyle}>
            Assigned teachers for Grade {classGrade}
            {classStream}
          </h2>
          <p style={subtitleStyle}>
            Review registered subjects, teacher assignments, and add missing
            subjects to this class.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            style={outlineButtonStyle}
          >
            + Add Subject
          </button>
          {canSwitchToSubjectDashboard && (
            <button
              type="button"
              onClick={onSwitchToSubjectDashboard}
              style={primaryButtonStyle}
            >
              Open subject dashboard
            </button>
          )}
        </div>
      </section>

      <section style={metricGridStyle}>
        <MetricCard
          label="Active subjects"
          value={offeredSubjects.length}
          note="Currently taught in this class"
        />
        <MetricCard
          label="My teaching load"
          value={myTeachingLoad}
          note="Subjects handled personally"
        />
        <MetricCard
          label="Supporting teachers"
          value={supportingTeachersCount}
          note="Other staff on this stream"
        />
        <MetricCard
          label="Dropped subjects"
          value={droppedSubjects.length}
          note="Can be restored anytime"
        />
      </section>

      {feedback && <FeedbackMessage feedback={feedback} />}

      <section style={panelStyle}>
        <PanelHeader title="Active subjects and assigned teachers" />
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", minWidth: 760, borderCollapse: "collapse" }}
          >
            <thead>
              <tr style={{ background: C.cream }}>
                {[
                  "Subject",
                  "Department",
                  "Assigned teacher",
                  "Type",
                  "Actions",
                ].map((heading) => (
                  <th key={heading} style={headingStyle}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subjectsWithTeachers.map((subject) => (
                <tr
                  key={subject.id}
                  style={{ borderTop: `1px solid ${C.borderLight}` }}
                >
                  <td style={cellStyle}>
                    <p style={primaryTextStyle}>{subject.name}</p>
                    <p style={secondaryTextStyle}>
                      {formatSubjectOfferingTag(
                        subject.enrollmentMode,
                        subject.sharedSlotId,
                      )}
                    </p>
                  </td>
                  <td style={cellStyle}>{subject.department || "Academic"}</td>
                  <td style={cellStyle}>
                    <span style={teacherBadgeStyle(subject)}>
                      {subject.assignedTeacher}
                    </span>
                  </td>
                  <td style={cellStyle}>
                    {subject.enrollmentMode === "elective"
                      ? "Elective"
                      : "Compulsory"}
                  </td>
                  <td style={cellStyle}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => openConfig(subject)}
                        style={smallGreenButtonStyle}
                      >
                        Configure
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          void toggleSubject(subject.id, false, subject.name)
                        }
                        disabled={busySubjectId === subject.id}
                        style={smallGoldButtonStyle}
                      >
                        {busySubjectId === subject.id
                          ? "Updating..."
                          : "Drop subject"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {subjectsWithTeachers.length === 0 && (
                <tr>
                  <td colSpan={5} style={emptyCellStyle}>
                    No active subjects are configured for this class.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {droppedSubjects.length > 0 && (
        <section
          style={{ ...panelStyle, padding: 16, display: "grid", gap: 10 }}
        >
          <PanelTitle title="Dropped subjects" />
          {droppedSubjects.map((subject) => (
            <div key={getSubjectId(subject)} style={droppedRowStyle}>
              <div>
                <p style={primaryTextStyle}>{subject.name}</p>
                <p style={secondaryTextStyle}>
                  {formatSubjectOfferingTag(
                    normalizeMode(subject.enrollmentMode),
                    subject.sharedSlotId,
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  void toggleSubject(getSubjectId(subject), true, subject.name)
                }
                disabled={busySubjectId === getSubjectId(subject)}
                style={smallGreenButtonStyle}
              >
                {busySubjectId === getSubjectId(subject)
                  ? "Updating..."
                  : "Add back"}
              </button>
            </div>
          ))}
        </section>
      )}

      {configModalOpen && (
        <SubjectConfigModal
          title="Configure Subject"
          mode={configMode}
          setMode={setConfigMode}
          code={configSharedSlot}
          setCode={(value) => {
            setConfigSharedSlot(value);
            setConfigSharedSlotCopied(false);
          }}
          copied={configSharedSlotCopied}
          onCopy={() =>
            void copyText(configSharedSlot, setConfigSharedSlotCopied)
          }
          onGenerate={() => {
            setConfigSharedSlot(generateElectivePairId());
            setConfigSharedSlotCopied(false);
          }}
          onCancel={() => setConfigModalOpen(false)}
          onSave={saveConfig}
        />
      )}

      {addModalOpen && (
        <AddSubjectModal
          subjects={unregistered}
          selectedSubjectId={addSubjectId}
          setSelectedSubjectId={setAddSubjectId}
          mode={addSubjectType}
          setMode={(mode) => {
            setAddSubjectType(mode);
            if (mode === "elective" && !addElectiveCode.trim()) {
              setAddElectiveCode(generateElectivePairId());
            }
          }}
          code={addElectiveCode}
          setCode={(value) => {
            setAddElectiveCode(value);
            setAddElectiveCodeCopied(false);
          }}
          copied={addElectiveCodeCopied}
          onCopy={() =>
            void copyText(addElectiveCode, setAddElectiveCodeCopied)
          }
          onGenerate={() => {
            setAddElectiveCode(generateElectivePairId());
            setAddElectiveCodeCopied(false);
          }}
          saving={addSaving}
          onCancel={() => {
            setAddModalOpen(false);
            setAddSubjectId("");
            setAddSubjectType("compulsory");
            setAddElectiveCode("");
            setAddElectiveCodeCopied(false);
          }}
          onSave={handleAddSubject}
        />
      )}
    </div>
  );
};

const SubjectConfigModal: React.FC<{
  title: string;
  mode: SubjectEnrollmentMode;
  setMode: (mode: SubjectEnrollmentMode) => void;
  code: string;
  setCode: (value: string) => void;
  copied: boolean;
  onCopy: () => void;
  onGenerate: () => void;
  onCancel: () => void;
  onSave: () => void;
}> = ({
  title,
  mode,
  setMode,
  code,
  setCode,
  copied,
  onCopy,
  onGenerate,
  onCancel,
  onSave,
}) => (
  <ModalShell>
    <h3 style={modalTitleStyle}>{title}</h3>
    <label style={modalLabelStyle}>Enrollment Mode</label>
    <select
      value={mode}
      onChange={(event) => {
        const nextMode = event.target.value as SubjectEnrollmentMode;
        setMode(nextMode);
        if (nextMode === "elective" && !code.trim()) onGenerate();
      }}
      style={modalInputStyle}
    >
      <option value="compulsory">Compulsory</option>
      <option value="elective">Elective</option>
    </select>
    {mode === "elective" && (
      <ElectiveCodeField
        code={code}
        setCode={setCode}
        copied={copied}
        onCopy={onCopy}
        onGenerate={onGenerate}
      />
    )}
    <ModalActions onCancel={onCancel} onSave={onSave} saveLabel="Save" />
  </ModalShell>
);

const AddSubjectModal: React.FC<{
  subjects: any[];
  selectedSubjectId: string;
  setSelectedSubjectId: (value: string) => void;
  mode: SubjectEnrollmentMode;
  setMode: (value: SubjectEnrollmentMode) => void;
  code: string;
  setCode: (value: string) => void;
  copied: boolean;
  onCopy: () => void;
  onGenerate: () => void;
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
}> = ({
  subjects,
  selectedSubjectId,
  setSelectedSubjectId,
  mode,
  setMode,
  code,
  setCode,
  copied,
  onCopy,
  onGenerate,
  saving,
  onCancel,
  onSave,
}) => (
  <ModalShell>
    <h3 style={modalTitleStyle}>Add Subject to Class</h3>
    <label style={modalLabelStyle}>Select Subject</label>
    <select
      value={selectedSubjectId}
      onChange={(event) => setSelectedSubjectId(event.target.value)}
      style={modalInputStyle}
    >
      <option value="">- choose subject -</option>
      {subjects.map((subject) => (
        <option key={getSubjectId(subject)} value={getSubjectId(subject)}>
          {subject.name || subject.subjectName}
        </option>
      ))}
    </select>
    {subjects.length === 0 && (
      <p style={secondaryTextStyle}>
        All school subjects are already registered for this class.
      </p>
    )}
    <label style={{ ...modalLabelStyle, marginTop: 14 }}>Subject Type</label>
    <select
      value={mode}
      onChange={(event) => setMode(event.target.value as SubjectEnrollmentMode)}
      style={modalInputStyle}
    >
      <option value="compulsory">Compulsory</option>
      <option value="elective">Elective</option>
    </select>
    {mode === "elective" && (
      <ElectiveCodeField
        code={code}
        setCode={setCode}
        copied={copied}
        onCopy={onCopy}
        onGenerate={onGenerate}
      />
    )}
    <ModalActions
      onCancel={onCancel}
      onSave={onSave}
      saveLabel={saving ? "Adding..." : "Add Subject"}
      saveDisabled={saving || !selectedSubjectId}
    />
  </ModalShell>
);

const ElectiveCodeField: React.FC<{
  code: string;
  setCode: (value: string) => void;
  copied: boolean;
  onCopy: () => void;
  onGenerate: () => void;
}> = ({ code, setCode, copied, onCopy, onGenerate }) => (
  <div style={{ marginTop: 14 }}>
    <label style={modalLabelStyle}>Elective Slot Code</label>
    <input
      type="text"
      value={code}
      onChange={(event) => setCode(event.target.value)}
      placeholder="Generated automatically for linked electives"
      style={modalInputStyle}
    />
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
      <button type="button" onClick={onGenerate} style={modalGhostButtonStyle}>
        Generate
      </button>
      <button
        type="button"
        onClick={onCopy}
        disabled={!code.trim()}
        style={{
          ...modalGhostButtonStyle,
          cursor: code.trim() ? "pointer" : "default",
          opacity: code.trim() ? 1 : 0.55,
        }}
      >
        {copied ? "Copied" : "Copy ID"}
      </button>
    </div>
  </div>
);

const ModalShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={modalBackdropStyle}>
    <div style={modalCardStyle}>{children}</div>
  </div>
);

const ModalActions: React.FC<{
  onCancel: () => void;
  onSave: () => void;
  saveLabel: string;
  saveDisabled?: boolean;
}> = ({ onCancel, onSave, saveLabel, saveDisabled = false }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "flex-end",
      gap: 12,
      marginTop: 20,
    }}
  >
    <button type="button" onClick={onCancel} style={modalCancelButtonStyle}>
      Cancel
    </button>
    <button
      type="button"
      onClick={onSave}
      disabled={saveDisabled}
      style={{
        ...modalSaveButtonStyle,
        opacity: saveDisabled ? 0.65 : 1,
        cursor: saveDisabled ? "not-allowed" : "pointer",
      }}
    >
      {saveLabel}
    </button>
  </div>
);

const FeedbackMessage: React.FC<{
  feedback: { text: string; type: "success" | "error" };
}> = ({ feedback }) => (
  <section
    style={{
      padding: "12px 14px",
      borderRadius: 12,
      border: `1px solid ${feedback.type === "success" ? C.green : "#e8b1b1"}`,
      background: feedback.type === "success" ? C.successBg : C.dangerBg,
      color: feedback.type === "success" ? C.successText : C.dangerText,
      fontFamily: FONT.sans,
      fontSize: 13,
      fontWeight: 600,
    }}
  >
    {feedback.text}
  </section>
);

const PanelHeader: React.FC<{ title: string }> = ({ title }) => (
  <div
    style={{
      padding: "14px 18px",
      borderBottom: `1px solid ${C.border}`,
      background: C.goldPale,
    }}
  >
    <p style={eyebrowMutedStyle}>Assignment dashboard</p>
    <h3 style={panelTitleStyle}>{title}</h3>
  </div>
);

const PanelTitle: React.FC<{ title: string }> = ({ title }) => (
  <div>
    <p style={eyebrowMutedStyle}>Class subjects</p>
    <h3 style={panelTitleStyle}>{title}</h3>
  </div>
);

const MetricCard: React.FC<{
  label: string;
  value: number;
  note: string;
}> = ({ label, value, note }) => (
  <div style={metricCardStyle}>
    <p style={eyebrowMutedStyle}>{label}</p>
    <p style={metricValueStyle}>{value}</p>
    <p style={secondaryTextStyle}>{note}</p>
  </div>
);

const heroStyle: React.CSSProperties = {
  background: C.white,
  border: `1px solid ${C.border}`,
  borderRadius: 14,
  padding: "18px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
};

const eyebrowStyle: React.CSSProperties = {
  fontFamily: FONT.sans,
  fontSize: 10.5,
  fontWeight: 700,
  color: C.gold,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  margin: "0 0 4px",
};

const eyebrowMutedStyle: React.CSSProperties = {
  fontFamily: FONT.sans,
  fontSize: 10.5,
  fontWeight: 700,
  color: C.textFaint,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  margin: "0 0 3px",
};

const titleStyle: React.CSSProperties = {
  fontFamily: FONT.serif,
  fontSize: "1.55rem",
  fontWeight: 600,
  color: C.text,
  margin: "0 0 6px",
};

const subtitleStyle: React.CSSProperties = {
  fontFamily: FONT.sans,
  fontSize: 13,
  color: C.textMuted,
  margin: 0,
  maxWidth: 620,
};

const outlineButtonStyle: React.CSSProperties = {
  padding: "9px 16px",
  borderRadius: 10,
  border: `1.5px dashed ${C.gold}`,
  background: C.goldPale,
  color: C.gold,
  fontFamily: FONT.sans,
  fontSize: 12.5,
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 10,
  border: "none",
  background: C.green,
  color: C.white,
  fontFamily: FONT.sans,
  fontSize: 12.5,
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const metricGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
};

const metricCardStyle: React.CSSProperties = {
  background: C.white,
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  padding: "14px 16px",
};

const metricValueStyle: React.CSSProperties = {
  fontFamily: FONT.serif,
  fontSize: "1.75rem",
  fontWeight: 600,
  color: C.text,
  margin: "0 0 3px",
};

const panelStyle: React.CSSProperties = {
  background: C.white,
  border: `1px solid ${C.border}`,
  borderRadius: 14,
  overflow: "hidden",
};

const panelTitleStyle: React.CSSProperties = {
  fontFamily: FONT.serif,
  fontSize: "1.25rem",
  fontWeight: 600,
  color: C.text,
  margin: 0,
};

const headingStyle: React.CSSProperties = {
  padding: "11px 16px",
  textAlign: "left",
  fontFamily: FONT.sans,
  fontSize: 10.5,
  fontWeight: 700,
  color: C.textFaint,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const cellStyle: React.CSSProperties = {
  padding: "14px 16px",
  fontFamily: FONT.sans,
  fontSize: 13,
  color: C.textMid,
};

const primaryTextStyle: React.CSSProperties = {
  fontFamily: FONT.sans,
  fontSize: 13,
  fontWeight: 700,
  color: C.text,
  margin: 0,
};

const secondaryTextStyle: React.CSSProperties = {
  fontFamily: FONT.sans,
  fontSize: 11,
  color: C.textMuted,
  margin: 0,
};

const teacherBadgeStyle = (subject: any): React.CSSProperties => ({
  display: "inline-flex",
  padding: "5px 12px",
  borderRadius: 20,
  background: subject.isClassTeacher
    ? C.successBg
    : subject.assignedTeacher === "Not assigned"
      ? C.dangerBg
      : C.goldPale,
  color: subject.isClassTeacher
    ? C.successText
    : subject.assignedTeacher === "Not assigned"
      ? C.dangerText
      : C.textMid,
  fontFamily: FONT.sans,
  fontSize: 12,
  fontWeight: 700,
});

const smallGreenButtonStyle: React.CSSProperties = {
  padding: "7px 12px",
  borderRadius: 999,
  border: `1px solid ${C.green}`,
  background: C.successBg,
  color: C.green,
  fontFamily: FONT.sans,
  fontSize: 11.5,
  fontWeight: 700,
  cursor: "pointer",
};

const smallGoldButtonStyle: React.CSSProperties = {
  padding: "7px 12px",
  borderRadius: 999,
  border: `1px solid ${C.gold}`,
  background: C.goldPale,
  color: C.gold,
  fontFamily: FONT.sans,
  fontSize: 11.5,
  fontWeight: 700,
  cursor: "pointer",
};

const emptyCellStyle: React.CSSProperties = {
  padding: "18px 16px",
  textAlign: "center",
  fontFamily: FONT.sans,
  fontSize: 13,
  color: C.textMuted,
};

const droppedRowStyle: React.CSSProperties = {
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  padding: "12px 14px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  background: C.cream,
};

const modalBackdropStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: 16,
};

const modalCardStyle: React.CSSProperties = {
  background: C.white,
  padding: 24,
  borderRadius: 16,
  width: 440,
  maxWidth: "100%",
};

const modalTitleStyle: React.CSSProperties = {
  fontFamily: FONT.serif,
  fontSize: 20,
  margin: "0 0 16px",
  color: C.text,
};

const modalLabelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 8,
  fontFamily: FONT.sans,
  fontSize: 13,
  fontWeight: 600,
  color: C.text,
};

const modalInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  border: `1px solid ${C.border}`,
  boxSizing: "border-box",
  background: C.cream,
  color: C.text,
};

const modalGhostButtonStyle: React.CSSProperties = {
  padding: "7px 12px",
  borderRadius: 8,
  border: `1px solid ${C.border}`,
  background: C.cream,
  cursor: "pointer",
};

const modalCancelButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 8,
  border: `1px solid ${C.border}`,
  background: C.white,
  cursor: "pointer",
};

const modalSaveButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 8,
  border: "none",
  background: C.green,
  color: C.white,
  fontWeight: 600,
};
