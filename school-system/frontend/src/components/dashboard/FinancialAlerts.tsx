import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { formatKES } from "@/utils/formatters";
import s from "./Dashboard.module.css";

export const FinancialAlerts = () => {
  const { students, payments, expenses, kpis } = useFinance();

  const overdue30 = students.filter(
    (s) => s.overdue > 0 && s.outstanding > 20000,
  ).length;
  const form2Outstanding = students
    .filter((s) => s.className.startsWith("Form 2"))
    .reduce((sum, s) => sum + s.outstanding, 0);
  const unreconciled = payments.filter(
    (p) => p.status === "Unallocated" || p.status === "Pending",
  ).length;
  const thisMonthExpenses = expenses
    .filter((e) => {
      const d = new Date(e.date);
      const now = new Date("2026-10-15");
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((s, e) => s + e.amount, 0);
  const lastMonthExpenses = expenses
    .filter((e) => {
      const d = new Date(e.date);
      const ref = new Date("2026-10-15");
      ref.setMonth(ref.getMonth() - 1);
      return (
        d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear()
      );
    })
    .reduce((s, e) => s + e.amount, 0);
  const expenseTrend =
    lastMonthExpenses > 0
      ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
      : 0;

  const alerts = [
    overdue30 > 0 && {
      tone: "danger" as const,
      icon: <AlertCircle size={16} />,
      title: `${overdue30} accounts overdue by more than 30 days`,
      text: "Follow up with parents this week to improve term collection.",
    },
    form2Outstanding > 0 && {
      tone: "warn" as const,
      icon: <AlertTriangle size={16} />,
      title: `${formatKES(form2Outstanding, { compact: true })} outstanding in Form 2`,
      text: "Form 2 currently has the highest outstanding balance.",
    },
    unreconciled > 0 && {
      tone: "info" as const,
      icon: <Info size={16} />,
      title: `${unreconciled} payments awaiting reconciliation`,
      text: "Match these transactions to keep the cashbook accurate.",
    },
    expenseTrend > 0 && {
      tone: "warn" as const,
      icon: <AlertTriangle size={16} />,
      title: `Expense spending is ${expenseTrend.toFixed(1)}% higher than last month`,
      text: "Review recent categories for non-essential spend.",
    },
    {
      tone: "info" as const,
      icon: <Info size={16} />,
      title: `Term collection rate is currently ${kpis.collectionRate.toFixed(1)}%`,
      text: `${formatKES(kpis.outstanding, { compact: true })} remains uncollected.`,
    },
  ].filter(Boolean) as {
    tone: "warn" | "danger" | "info";
    icon: React.ReactNode;
    title: string;
    text: string;
  }[];

  return (
    <div className={s.alertList}>
      {alerts.map((a, i) => (
        <div
          key={i}
          className={`${s.alert} ${a.tone === "danger" ? s.alertDanger : a.tone === "warn" ? s.alertWarn : s.alertInfo}`}
        >
          <span
            className={s.alertIcon}
            style={{
              color:
                a.tone === "danger"
                  ? "var(--edunex-danger)"
                  : a.tone === "warn"
                    ? "var(--edunex-warning)"
                    : "var(--edunex-info)",
            }}
          >
            {a.icon}
          </span>
          <div className={s.alertBody}>
            <span className={s.alertTitle}>{a.title}</span>
            <span className={s.alertText}>{a.text}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
