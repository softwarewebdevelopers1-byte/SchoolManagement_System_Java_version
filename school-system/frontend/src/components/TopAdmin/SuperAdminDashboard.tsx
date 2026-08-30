import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Building2,
  CheckCircle2,
  Copy,
  Filter,
  GraduationCap,
  LayoutDashboard,
  Mail,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { superAdminApi } from "../../lib/api";

const statusColors: Record<string, string> = {
  ACTIVE: "#16a34a",
  PENDING_APPROVAL: "#c084fc",
  PENDING: "#c084fc",
  REJECTED: "#ef4444",
  REJECTED_APPROVAL: "#ef4444",
  SUSPENDED: "#f59e0b",
  INACTIVE: "#f59e0b",
  EXPIRED: "#6b7280",
};

const formatStatus = (value?: string) => {
  if (!value) return "PENDING";
  const normalized = String(value).trim().toUpperCase();
  if (normalized === "PENDING_APPROVAL") return "PENDING";
  if (normalized === "REJECTED_APPROVAL") return "REJECTED";
  if (normalized === "INACTIVE") return "SUSPENDED";
  if (normalized === "NOT_PAID") return "EXPIRED";
  return normalized;
};

const getStatusBadgeStyle = (status: string) => ({
  background: `${statusColors[status] || "#64748b"}22`,
  color: statusColors[status] || "#64748b",
  borderColor: `${statusColors[status] || "#64748b"}55`,
});

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [schools, setSchools] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, schoolsRes, staffRes, invitesRes] = await Promise.all([
        superAdminApi.getPlatformStatistics(),
        superAdminApi.getSchools(),
        superAdminApi.getPlatformStaff(),
        superAdminApi.getInvitations(),
      ]);

      setStats(statsRes || null);
      setSchools(
        Array.isArray(schoolsRes) ? schoolsRes : schoolsRes?.data || [],
      );
      setStaff(Array.isArray(staffRes) ? staffRes : staffRes?.data || []);
      setInvites(
        Array.isArray(invitesRes) ? invitesRes : invitesRes?.data || [],
      );
    } catch (err: any) {
      setError(err.message || "Unable to load super admin dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const filteredSchools = useMemo(() => {
    return schools.filter((school) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (school.schoolName || "").toLowerCase().includes(q) ||
        (school.schoolCode || "").toLowerCase().includes(q) ||
        (school.email || "").toLowerCase().includes(q) ||
        (school.address || "").toLowerCase().includes(q);
      const status = formatStatus(school.status);
      const matchesStatus = statusFilter === "ALL" || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [schools, search, statusFilter]);

  const statCards = [
    {
      label: "Total Schools",
      value: stats?.totalSchools ?? 0,
      icon: Building2,
    },
    {
      label: "Active Schools",
      value: stats?.activeSchools ?? 0,
      icon: CheckCircle2,
    },
    {
      label: "Pending Schools",
      value: stats?.pendingSchools ?? 0,
      icon: Activity,
    },
    { label: "Total Staff", value: stats?.totalStaff ?? 0, icon: Users },
    {
      label: "Total Students",
      value: stats?.totalStudents ?? 0,
      icon: GraduationCap,
    },
    { label: "Recent Invitations", value: invites.length, icon: Mail },
  ];

  const copyLink = async (link?: string) => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      alert("Invite link copied to clipboard");
    } catch {
      alert("Copy failed. Try again.");
    }
  };

  const updateSchoolStatus = async (schoolId: string, status: string) => {
    try {
      await superAdminApi.updateSchoolStatus(schoolId, status);
      await loadDashboard();
    } catch (err: any) {
      setError(err.message || "Unable to update school status");
    }
  };

  const updateStaffStatus = async (userId: string, status: string) => {
    try {
      await superAdminApi.updateUserStatus(userId, status);
      await loadDashboard();
    } catch (err: any) {
      setError(err.message || "Unable to update staff status");
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>Loading platform dashboard...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <aside style={styles.sidebar}>
          <div style={styles.brand}>EduNex</div>
          <div style={styles.brandSub}>Super Admin</div>
          <nav style={styles.nav}>
            <div style={styles.navItem}>
              <LayoutDashboard size={16} /> Overview
            </div>
            <div style={styles.navItem}>
              <Building2 size={16} /> Schools
            </div>
            <div style={styles.navItem}>
              <Users size={16} /> Staff
            </div>
            <div style={styles.navItem}>
              <Mail size={16} /> Invitations
            </div>
            <div style={styles.navItem}>
              <ShieldCheck size={16} /> Analytics
            </div>
          </nav>
        </aside>

        <main style={styles.main}>
          <header style={styles.topbar}>
            <div>
              <div style={styles.kicker}>Platform control center</div>
              <h1 style={styles.title}>Super Admin Dashboard</h1>
            </div>
            <div style={styles.topbarActions}>
              <div style={styles.searchBox}>
                <Search size={14} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search schools"
                  style={styles.searchInput}
                />
              </div>
              <button style={styles.primaryButton}>Generate Invite</button>
            </div>
          </header>

          {error && <div style={styles.error}>{error}</div>}

          <section style={styles.metricsGrid}>
            {statCards.map(({ label, value, icon: Icon }) => (
              <div key={label} style={styles.metricCard}>
                <div style={styles.metricIconWrap}>
                  <Icon size={18} />
                </div>
                <div>
                  <div style={styles.metricValue}>{value}</div>
                  <div style={styles.metricLabel}>{label}</div>
                </div>
              </div>
            ))}
          </section>

          <section style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>School management</h2>
              <div style={styles.filterBar}>
                <Filter size={14} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={styles.select}
                >
                  <option value="ALL">All statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="ACTIVE">Active</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
            </div>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>School</th>
                    <th style={styles.th}>Code</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Admin</th>
                    <th style={styles.th}>Staff</th>
                    <th style={styles.th}>Students</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchools.map((school) => {
                    const status = formatStatus(school.status);
                    return (
                      <tr key={school.schoolId || school.id}>
                        <td style={styles.td}>
                          <div style={styles.schoolCell}>
                            <div style={styles.schoolBadge}>
                              {(school.schoolName || "School")
                                .slice(0, 1)
                                .toUpperCase()}
                            </div>
                            <div>
                              <div style={styles.schoolName}>
                                {school.schoolName}
                              </div>
                              <div style={styles.metaText}>{school.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={styles.td}>{school.schoolCode}</td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.badge,
                              ...getStatusBadgeStyle(status),
                            }}
                          >
                            {status}
                          </span>
                        </td>
                        <td style={styles.td}>{school.email || "N/A"}</td>
                        <td style={styles.td}>{school.totalStaff ?? 0}</td>
                        <td style={styles.td}>{school.totalStudents ?? 0}</td>
                        <td style={styles.td}>
                          <div style={styles.actionGroup}>
                            <button
                              style={styles.smallButton}
                              onClick={() =>
                                updateSchoolStatus(school.schoolId, "ACTIVE")
                              }
                            >
                              Approve
                            </button>
                            <button
                              style={styles.smallButtonWarning}
                              onClick={() =>
                                updateSchoolStatus(
                                  school.schoolId,
                                  "REJECTED_APPROVAL",
                                )
                              }
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section style={styles.twoCol}>
            <div style={styles.sectionCard}>
              <h2 style={styles.sectionTitle}>Staff management</h2>
              <div style={styles.stack}>
                {staff.slice(0, 5).map((member) => (
                  <div key={member.userId} style={styles.staffRow}>
                    <div>
                      <div style={styles.schoolName}>
                        {member.firstName || member.email}
                      </div>
                      <div style={styles.metaText}>{member.email}</div>
                    </div>
                    <div style={styles.inlineActions}>
                      <span
                        style={{
                          ...styles.badge,
                          ...getStatusBadgeStyle(formatStatus(member.status)),
                        }}
                      >
                        {formatStatus(member.status)}
                      </span>
                      <button
                        style={styles.smallButton}
                        onClick={() =>
                          updateStaffStatus(member.userId, "ACTIVE")
                        }
                      >
                        Activate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.sectionCard}>
              <h2 style={styles.sectionTitle}>Recent invitations</h2>
              <div style={styles.stack}>
                {invites.slice(0, 6).map((invite) => (
                  <div key={invite.id} style={styles.staffRow}>
                    <div>
                      <div style={styles.schoolName}>
                        {invite.schoolName || "School"}
                      </div>
                      <div style={styles.metaText}>
                        {invite.email || "admin@school.com"}
                      </div>
                    </div>
                    <div style={styles.inlineActions}>
                      <span
                        style={{
                          ...styles.badge,
                          ...getStatusBadgeStyle(
                            formatStatus(
                              invite.invitationStatus || invite.status,
                            ),
                          ),
                        }}
                      >
                        {formatStatus(invite.invitationStatus || invite.status)}
                      </span>
                      <button
                        style={styles.smallButton}
                        onClick={() => copyLink(invite.link)}
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f6f8f6 0%, #edf3ee 100%)",
    color: "#0f2e22",
    fontFamily: "Inter, system-ui, sans-serif",
    padding: 24,
  },
  shell: {
    maxWidth: 1400,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    gap: 20,
  },
  sidebar: {
    background: "#163325",
    color: "#ecfdf5",
    borderRadius: 22,
    padding: 20,
    boxShadow: "0 24px 48px rgba(16, 36, 28, 0.12)",
  },
  brand: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: -0.04,
  },
  brandSub: {
    marginTop: 6,
    color: "#b7d0c2",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.12,
  },
  nav: {
    marginTop: 28,
    display: "grid",
    gap: 10,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 14px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    fontWeight: 600,
  },
  main: {
    display: "grid",
    gap: 20,
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(15,46,34,0.08)",
    backdropFilter: "blur(10px)",
    borderRadius: 20,
    padding: "20px 24px",
  },
  kicker: {
    fontSize: 12,
    color: "#5d6d66",
    letterSpacing: 0.12,
    textTransform: "uppercase",
  },
  title: {
    margin: 0,
    fontSize: 32,
    letterSpacing: -0.05,
  },
  topbarActions: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid #dfe7e0",
    borderRadius: 12,
    background: "#fff",
    padding: "10px 12px",
    minWidth: 220,
  },
  searchInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    width: "100%",
    fontSize: 14,
    color: "#0f2e22",
  },
  primaryButton: {
    border: "none",
    background: "#c9963d",
    color: "#fff",
    fontWeight: 700,
    borderRadius: 12,
    padding: "10px 16px",
    cursor: "pointer",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
  },
  metricCard: {
    background: "rgba(255,255,255,0.8)",
    border: "1px solid rgba(15,46,34,0.08)",
    borderRadius: 18,
    padding: 18,
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  metricIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    color: "#163325",
    background: "#edf7ef",
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: -0.05,
  },
  metricLabel: {
    color: "#4b5a54",
    fontSize: 13,
  },
  sectionCard: {
    background: "rgba(255,255,255,0.8)",
    borderRadius: 20,
    border: "1px solid rgba(15,46,34,0.08)",
    padding: 20,
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 20,
  },
  filterBar: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#3a4a42",
  },
  select: {
    border: "1px solid #dfe7e0",
    borderRadius: 10,
    padding: "8px 10px",
    background: "#fff",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 860,
  },
  th: {
    textAlign: "left",
    padding: "12px 10px",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.08,
    color: "#5d6d66",
    borderBottom: "1px solid #edf1ee",
  },
  td: {
    padding: "14px 10px",
    borderBottom: "1px solid #edf1ee",
    verticalAlign: "middle",
  },
  schoolCell: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  schoolBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    background: "#ebf4ff",
    color: "#153f2f",
    fontWeight: 800,
  },
  schoolName: {
    fontWeight: 700,
    color: "#0f2e22",
  },
  metaText: {
    color: "#5d6d66",
    fontSize: 12,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    border: "1px solid",
    padding: "6px 10px",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  actionGroup: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  smallButton: {
    border: "none",
    background: "#163325",
    color: "#fff",
    padding: "8px 10px",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
  },
  smallButtonWarning: {
    border: "none",
    background: "#ef4444",
    color: "#fff",
    padding: "8px 10px",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },
  stack: {
    display: "grid",
    gap: 12,
  },
  staffRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 0",
    borderBottom: "1px solid #edf1ee",
  },
  inlineActions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  error: {
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: 12,
    padding: "12px 14px",
    fontWeight: 600,
  },
  card: {
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
