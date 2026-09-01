import React, { useEffect, useRef, useState } from "react";
import styles from "./AdminDashboard.module.css";
import { getSchoolId, request } from "../../lib/api";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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
    schoolCode: "",
  });
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [saving, setSaving] = useState(false);
  const [schoolCodeCopied, setSchoolCodeCopied] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const copySchoolCode = async () => {
    if (!form.schoolCode.trim()) return;

    try {
      await navigator.clipboard.writeText(form.schoolCode.trim());
      setSchoolCodeCopied(true);
      setTimeout(() => setSchoolCodeCopied(false), 2000);
    } catch {
      setMessage({
        text: "Failed to copy school code.",
        type: "error",
      });
    }
  };
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
      update("schoolCode", data?.schoolCode);
      if (data?.visibility) setVisibility(data.visibility);
      if (data?.latitude && data?.longitude) {
        setLatitude(Number(data.latitude));
        setLongitude(Number(data.longitude));
      }
    })();
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!leafletMap.current) {
      leafletMap.current = L.map(mapRef.current).setView(
        latitude && longitude ? [latitude, longitude] : [-1.2921, 36.8219],
        13,
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(leafletMap.current);
      leafletMap.current.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setLatitude(lat);
        setLongitude(lng);
      });
    } else {
      const center = latitude && longitude ? [latitude, longitude] : [-1.2921, 36.8219];
      leafletMap.current.setView(center, 13);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (!leafletMap.current) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([latitude || -1.2921, longitude || 36.8219]);
    } else if (latitude && longitude) {
      markerRef.current = L.marker([latitude, longitude]).addTo(leafletMap.current);
    }
  }, [latitude, longitude]);
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
        body: JSON.stringify({ ...form, visibility, latitude, longitude, schoolId }),
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
        <label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span style={labelStyle}>School Code</span>
            <button
              type="button"
              onClick={copySchoolCode}
              disabled={!form.schoolCode.trim()}
              style={{
                border: "1px solid var(--border)",
                background: "var(--cream)",
                color: "var(--text)",
                borderRadius: 8,
                padding: "6px 10px",
                fontSize: 11,
                fontWeight: 800,
                cursor: form.schoolCode.trim() ? "pointer" : "not-allowed",
                opacity: form.schoolCode.trim() ? 1 : 0.6,
              }}
            >
              {schoolCodeCopied ? "Copied" : "Copy"}
            </button>
          </div>
          <input
            value={form.schoolCode}
            style={inputStyle}
            disabled
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

        <label style={{ gridColumn: "1 / -1" }}>
          <span style={labelStyle}>Location</span>
          <div
            ref={mapRef}
            style={{
              height: 260,
              borderRadius: 12,
              border: "1.5px solid var(--border)",
              overflow: "hidden",
            }}
          />
          <p style={{ fontSize: 12, color: "var(--textMut)", marginTop: 6 }}>
            Click the map to set the exact school location.
            {latitude && longitude
              ? ` Selected: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
              : " No location selected yet."}
          </p>
        </label>

        <label style={{ gridColumn: "1 / -1" }}>
          <span style={labelStyle}>School visibility</span>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <button
              type="button"
              onClick={() => setVisibility("PRIVATE")}
              style={{
                padding: "10px 18px",
                border: "1.5px solid var(--border)",
                background:
                  visibility === "PRIVATE" ? "var(--cream)" : "var(--white)",
                color: "var(--text)",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                outline:
                  visibility === "PRIVATE"
                    ? "2px solid var(--gold)"
                    : "none",
              }}
            >
              Private
            </button>
            <button
              type="button"
              onClick={() => setVisibility("PUBLIC")}
              style={{
                padding: "10px 18px",
                border: "1.5px solid var(--border)",
                background:
                  visibility === "PUBLIC" ? "var(--cream)" : "var(--white)",
                color: "var(--text)",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                outline:
                  visibility === "PUBLIC" ? "2px solid var(--gold)" : "none",
              }}
            >
              Public
            </button>
            <span style={{ fontSize: 12, color: "var(--textMut)" }}>
              {visibility === "PUBLIC"
                ? "Public — outsiders can see this school on the public listing."
                : "Private — only your school team can see this school."}
            </span>
          </div>
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
