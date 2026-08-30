import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin, Users, GraduationCap, CheckCircle2, XCircle, Clock } from "lucide-react";
import { superAdminApi } from "../../lib/api";

export default function SuperAdminSchoolDetail() {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();
  const [school, setSchool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadSchoolDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!schoolId) throw new Error("School ID not provided");
        const response = await superAdminApi.getSchoolById(schoolId);
        setSchool(response || null);
      } catch (err: any) {
        setError(err.message || "Failed to load school details");
      } finally {
        setLoading(false);
      }
    };

    void loadSchoolDetails();
  }, [schoolId]);

  const updateStatus = async (newStatus: string) => {
    try {
      setUpdating(true);
      if (!schoolId) throw new Error("School ID not provided");
      await superAdminApi.updateSchoolStatus(schoolId, newStatus);
      // Reload the school data
      const response = await superAdminApi.getSchoolById(schoolId);
      setSchool(response || null);
    } catch (err: any) {
      setError(err.message || "Failed to update school status");
    } finally {
      setUpdating(false);
    }
  };

  const formatStatus = (status?: string) => {
    if (!status) return "PENDING";
    const normalized = String(status).trim().toUpperCase();
    if (normalized === "PENDING_APPROVAL") return "PENDING";
    if (normalized === "REJECTED_APPROVAL") return "REJECTED";
    if (normalized === "INACTIVE") return "SUSPENDED";
    if (normalized === "NOT_PAID") return "EXPIRED";
    return normalized;
  };

  const statusColors: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
    ACTIVE: { bg: "#d1fae5", color: "#065f46", icon: <CheckCircle2 size={16} /> },
    PENDING: { bg: "#fef3c7", color: "#92400e", icon: <Clock size={16} /> },
    REJECTED: { bg: "#fee2e2", color: "#991b1b", icon: <XCircle size={16} /> },
    SUSPENDED: { bg: "#fed7aa", color: "#92400e", icon: <Clock size={16} /> },
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>Loading school details...</div>
      </div>
    );
  }

  if (!school) {
    return (
      <div style={styles.page}>
        <button onClick={() => navigate("/edunex-org/superAdmin/schools")} style={styles.backButton}>
          <ArrowLeft size={16} /> Back to Schools
        </button>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📚</div>
          <div style={styles.emptyText}>School not found</div>
        </div>
      </div>
    );
  }

  const status = formatStatus(school.status);
  const statusStyle = statusColors[status] || statusColors.PENDING;

  return (
    <div style={styles.page}>
      <button onClick={() => navigate("/edunex-org/superAdmin/schools")} style={styles.backButton}>
        <ArrowLeft size={16} /> Back to Schools
      </button>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{school.schoolName}</h1>
          <div style={styles.code}>{school.schoolCode}</div>
        </div>
        <div style={{ ...styles.statusBadge, background: statusStyle.bg, color: statusStyle.color }}>
          {statusStyle.icon}
          <span>{status}</span>
        </div>
      </div>

      <div style={styles.twoColGrid}>
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>School Information</h2>

          <div style={styles.infoRow}>
            <div style={styles.infoLabel}>School Name</div>
            <div style={styles.infoValue}>{school.schoolName}</div>
          </div>

          <div style={styles.infoRow}>
            <div style={styles.infoLabel}>School Code</div>
            <div style={styles.infoValue}>{school.schoolCode}</div>
          </div>

          <div style={styles.infoRow}>
            <Mail size={16} />
            <div>
              <div style={styles.infoLabel}>Email</div>
              <div style={styles.infoValue}>{school.email}</div>
            </div>
          </div>

          <div style={styles.infoRow}>
            <Phone size={16} />
            <div>
              <div style={styles.infoLabel}>Phone</div>
              <div style={styles.infoValue}>{school.phoneNumber || "N/A"}</div>
            </div>
          </div>

          <div style={styles.infoRow}>
            <MapPin size={16} />
            <div>
              <div style={styles.infoLabel}>Address</div>
              <div style={styles.infoValue}>{school.address || "No address provided"}</div>
            </div>
          </div>

          <div style={styles.infoRow}>
            <div style={styles.infoLabel}>Registration Date</div>
            <div style={styles.infoValue}>
              {school.registeredDate
                ? new Date(school.registeredDate).toLocaleDateString()
                : "N/A"}
            </div>
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>School Admin</h2>

          <div style={styles.adminBox}>
            <div style={styles.adminAvatar}>{(school.adminName || "A").slice(0, 1).toUpperCase()}</div>
            <div>
              <div style={styles.adminName}>{school.adminName}</div>
              <div style={styles.adminEmail}>{school.email}</div>
            </div>
          </div>

          <div style={styles.divider} />

          <div style={styles.statsGrid}>
            <div style={styles.stat}>
              <Users size={18} />
              <div>
                <div style={styles.statValue}>{school.totalStaff}</div>
                <div style={styles.statLabel}>Total Staff</div>
              </div>
            </div>
            <div style={styles.stat}>
              <CheckCircle2 size={18} />
              <div>
                <div style={styles.statValue}>{school.activeStaff}</div>
                <div style={styles.statLabel}>Active</div>
              </div>
            </div>
            <div style={styles.stat}>
              <Clock size={18} />
              <div>
                <div style={styles.statValue}>{school.pendingStaff}</div>
                <div style={styles.statLabel}>Pending</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div style={styles.twoColGrid}>
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Statistics</h2>

          <div style={styles.statRow}>
            <div style={styles.statRowLabel}>Total Users</div>
            <div style={styles.statRowValue}>{school.totalStaff + (school.totalStudents || 0)}</div>
          </div>

          <div style={styles.statRow}>
            <div style={styles.statRowLabel}>Active Staff</div>
            <div style={styles.statRowValue}>{school.activeStaff}</div>
          </div>

          <div style={styles.statRow}>
            <div style={styles.statRowLabel}>Pending Staff</div>
            <div style={styles.statRowValue}>{school.pendingStaff}</div>
          </div>

          <div style={styles.statRow}>
            <div style={styles.statRowLabel}>Suspended Staff</div>
            <div style={styles.statRowValue}>{school.suspendedStaff}</div>
          </div>

          <div style={styles.statRow}>
            <div style={styles.statRowLabel}>Total Students</div>
            <div style={styles.statRowValue}>{school.totalStudents || 0}</div>
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Actions</h2>

          <div style={styles.actionStack}>
            {status !== "ACTIVE" && (
              <button
                onClick={() => updateStatus("ACTIVE")}
                disabled={updating}
                style={{ ...styles.actionBtn, ...styles.actionBtnSuccess }}
              >
                {updating ? "..." : "✓ Approve School"}
              </button>
            )}

            {status !== "REJECTED" && (
              <button
                onClick={() => updateStatus("REJECTED_APPROVAL")}
                disabled={updating}
                style={{ ...styles.actionBtn, ...styles.actionBtnDanger }}
              >
                {updating ? "..." : "✕ Reject School"}
              </button>
            )}

            {status === "ACTIVE" && (
              <button
                onClick={() => updateStatus("INACTIVE")}
                disabled={updating}
                style={{ ...styles.actionBtn, ...styles.actionBtnWarning }}
              >
                {updating ? "..." : "⏸ Suspend School"}
              </button>
            )}

            <button
              onClick={() => navigate("/edunex-org/superAdmin/staff")}
              style={{ ...styles.actionBtn, ...styles.actionBtnSecondary }}
            >
              View All Staff
            </button>

            <button
              onClick={() => navigate("/edunex-org/superAdmin/invitations")}
              style={{ ...styles.actionBtn, ...styles.actionBtnSecondary }}
            >
              View Invitations
            </button>
          </div>
        </section>
      </div>

      {school.staffMembers && school.staffMembers.length > 0 && (
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Recent Staff</h2>
          <div style={styles.staffList}>
            {school.staffMembers.slice(0, 5).map((staff: any) => (
              <div key={staff.userId} style={styles.staffItem}>
                <div style={styles.staffAvatar}>{(staff.email || "U").slice(0, 1).toUpperCase()}</div>
                <div>
                  <div style={styles.staffName}>{staff.email}</div>
                  <div style={styles.staffRole}>{staff.roles?.join(", ") || "N/A"}</div>
                </div>
                <span style={{ ...styles.staffStatus, background: statusColors[formatStatus(staff.status)].bg, color: statusColors[formatStatus(staff.status)].color }}>
                  {formatStatus(staff.status)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "grid",
    gap: 24,
  },
  backButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    border: "1px solid rgba(15,46,34,0.12)",
    borderRadius: 10,
    background: "#fff",
    color: "#0f2e22",
    fontWeight: 700,
    cursor: "pointer",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 20,
  },
  title: {
    margin: 0,
    fontSize: 32,
    letterSpacing: -0.05,
    color: "#0f2e22",
  },
  code: {
    fontSize: 13,
    color: "#5d6d66",
    fontFamily: "monospace",
    marginTop: 4,
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 14,
  },
  twoColGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },
  card: {
    background: "rgba(255,255,255,0.8)",
    border: "1px solid rgba(15,46,34,0.08)",
    borderRadius: 20,
    padding: 24,
  },
  cardTitle: {
    margin: "0 0 20px 0",
    fontSize: 18,
    fontWeight: 700,
    color: "#0f2e22",
    paddingBottom: 16,
    borderBottom: "1px solid rgba(15,46,34,0.04)",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    padding: "12px 0",
  },
  infoLabel: {
    fontSize: 12,
    color: "#5d6d66",
    textTransform: "uppercase",
    letterSpacing: 0.08,
    minWidth: 120,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 600,
    color: "#0f2e22",
  },
  adminBox: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 12,
    background: "rgba(22,51,37,0.02)",
    borderRadius: 12,
    marginBottom: 16,
  },
  adminAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    background: "#c9963d",
    color: "#fff",
    fontWeight: 800,
    flexShrink: 0,
  },
  adminName: {
    fontWeight: 700,
    color: "#0f2e22",
  },
  adminEmail: {
    fontSize: 12,
    color: "#5d6d66",
    marginTop: 2,
  },
  divider: {
    height: 1,
    background: "rgba(15,46,34,0.04)",
    margin: "16px 0",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 12,
  },
  stat: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: 12,
    background: "rgba(22,51,37,0.02)",
    borderRadius: 10,
    color: "#163325",
  },
  statValue: {
    fontSize: 20,
    fontWeight: 800,
    color: "#0f2e22",
  },
  statLabel: {
    fontSize: 11,
    color: "#5d6d66",
    marginTop: 4,
  },
  statRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid rgba(15,46,34,0.04)",
  },
  statRowLabel: {
    fontSize: 14,
    color: "#0f2e22",
    fontWeight: 600,
  },
  statRowValue: {
    fontSize: 18,
    fontWeight: 800,
    color: "#163325",
  },
  actionStack: {
    display: "grid",
    gap: 10,
  },
  actionBtn: {
    padding: "12px 16px",
    border: "none",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: 14,
  },
  actionBtnSuccess: {
    background: "#16a34a",
    color: "#fff",
  },
  actionBtnDanger: {
    background: "#ef4444",
    color: "#fff",
  },
  actionBtnWarning: {
    background: "#f59e0b",
    color: "#fff",
  },
  actionBtnSecondary: {
    background: "rgba(15,46,34,0.04)",
    color: "#0f2e22",
    border: "1px solid rgba(15,46,34,0.12)",
  },
  staffList: {
    display: "grid",
    gap: 10,
  },
  staffItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 12,
    background: "rgba(22,51,37,0.02)",
    borderRadius: 10,
    border: "1px solid rgba(15,46,34,0.04)",
  },
  staffAvatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    display: "grid",
    placeItems: "center",
    background: "#ebf4ff",
    color: "#153f2f",
    fontWeight: 800,
    fontSize: 12,
    flexShrink: 0,
  },
  staffName: {
    fontWeight: 700,
    color: "#0f2e22",
    fontSize: 13,
  },
  staffRole: {
    fontSize: 11,
    color: "#5d6d66",
    marginTop: 2,
  },
  staffStatus: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
    padding: "4px 8px",
    borderRadius: 6,
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  error: {
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: 12,
    padding: "12px 14px",
    fontWeight: 600,
  },
  emptyState: {
    padding: 60,
    textAlign: "center",
    color: "#5d6d66",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 700,
    color: "#0f2e22",
  },
  loadingCard: {
    maxWidth: 500,
    margin: "40vh auto 0",
    background: "#fff",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 16px 40px rgba(16,36,28,0.08)",
    textAlign: "center",
    color: "#0f2e22",
    fontWeight: 700,
  },
};
