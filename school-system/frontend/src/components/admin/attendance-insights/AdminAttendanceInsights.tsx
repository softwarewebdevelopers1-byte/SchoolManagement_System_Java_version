import React, { useEffect, useState } from "react";
import { api, getSchoolId } from "../../../lib/api";
import { DailyAttendanceView } from "./DailyAttendanceView";
import { MonthlyAttendanceView } from "./MonthlyAttendanceView";

type TabId = "daily" | "monthly";

const TAB_META: Record<TabId, { label: string; description: string }> = {
  daily: { label: "Daily Register", description: "Inspect class attendance for a specific date." },
  monthly: { label: "Monthly Summary", description: "Aggregated attendance stats per student for a date range." },
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  background: "var(--sand)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  color: "var(--textM)",
  cursor: "pointer",
};

const activeTabStyle: React.CSSProperties = {
  padding: "8px 16px",
  background: "var(--gold)",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

export const AdminAttendanceInsights: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("daily");
  const [classes, setClasses] = useState<{ classId: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const schoolId = getSchoolId();

  useEffect(() => {
    (async () => {
      if (!schoolId) return;
      try {
        setLoading(true);
        setError("");
        const response = await api.get<{ classId: string; className: string }[]>("/all/classes/" + encodeURIComponent(schoolId));
        const mapped = (response || []).map((item: any) => {
          const grade = String(item.grade || item.classGrade || "").trim();
          const stream = String(item.stream || item.classStream || "").trim();
          return {
            classId: String(item.classId || item.id || ""),
            name: `Grade ${grade}${stream ? ` ${stream}` : ""}`,
          };
        }).filter((item: any) => item.classId);
        setClasses(mapped);
      } catch (err: any) {
        setError(err?.message || "Failed to load classes.");
      } finally {
        setLoading(false);
      }
    })();
  }, [schoolId]);

  const renderTabContent = () => {
    if (loading) {
      return (
        <div style={{ padding: 24, color: "var(--textMut)" }}>Loading insights...</div>
      );
    }

    if (error) {
      return (
        <div style={{ padding: 24, color: "var(--dText)", background: "var(--dBg)", borderRadius: 8 }}>
          {error}
        </div>
      );
    }

    if (classes.length === 0) {
      return (
        <div style={{ padding: 24, color: "var(--textMut)" }}>No classes found for this school.</div>
      );
    }

    switch (activeTab) {
      case "daily":
        return <DailyAttendanceView classes={classes} />;
      case "monthly":
        return <MonthlyAttendanceView classes={classes} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontFamily: "var(--serif, Georgia, serif)", fontSize: "1.8rem", color: "var(--text)" }}>
          Attendance Insights
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--textMut)" }}>
          Attendance and performance analytics for administrators.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(Object.keys(TAB_META) as TabId[]).map((tabId) => (
          <button
            key={tabId}
            style={activeTab === tabId ? activeTabStyle : secondaryButtonStyle}
            onClick={() => setActiveTab(tabId)}
          >
            {TAB_META[tabId].label}
          </button>
        ))}
      </div>

      <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 13, padding: 16 }}>
        {renderTabContent()}
      </div>
    </div>
  );
};
