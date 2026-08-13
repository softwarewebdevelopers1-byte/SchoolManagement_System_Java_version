import React, { useEffect, useState } from "react";
import styles from "./AdminDashboard.module.css";
import { getSchoolId, request } from "../../lib/api";

interface SchoolSettingsTabProps {
  onSaved?: () => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid var(--border)",
  borderRadius: 8,
  fontSize: 13.5,
  color: "var(--text)",
  background: "var(--cream)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 800,
  color: "var(--textMut)",
  textTransform: "uppercase",
  letterSpacing: ".05em",
  marginBottom: 6,
};

export const SchoolSettingsTab: React.FC<SchoolSettingsTabProps> = ({
  onSaved,
}) => {
  const [form, setForm] = useState({
    schoolName: "",
    schoolEmail: "",
    motto: "",
    schoolAddress: "",
    phoneNumber: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  useEffect(() => {
    (async () => {
      const data: any = await request(
        `/schools/settings?schoolId=${encodeURIComponent(getSchoolId() || "")}`,
      );
      update("schoolName", data?.schoolName);
      update("schoolEmail", data?.schoolEmail);
      update("motto", data?.motto);
      update("schoolAddress", data?.schoolAddress);
      update("phoneNumber", data?.phoneNumber);
    })();
  }, []);
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const schoolId = getSchoolId();
    if (!schoolId) {
      setMessage({
        text: "No school is linked to this account.",
        type: "error",
      });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      await request(`/schools/update/school`, {
        method: "PATCH",
        body: JSON.stringify({ ...form, schoolId }),
      });
      setMessage({ text: "School settings updated.", type: "success" });
      onSaved?.();
    } catch (error) {
      setMessage({
        text:
          error instanceof Error
            ? error.message
            : "Failed to update school settings.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.anim} style={{ display: "grid", gap: 16 }}>
      <div>
        <p
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: "var(--gold)",
            textTransform: "uppercase",
            letterSpacing: ".09em",
            margin: "0 0 3px",
          }}
        >
          School Settings
        </p>
        <h2
          style={{
            margin: 0,
            fontFamily: "var(--serif)",
            fontSize: "1.8rem",
            color: "var(--text)",
          }}
        >
          School profile
        </h2>
      </div>

      {message && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background:
              message.type === "success" ? "var(--sBg)" : "var(--dBg)",
            color: message.type === "success" ? "var(--sText)" : "var(--dText)",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {message.text}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          background: "var(--white)",
          border: "1px solid var(--border)",
          borderRadius: 13,
          padding: "1.2rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          maxWidth: 860,
        }}
      >
        <label>
          <span style={labelStyle}>School Name</span>
          <input
            value={form.schoolName}
            onChange={(event) => update("schoolName", event.target.value)}
            style={inputStyle}
          />
        </label>
        <label>
          <span style={labelStyle}>Email</span>
          <input
            type="email"
            value={form.schoolEmail}
            onChange={(event) => update("schoolEmail", event.target.value)}
            style={inputStyle}
          />
        </label>
        <label>
          <span style={labelStyle}>Phone Number</span>
          <input
            value={form.phoneNumber}
            onChange={(event) => update("phoneNumber", event.target.value)}
            style={inputStyle}
          />
        </label>
        <label>
          <span style={labelStyle}>Motto</span>
          <input
            value={form.motto}
            onChange={(event) => update("motto", event.target.value)}
            style={inputStyle}
          />
        </label>
        <label style={{ gridColumn: "1 / -1" }}>
          <span style={labelStyle}>Address</span>
          <textarea
            value={form.schoolAddress}
            onChange={(event) => update("schoolAddress", event.target.value)}
            style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          style={{
            width: "fit-content",
            padding: "10px 18px",
            border: "none",
            borderRadius: 9,
            background: "var(--gold)",
            color: "#fff",
            fontWeight: 800,
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.65 : 1,
          }}
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
};
