import React, { useEffect, useState } from "react";
import { Activity, Building2, CheckCircle2, GraduationCap, Mail, TrendingUp, Users } from "lucide-react";
import { superAdminApi } from "../../lib/api";

export default function SuperAdminOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await superAdminApi.getPlatformStatistics();
        setStats(response || null);
      } catch (err: any) {
        setError(err.message || "Failed to load platform statistics");
      } finally {
        setLoading(false);
      }
    };

    void loadStats();
  }, []);

  const statCards = [
    { label: "Total Schools", value: stats?.totalSchools ?? 0, icon: Building2, color: "#163325" },
    { label: "Active Schools", value: stats?.activeSchools ?? 0, icon: CheckCircle2, color: "#16a34a" },
    { label: "Pending Approval", value: stats?.pendingSchools ?? 0, icon: Activity, color: "#c084fc" },
    { label: "Total Staff", value: stats?.totalStaff ?? 0, icon: Users, color: "#0ea5e9" },
    { label: "Total Students", value: stats?.totalStudents ?? 0, icon: GraduationCap, color: "#f59e0b" },
    { label: "Recent Invitations", value: stats?.recentInvitations ?? 0, icon: Mail, color: "#ec4899" },
  ];

  const getRecentActivity = (): { label: string; value: string; color: string }[] => [
    { label: "Schools Onboarded (This Month)", value: stats?.schoolsOnboardedThisMonth ?? "0", color: "#16a34a" },
    { label: "Pending Approvals", value: stats?.pendingApprovals ?? "0", color: "#c084fc" },
    { label: "Active Users", value: stats?.activeUsers ?? "0", color: "#0ea5e9" },
    { label: "Suspended Accounts", value: stats?.suspendedAccounts ?? "0", color: "#ef4444" },
  ];

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>Loading platform overview...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.kicker}>Welcome back</div>
          <h1 style={styles.title}>Platform Overview</h1>
        </div>
        <div style={styles.lastUpdated}>
          Last updated: {new Date().toLocaleString()}
        </div>
      </header>

      {error && <div style={styles.error}>{error}</div>}

      <section style={styles.metricsGrid}>
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={styles.metricCard}>
            <div style={{ ...styles.metricIconWrap, background: `${color}22` }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={styles.metricValue}>{value}</div>
              <div style={styles.metricLabel}>{label}</div>
            </div>
          </div>
        ))}
      </section>

      <section style={styles.activityGrid}>
        {getRecentActivity().map(({ label, value, color }) => (
          <div key={label} style={styles.activityCard}>
            <div style={styles.activityLabel}>{label}</div>
            <div style={{ ...styles.activityValue, color }}>
              {value}
            </div>
          </div>
        ))}
      </section>

      <section style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Quick Actions</h2>
          <TrendingUp size={20} color="#163325" />
        </div>
        <div style={styles.actionGrid}>
          <button style={styles.actionButton}>
            <div style={styles.actionIcon}>+</div>
            <div>
              <div style={styles.actionTitle}>Onboard New School</div>
              <div style={styles.actionDesc}>Generate invite link</div>
            </div>
          </button>
          <button style={styles.actionButton}>
            <div style={styles.actionIcon}>👥</div>
            <div>
              <div style={styles.actionTitle}>Review Pending Schools</div>
              <div style={styles.actionDesc}>Approve or reject</div>
            </div>
          </button>
          <button style={styles.actionButton}>
            <div style={styles.actionIcon}>📊</div>
            <div>
              <div style={styles.actionTitle}>View Analytics</div>
              <div style={styles.actionDesc}>Platform insights</div>
            </div>
          </button>
          <button style={styles.actionButton}>
            <div style={styles.actionIcon}>⚙️</div>
            <div>
              <div style={styles.actionTitle}>Platform Settings</div>
              <div style={styles.actionDesc}>Configure system</div>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "grid",
    gap: 24,
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  kicker: {
    fontSize: 12,
    color: "#5d6d66",
    letterSpacing: 0.12,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    margin: 0,
    fontSize: 32,
    letterSpacing: -0.05,
    color: "#0f2e22",
  },
  lastUpdated: {
    fontSize: 13,
    color: "#5d6d66",
    background: "rgba(22, 51, 37, 0.04)",
    padding: "8px 12px",
    borderRadius: 8,
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
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: -0.05,
    color: "#0f2e22",
  },
  metricLabel: {
    color: "#4b5a54",
    fontSize: 13,
    marginTop: 4,
  },
  activityGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
  },
  activityCard: {
    background: "rgba(255,255,255,0.8)",
    border: "1px solid rgba(15,46,34,0.08)",
    borderRadius: 16,
    padding: 16,
  },
  activityLabel: {
    fontSize: 12,
    color: "#5d6d66",
    textTransform: "uppercase",
    letterSpacing: 0.08,
    marginBottom: 8,
  },
  activityValue: {
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: -0.05,
  },
  card: {
    background: "rgba(255,255,255,0.8)",
    border: "1px solid rgba(15,46,34,0.08)",
    borderRadius: 20,
    padding: 24,
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  cardTitle: {
    margin: 0,
    fontSize: 20,
    color: "#0f2e22",
  },
  actionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 12,
  },
  actionButton: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 16,
    border: "1px solid rgba(15,46,34,0.08)",
    borderRadius: 14,
    background: "rgba(22, 51, 37, 0.02)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    background: "#c9963d",
    color: "#fff",
    fontWeight: 800,
    fontSize: 20,
    flexShrink: 0,
  },
  actionTitle: {
    fontWeight: 700,
    color: "#0f2e22",
    fontSize: 14,
  },
  actionDesc: {
    fontSize: 12,
    color: "#5d6d66",
    marginTop: 4,
  },
  error: {
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: 12,
    padding: "12px 14px",
    fontWeight: 600,
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
