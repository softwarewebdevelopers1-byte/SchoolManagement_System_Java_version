import { useNavigate } from "react-router-dom";
import { Plus, Download } from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { KpiRow } from "./KpiRow";
import { CollectionChart } from "./CollectionChart";
import { CashflowChart } from "./CashflowChart";
import { ExpenseBreakdownChart } from "./ExpenseBreakdownChart";
import { ClassCollectionChart } from "./ClassCollectionChart";
import { FinancialAlerts } from "./FinancialAlerts";
import { FinancialInsights } from "./FinancialInsights";
import { QuickActions } from "./QuickActions";
import { RecentPayments } from "./RecentPayments";
import { OutstandingAccounts } from "./OutstandingAccounts";
import { formatKES } from "@/utils/formatters";
import { SCHOOLS } from "@/data/schools";
import s from "./Dashboard.module.css";

export const RoleDashboard = () => {
  const { role, school, year, term, currentUser, kpis, students } =
    useFinance();
  const navigate = useNavigate();

  const heading = () => {
    if (role === "platform_admin") return "Platform Overview";
    if (role === "school_admin") return "School Financial Health";
    if (role === "finance_manager") return "Finance Operations";
    if (role === "accounts_clerk") return "Today's Transactions";
    if (role === "school_administrator") return "School Financial Summary";
    return "Finance";
  };

  return (
    <div className={s.page}>
      <header className={s.pageHead}>
        <div className={s.greeting}>
          <h1 className={s.title}>{heading()}</h1>
          <p className={s.sub}>
            Welcome back, {currentUser.name.split(" ")[0]} · {school.name} ·{" "}
            {year.label} {term.label}
          </p>
        </div>
        <div className={s.headActions}>
          {role !== "platform_admin" && (
            <button
              type="button"
              onClick={() => navigate("/finance/payments?action=new")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 10,
                border: "none",
                background: "var(--edunex-primary)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <Plus size={14} /> Record Payment
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate("/finance/reports")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 10,
              border: "1px solid var(--edunex-border)",
              background: "var(--edunex-surface)",
              color: "var(--edunex-text-soft)",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <Download size={14} /> Reports
          </button>
        </div>
      </header>

      <KpiRow />

      {role === "platform_admin" && (
        <>
          <div className={s.grid}>
            <div className={s.card}>
              <div className={s.cardHead}>
                <div>
                  <div className={s.cardTitle}>Platform Collections Trend</div>
                  <div className={s.cardSub}>
                    Monthly collected fees across all schools
                  </div>
                </div>
              </div>
              <CollectionChart />
            </div>
            <div className={s.card}>
              <div className={s.cardHead}>
                <div className={s.cardTitle}>Recent Platform Events</div>
              </div>
              <div className={s.activity}>
                {[
                  {
                    n: "Green Valley School",
                    d: "Bulk billing run completed",
                    a: "842 invoices",
                  },
                  {
                    n: "Lakeview High School",
                    d: "SMS campaign dispatched",
                    a: "312 reminders",
                  },
                  {
                    n: "Edunex Academy",
                    d: "Reconciliation completed",
                    a: "96.4% matched",
                  },
                  {
                    n: "Mt. Kenya Boys",
                    d: "New finance user added",
                    a: "Grace Njeri",
                  },
                ].map((e, i) => (
                  <div key={i} className={s.activityRow}>
                    <div className={s.activityAvatar}>
                      {e.n
                        .split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className={s.activityMeta}>
                      <div className={s.activityName}>{e.n}</div>
                      <div className={s.activityDesc}>{e.d}</div>
                    </div>
                    <span
                      style={{ fontSize: 12, color: "var(--edunex-muted)" }}
                    >
                      {e.a}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className={s.card}>
            <div className={s.cardHead}>
              <div className={s.cardTitle}>Schools Using Finance</div>
              <span className={s.cardSub}>
                {SCHOOLS.filter((s) => s.usesFinance).length} of{" "}
                {SCHOOLS.length} schools
              </span>
            </div>
            {SCHOOLS.map((sc) => (
              <div key={sc.id} className={s.schoolRow}>
                <div
                  className={s.schoolDot}
                  style={{ background: sc.logoColor }}
                >
                  {sc.code}
                </div>
                <div className={s.schoolMeta}>
                  <div className={s.schoolName}>{sc.name}</div>
                  <div className={s.schoolCounty}>
                    {sc.county} · {sc.studentCount} students ·{" "}
                    {sc.subscriptionTier}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                  }}
                >
                  <span className={s.schoolRevenue}>
                    {formatKES(sc.monthlyRevenue, { compact: true })}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--edunex-muted)" }}>
                    {sc.usesFinance ? "Finance active" : "Finance inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {(role === "school_admin" ||
        role === "school_administrator" ||
        role === "finance_manager" ||
        role === "accounts_clerk") && (
        <>
          <div className={s.grid}>
            <div className={s.card}>
              <div className={s.cardHead}>
                <div>
                  <div className={s.cardTitle}>Collection Trend</div>
                  <div className={s.cardSub}>
                    Expected vs collected · {year.label}
                  </div>
                </div>
              </div>
              <CollectionChart />
            </div>
            <div className={s.card}>
              <div className={s.cardHead}>
                <div className={s.cardTitle}>Financial Alerts</div>
              </div>
              <FinancialAlerts />
            </div>
          </div>

          <div className={s.grid3}>
            <div className={s.card}>
              <div className={s.cardHead}>
                <div className={s.cardTitle}>Class Collection Performance</div>
              </div>
              <ClassCollectionChart />
            </div>
            <div className={s.card}>
              <div className={s.cardHead}>
                <div className={s.cardTitle}>Expense Breakdown</div>
              </div>
              <ExpenseBreakdownChart />
            </div>
            <div className={s.card}>
              <div className={s.cardHead}>
                <div className={s.cardTitle}>Cashflow</div>
                <span className={s.cardSub}>Inflows vs outflows</span>
              </div>
              <CashflowChart />
            </div>
          </div>

          <div className={s.grid2}>
            <div className={s.card}>
              <div className={s.cardHead}>
                <div className={s.cardTitle}>Recent Payments</div>
                <button
                  className={s.cardLink}
                  onClick={() => navigate("/finance/payments")}
                  style={{ background: "none", border: "none" }}
                >
                  View all
                </button>
              </div>
              <RecentPayments />
            </div>
            <div className={s.card}>
              <div className={s.cardHead}>
                <div className={s.cardTitle}>Top Outstanding Accounts</div>
                <button
                  className={s.cardLink}
                  onClick={() => navigate("/finance/outstanding")}
                  style={{ background: "none", border: "none" }}
                >
                  View all
                </button>
              </div>
              <OutstandingAccounts />
            </div>
          </div>
        </>
      )}

      {role === "finance_manager" && (
        <>
          <div className={s.grid}>
            <div className={s.card}>
              <div className={s.cardHead}>
                <div className={s.cardTitle}>Quick Actions</div>
              </div>
              <QuickActions />
            </div>
            <div className={s.card}>
              <div className={s.cardHead}>
                <div className={s.cardTitle}>Financial Insights</div>
                <span className={s.cardSub}>Generated from current data</span>
              </div>
              <FinancialInsights />
            </div>
          </div>
        </>
      )}

      {role === "accounts_clerk" && (
        <div className={s.card}>
          <div className={s.cardHead}>
            <div className={s.cardTitle}>Today's Work Queue</div>
          </div>
          <div className={s.actionsGrid}>
            <button
              type="button"
              className={s.quickAction}
              onClick={() => navigate("/finance/payments?action=new")}
            >
              <span className={s.quickActionIcon}>
                <Plus size={14} />
              </span>
              <span>Record New Payment</span>
            </button>
            <button
              type="button"
              className={s.quickAction}
              onClick={() => navigate("/finance/reconciliation")}
            >
              <span className={s.quickActionIcon}>
                <Plus size={14} />
              </span>
              <span>Reconcile Payments</span>
            </button>
            <button
              type="button"
              className={s.quickAction}
              onClick={() => navigate("/finance/students")}
            >
              <span className={s.quickActionIcon}>
                <Plus size={14} />
              </span>
              <span>Search Student Account</span>
            </button>
            <button
              type="button"
              className={s.quickAction}
              onClick={() => navigate("/finance/receipts")}
            >
              <span className={s.quickActionIcon}>
                <Plus size={14} />
              </span>
              <span>Issue Receipt</span>
            </button>
          </div>
        </div>
      )}

      {(role === "school_admin" || role === "school_administrator") && (
        <div className={s.card}>
          <div className={s.cardHead}>
            <div className={s.cardTitle}>Executive Summary</div>
            <span className={s.cardSub}>Term-to-date at a glance</span>
          </div>
          <div className={s.grid3}>
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--edunex-muted)",
                  marginBottom: 4,
                }}
              >
                Collected this term
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {formatKES(kpis.collected, { compact: true })}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--edunex-success)",
                  marginTop: 4,
                }}
              >
                {kpis.collectionRate.toFixed(1)}% collection rate
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--edunex-muted)",
                  marginBottom: 4,
                }}
              >
                Still outstanding
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {formatKES(kpis.outstanding, { compact: true })}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--edunex-danger)",
                  marginTop: 4,
                }}
              >
                {formatKES(kpis.overdue, { compact: true })} overdue
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--edunex-muted)",
                  marginBottom: 4,
                }}
              >
                Net cashflow
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {formatKES(kpis.netCashflow, { compact: true })}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--edunex-success)",
                  marginTop: 4,
                }}
              >
                Positive term cashflow
              </div>
            </div>
          </div>
          <div
            style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}
          >
            <button
              type="button"
              className={s.quickAction}
              onClick={() => navigate("/finance/reports")}
            >
              <span className={s.quickActionIcon}>
                <Download size={14} />
              </span>
              <span>Download Term Report</span>
            </button>
            <button
              type="button"
              className={s.quickAction}
              onClick={() => navigate("/finance/outstanding")}
            >
              <span className={s.quickActionIcon}>
                <Plus size={14} />
              </span>
              <span>Review Outstanding Accounts</span>
            </button>
          </div>
          <div
            style={{
              marginTop: 10,
              fontSize: 12,
              color: "var(--edunex-muted)",
            }}
          >
            {students.filter((s) => s.outstanding > 0).length} accounts have an
            outstanding balance.
          </div>
        </div>
      )}
    </div>
  );
};
