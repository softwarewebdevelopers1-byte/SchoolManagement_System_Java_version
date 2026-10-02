import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, Tooltip, XAxis, YAxis } from "recharts";
import { Building2, GraduationCap, Users } from "lucide-react";
import { AnalyticsCard } from "../shared/analytics/AnalyticsCard";
import { AnalyticsTable, type AnalyticsTableColumn } from "../shared/analytics/AnalyticsTable";
import { ChartContainer } from "../shared/analytics/ChartContainer";
import {
  analyticsGridProps,
  analyticsLegendProps,
  analyticsTooltipProps,
  analyticsXAxisProps,
  analyticsYAxisProps,
} from "../shared/analytics/chartDefaults";
import { KpiCard } from "../shared/analytics/KpiCard";
import { analyticsChartDefaults, analyticsColors } from "../../lib/analyticsTheme";
import { useSuperAdminPlatformStatistics } from "../../lib/superAdminData";

interface RecentInvitation {
  id?: string;
  email?: string;
  role?: string;
  status?: string;
  createdAt?: string;
}

const invitationColumns: AnalyticsTableColumn<RecentInvitation>[] = [
  { id: "email", header: "Email", value: (row) => row.email || "—" },
  { id: "role", header: "Role", value: (row) => row.role || "—" },
  { id: "status", header: "Status", value: (row) => row.status || "—" },
  {
    id: "createdAt",
    header: "Created",
    value: (row) =>
      row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—",
  },
];

export default function SuperAdminAnalytics() {
  const { data: stats, loading, error, refresh } = useSuperAdminPlatformStatistics();
  const schoolStatus = [
    { name: "Active", value: stats?.activeSchools ?? 0 },
    { name: "Pending", value: stats?.pendingSchools ?? 0 },
    { name: "Rejected", value: stats?.rejectedSchools ?? 0 },
    { name: "Inactive", value: stats?.suspendedSchools ?? 0 },
  ];
  const invitationStatus = (stats?.recentInvitations ?? []).reduce(
    (counts: Record<string, number>, invitation: RecentInvitation) => {
      const status = invitation.status || "Unknown";
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    },
    {},
  );
  const invitationStatusRows = Object.entries(invitationStatus).map(
    ([name, value]) => ({ name, value }),
  );
  const invitations = (stats?.recentInvitations ?? []) as RecentInvitation[];

  return (
    <main style={{ display: "grid", gap: 20 }}>
      <header>
        <p
          style={{
            color: analyticsColors.neutral.text,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            margin: "0 0 6px",
            textTransform: "uppercase",
          }}
        >
          Platform insights
        </p>
        <h1 style={{ color: analyticsColors.primary, fontSize: 28, margin: 0 }}>
          Analytics dashboard
        </h1>
      </header>

      {error && (
        <AnalyticsCard
          title="Analytics could not be loaded"
          actions={
            <button type="button" onClick={() => void refresh()}>
              Retry
            </button>
          }
        >
          <p role="alert" style={{ color: analyticsColors.danger, margin: 0 }}>
            {error}
          </p>
        </AnalyticsCard>
      )}

      <section
        aria-label="Platform key performance indicators"
        style={{
          display: "grid",
          gap: 14,
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))",
        }}
      >
        <KpiCard
          label="Total schools"
          value={loading ? "—" : stats?.totalSchools ?? 0}
          icon={<Building2 size={20} color={analyticsColors.primary} />}
        />
        <KpiCard
          label="Active schools"
          value={loading ? "—" : stats?.activeSchools ?? 0}
          icon={<Building2 size={20} color={analyticsColors.success} />}
        />
        <KpiCard
          label="Total students"
          value={loading ? "—" : stats?.totalStudents ?? 0}
          icon={<GraduationCap size={20} color={analyticsColors.secondary} />}
        />
        <KpiCard
          label="Registrations · 30 days"
          value={loading ? "—" : stats?.recentRegistrations ?? 0}
          icon={<Users size={20} color={analyticsColors.accent} />}
        />
      </section>

      <section
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
        }}
      >
        <ChartContainer
          title="School status"
          subtitle="Current status of registered schools"
          height={280}
          loading={loading}
          isEmpty={!loading && schoolStatus.every((item) => item.value === 0)}
          emptyMessage="No school records are available."
          error={error}
          onRetry={() => void refresh()}
        >
          <BarChart data={schoolStatus} margin={analyticsChartDefaults.margin}>
            <CartesianGrid {...analyticsGridProps} />
            <XAxis {...analyticsXAxisProps} dataKey="name" />
            <YAxis {...analyticsYAxisProps} allowDecimals={false} />
            <Tooltip {...analyticsTooltipProps} />
            <Bar dataKey="value" name="Schools" radius={analyticsChartDefaults.bar.radius}>
              {schoolStatus.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={
                    [
                      analyticsColors.success,
                      analyticsColors.warning,
                      analyticsColors.danger,
                      analyticsColors.neutral.text,
                    ][index]
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>

        <ChartContainer
          title="Recent invitation status"
          subtitle="Latest invitations returned by the platform API"
          height={280}
          loading={loading}
          isEmpty={!loading && invitationStatusRows.length === 0}
          emptyMessage="No invitations are available."
          error={error}
          onRetry={() => void refresh()}
        >
          <PieChart margin={analyticsChartDefaults.margin}>
            <Pie
              data={invitationStatusRows}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={3}
            >
              {invitationStatusRows.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={analyticsColors.qualitative[index % analyticsColors.qualitative.length]}
                />
              ))}
            </Pie>
            <Tooltip {...analyticsTooltipProps} />
            <Legend {...analyticsLegendProps} />
          </PieChart>
        </ChartContainer>
      </section>

      <AnalyticsTable
        title="Recent invitations"
        columns={invitationColumns}
        rows={invitations}
        getRowId={(row, index) => row.id || `${row.email || "invite"}-${index}`}
        filterable
        exportable
        exportFilename="recent-invitations.csv"
        initialRowsPerPage={5}
        rowsPerPageOptions={[5, 10]}
        emptyMessage={loading ? "Loading invitations…" : "No recent invitations."}
      />

      <AnalyticsCard title="Staff account status">
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))",
          }}
        >
          {[
            { label: "Active", value: stats?.activeStaff ?? 0, color: analyticsColors.success },
            { label: "Pending", value: stats?.pendingStaff ?? 0, color: analyticsColors.warning },
            { label: "Suspended", value: stats?.suspendedStaff ?? 0, color: analyticsColors.danger },
          ].map((metric) => (
            <div key={metric.label} style={{ borderLeft: `3px solid ${metric.color}`, padding: "8px 12px" }}>
              <div style={{ color: analyticsColors.neutral.text, fontSize: 12 }}>{metric.label}</div>
              <strong style={{ color: analyticsColors.primary, fontSize: 20 }}>
                {loading ? "—" : metric.value}
              </strong>
            </div>
          ))}
        </div>
      </AnalyticsCard>

    </main>
  );
}
