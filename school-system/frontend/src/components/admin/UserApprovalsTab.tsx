import React, { useEffect, useState } from "react";
import styles from "./AdminDashboard.module.css";
import { getSchoolId, request } from "../../lib/api";

const roleOptions = [
  { value: "SUBJECTTEACHER", label: "Subject Teacher" },
  { value: "CLASSTEACHER", label: "Class Teacher" },
  { value: "HEADTEACHER", label: "Head Teacher" },
  { value: "DEPUTYTEACHER", label: "Deputy Teacher" },
  { value: "ADMIN", label: "Admin" },
];

interface PendingInvite {
  userId?: string;
  email: string;
  status?: string;
}

export const UserApprovalsTab: React.FC<{ onUpdated?: () => void }> = ({
  onUpdated,
}) => {
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>(roleOptions[0].value);
  const [pendingAcceptId, setPendingAcceptId] = useState<string | null>(null);

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
    const userId = invite.userId;
    if (!userId) return;
    setMessage(null);
    try {
      const body: any = {
        teacherId: userId,
        email: invite.email,
        status,
      };
      if (status === "ACTIVE") {
        body.roles = [selectedRole];
      }
      await request("/users/update", {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setMessage({
        text: status === "ACTIVE" ? `User accepted as ${roleOptions.find(r => r.value === selectedRole)?.label || selectedRole}.` : "User rejected.",
        type: "success",
      });
      setPendingAcceptId(null);
      await loadInvites();
      onUpdated?.();
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : "Unable to update user.",
        type: "error",
      });
    }
  };

  const handleAcceptClick = (userId: string) => {
    setPendingAcceptId(userId);
    setMessage(null);
  };

  const handleCancelAccept = () => {
    setPendingAcceptId(null);
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
              {["Email", "Status", "Role", "Actions"].map((heading) => (
                <th key={heading} style={{ padding: "10px 13px", textAlign: "left", fontSize: 11, color: "var(--textMut)", textTransform: "uppercase", letterSpacing: ".05em" }}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: 28, textAlign: "center", color: "var(--textMut)" }}>Loading pending users...</td></tr>
            ) : invites.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 28, textAlign: "center", color: "var(--textMut)" }}>No pending teacher signups.</td></tr>
            ) : invites.map((invite) => (
              <tr key={invite.userId || invite.email} style={{ borderTop: "1px solid var(--borderL)" }}>
                <td style={{ padding: "11px 13px", color: "var(--text)", fontWeight: 700 }}>{invite.email}</td>
                <td style={{ padding: "11px 13px", color: "var(--textMut)" }}>{invite.status || "PENDING_APPROVAL"}</td>
                <td style={{ padding: "11px 13px" }}>
                  {pendingAcceptId === invite.userId ? (
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--cream)", fontSize: 12 }}
                    >
                      {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  ) : (
                    <span style={{ fontSize: 12, color: "var(--textMut)" }}>—</span>
                  )}
                </td>
                <td style={{ padding: "11px 13px" }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {pendingAcceptId === invite.userId ? (
                      <>
                        <button onClick={() => updateInvite(invite, "ACTIVE")} style={{ border: "none", borderRadius: 8, padding: "8px 12px", background: "var(--sBg)", color: "var(--sText)", fontWeight: 800, cursor: "pointer" }}>Confirm</button>
                        <button onClick={handleCancelAccept} style={{ border: "none", borderRadius: 8, padding: "8px 12px", background: "var(--dBg)", color: "var(--dText)", fontWeight: 800, cursor: "pointer" }}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleAcceptClick(invite.userId!)} style={{ border: "none", borderRadius: 8, padding: "8px 12px", background: "var(--sBg)", color: "var(--sText)", fontWeight: 800, cursor: "pointer" }}>Accept</button>
                        <button onClick={() => updateInvite(invite, "REJECTED_INVITE")} style={{ border: "none", borderRadius: 8, padding: "8px 12px", background: "var(--dBg)", color: "var(--dText)", fontWeight: 800, cursor: "pointer" }}>Reject</button>
                      </>
                    )}
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
