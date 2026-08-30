import React, { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Users, Building2 } from "lucide-react";
import { superAdminApi } from "../../lib/api";

export default function SuperAdminAnalytics() {
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
        setError(err.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    void loadStats();
  }, []);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>Loading analytics...</div>
      </div>
    );
  }

  const kpis = [
    {
      label: "Total Schools",
      value: stats?.totalSchools ?? 0,
      trend: "+12%",
      icon: Building2,
      color: "#163325",
    },
    {
      label: "Active Schools",
      value: stats?.activeSchools ?? 0,
      trend: "+8%",
      icon: TrendingUp,
      color: "#16a34a",
    },
    {
      label: "Total Students",
      value: stats?.totalStudents ?? 0,
      trend: "+24%",
      icon: Users,
      color: "#0ea5e9",
    },
    {
      label: "Monthly Growth",
      value: stats?.schoolsOnboardedThisMonth ?? 0,
      trend: "On track",
      icon: BarChart3,
      color: "#c9963d",
    },
  ];

  const metrics = [
    { label: "Pending Approvals", value: stats?.pendingApprovals ?? 0, color: "#c084fc" },
    { label: "Active Users", value: stats?.activeUsers ?? 0, color: "#16a34a" },
    { label: "Suspended Accounts", value: stats?.suspendedAccounts ?? 0, color: "#ef4444" },
    { label: "Recent Invitations", value: stats?.recentInvitations.length ?? 0, color: "#ec4899" },
  ];

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.kicker}>Platform insights</div>
          <h1 style={styles.title}>Analytics Dashboard</h1>
        </div>
      </header>

      {error && <div style={styles.error}>{error}</div>}

      <section style={styles.kpisGrid}>
        {kpis.map(({ label, value, trend, icon: Icon, color }) => (
          <div key={label} style={styles.kpiCard}>
            <div style={{ ...styles.kpiIconWrap, background: `${color}22` }}>
              <Icon size={24} color={color} />
            </div>
            <div>
              <div style={styles.kpiLabel}>{label}</div>
              <div style={styles.kpiValue}>{value}</div>
              <div style={{ ...styles.kpiTrend, color }}>{trend}</div>
            </div>
          </div>
        ))}
      </section>

      <div style={styles.twoCol}>
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Key Metrics</h2>
          </div>
          <div style={styles.metricsList}>
            {metrics.map(({ label, value, color }) => (
              <div key={label} style={styles.metricRow}>
                <div style={{ ...styles.metricDot, background: color }} />
                <div>
                  <div style={styles.metricLabel}>{label}</div>
                  <div style={styles.metricValue}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Platform Health</h2>
          </div>
          <div style={styles.healthGrid}>
            <div style={styles.healthItem}>
              <div style={styles.healthLabel}>System Uptime</div>
              <div style={styles.healthValue}>99.9%</div>
              <div style={{ ...styles.healthStatus, color: "#16a34a" }}>✓ Operational</div>
            </div>
            <div style={styles.healthItem}>
              <div style={styles.healthLabel}>Average Response Time</div>
              <div style={styles.healthValue}>245ms</div>
              <div style={{ ...styles.healthStatus, color: "#16a34a" }}>✓ Optimal</div>
            </div>
            <div style={styles.healthItem}>
              <div style={styles.healthLabel}>API Requests (24h)</div>
              <div style={styles.healthValue}>12.4K</div>
              <div style={{ ...styles.healthStatus, color: "#16a34a" }}>✓ Healthy</div>
            </div>
            <div style={styles.healthItem}>
              <div style={styles.healthLabel}>Server Capacity</div>
              <div style={styles.healthValue}>67%</div>
              <div style={{ ...styles.healthStatus, color: "#16a34a" }}>✓ Available</div>
            </div>
          </div>
        </section>
      </div>

      <section style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Recent Activity</h2>
        </div>
        <div style={styles.activityList}>
          <div style={styles.activityItem}>
            <div style={styles.activityIcon}>✅</div>
            <div>
              <div style={styles.activityTitle}>School Approved</div>
              <div style={styles.activityTime}>Nairobi Academy approved 2 hours ago</div>
            </div>
          </div>
          <div style={styles.activityItem}>
            <div style={styles.activityIcon}>👥</div>
            <div>
              <div style={styles.activityTitle}>New Staff Member</div>
              <div style={styles.activityTime}>12 new staff registered today</div>
            </div>
          </div>
          <div style={styles.activityItem}>
            <div style={styles.activityIcon}>📧</div>
            <div>
              <div style={styles.activityTitle}>Invitations Sent</div>
              <div style={styles.activityTime}>45 invitations sent in the last 24 hours</div>
            </div>
          </div>
          <div style={styles.activityItem}>
            <div style={styles.activityIcon}>⚠️</div>
            <div>
              <div style={styles.activityTitle}>Pending Approvals</div>
              <div style={styles.activityTime}>{stats?.pendingApprovals ?? 0} schools awaiting review</div>
            </div>
          </div>
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
    paddingBottom: 16,
    borderBottom: "1px solid rgba(15,46,34,0.08)",
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
  kpisGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
  },
  kpiCard: {
    background: "rgba(255,255,255,0.8)",
    border: "1px solid rgba(15,46,34,0.08)",
    borderRadius: 18,
    padding: 20,
    display: "flex",
    gap: 16,
  },
  kpiIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  kpiLabel: {
    fontSize: 12,
    color: "#5d6d66",
    textTransform: "uppercase",
    letterSpacing: 0.08,
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: -0.05,
    color: "#0f2e22",
    marginTop: 4,
  },
  kpiTrend: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 8,
  },
  twoCol: {
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
  cardHeader: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottom: "1px solid rgba(15,46,34,0.04)",
  },
  cardTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: "#0f2e22",
  },
  metricsList: {
    display: "grid",
    gap: 12,
  },
  metricRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 0",
  },
  metricDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    flexShrink: 0,
  },
  metricLabel: {
    fontSize: 12,
    color: "#5d6d66",
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0f2e22",
    marginTop: 2,
  },
  healthGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  healthItem: {
    padding: 12,
    background: "rgba(22, 51, 37, 0.02)",
    borderRadius: 12,
    border: "1px solid rgba(15,46,34,0.04)",
  },
  healthLabel: {
    fontSize: 11,
    color: "#5d6d66",
    textTransform: "uppercase",
    letterSpacing: 0.08,
  },
  healthValue: {
    fontSize: 20,
    fontWeight: 800,
    color: "#0f2e22",
    marginTop: 6,
  },
  healthStatus: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 6,
  },
  activityList: {
    display: "grid",
    gap: 12,
  },
  activityItem: {
    display: "flex",
    gap: 12,
    padding: "12px 0",
    borderBottom: "1px solid rgba(15,46,34,0.04)",
  },
  activityIcon: {
    fontSize: 20,
    flexShrink: 0,
  },
  activityTitle: {
    fontWeight: 700,
    color: "#0f2e22",
    fontSize: 14,
  },
  activityTime: {
    fontSize: 12,
    color: "#5d6d66",
    marginTop: 2,
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
