import React, { useEffect, useState } from "react";
import styles from "./AdminDashboard.module.css";
import { getSchoolId, request } from "../../lib/api";

interface PendingInvite {
  usersId?: string;
  id?: string;
  email: string;
  status?: string;
}

export const UserApprovalsTab: React.FC<{ onUpdated?: () => void }> = ({
  onUpdated,
}) => {
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const loadInvites = async () => {
    const schoolId = getSchoolId();
    if (!schoolId) return;
    setLoading(true);
    try {
      const response = await request<any>(`/users/get/invites/${encodeURIComponent(schoolId)}`);
      setInvites(response?.data || response || []);
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : "Unable to load pending users.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInvites();
  }, []);

  const updateInvite = async (invite: PendingInvite, status: "ACTIVE" | "REJECTED_INVITE") => {
    const teacherId = invite.usersId || invite.id;
    if (!teacherId) return;
    setMessage(null);
    try {
      await request("/users/update", {
        method: "PATCH",
        body: JSON.stringify({
          teacherId,
          email: invite.email,
          status,
          roles: status === "ACTIVE" ? ["SUBJECTTEACHER"] : undefined,
        }),
      });
      setMessage({
        text: status === "ACTIVE" ? "User accepted." : "User rejected.",
        type: "success",
      });
      await loadInvites();
      onUpdated?.();
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : "Unable to update user.",
        type: "error",
      });
    }
  };

  return (
    <div className={styles.anim} style={{ display: "grid", gap: 16 }}>
      <div>
        <p style={{ fontSize: 10, fontWeight: 800, color: "var(--gold)", textTransform: "uppercase", letterSpacing: ".09em", margin: "0 0 3px" }}>
          User approvals
        </p>
        <h2 style={{ margin: 0, fontFamily: "var(--serif)", fontSize: "1.8rem", color: "var(--text)" }}>
          Pending teacher signups
        </h2>
      </div>

      {message && (
        <div style={{ padding: "10px 14px", borderRadius: 10, background: message.type === "success" ? "var(--sBg)" : "var(--dBg)", color: message.type === "success" ? "var(--sText)" : "var(--dText)", fontSize: 13, fontWeight: 700 }}>
          {message.text}
        </div>
      )}

      <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 13, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
          <thead>
            <tr style={{ background: "var(--sand)" }}>
              {["Email", "Status", "Actions"].map((heading) => (
                <th key={heading} style={{ padding: "10px 13px", textAlign: "left", fontSize: 11, color: "var(--textMut)", textTransform: "uppercase", letterSpacing: ".05em" }}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} style={{ padding: 28, textAlign: "center", color: "var(--textMut)" }}>Loading pending users...</td></tr>
            ) : invites.length === 0 ? (
              <tr><td colSpan={3} style={{ padding: 28, textAlign: "center", color: "var(--textMut)" }}>No pending teacher signups.</td></tr>
            ) : invites.map((invite) => (
              <tr key={invite.usersId || invite.id || invite.email} style={{ borderTop: "1px solid var(--borderL)" }}>
                <td style={{ padding: "11px 13px", color: "var(--text)", fontWeight: 700 }}>{invite.email}</td>
                <td style={{ padding: "11px 13px", color: "var(--textMut)" }}>{invite.status || "PENDING_APPROVAL"}</td>
                <td style={{ padding: "11px 13px" }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button onClick={() => updateInvite(invite, "ACTIVE")} style={{ border: "none", borderRadius: 8, padding: "8px 12px", background: "var(--sBg)", color: "var(--sText)", fontWeight: 800, cursor: "pointer" }}>Accept</button>
                    <button onClick={() => updateInvite(invite, "REJECTED_INVITE")} style={{ border: "none", borderRadius: 8, padding: "8px 12px", background: "var(--dBg)", color: "var(--dText)", fontWeight: 800, cursor: "pointer" }}>Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
