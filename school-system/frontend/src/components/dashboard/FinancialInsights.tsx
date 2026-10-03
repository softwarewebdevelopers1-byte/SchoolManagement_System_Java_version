import { useFinance } from "@/context/FinanceContext";
import {
  classPerformance,
  expenseBreakdown,
  termComparison,
} from "@/utils/calculations";
import { formatKES } from "@/utils/formatters";
import s from "./Dashboard.module.css";

export const FinancialInsights = () => {
  const { students, payments, expenses } = useFinance();
  const { delta } = termComparison(students);
  const perf = classPerformance(students);
  const topOutstandingClass = [...perf].sort(
    (a, b) => b.outstanding - a.outstanding,
  )[0];
  const methods = payments.reduce<Record<string, number>>((acc, p) => {
    if (p.status !== "Completed") return acc;
    acc[p.method] = (acc[p.method] ?? 0) + p.amount;
    return acc;
  }, {});
  const topMethod = Object.entries(methods).sort((a, b) => b[1] - a[1])[0];
  const breakdown = expenseBreakdown(expenses);
  const risingExpense = breakdown
    .map((b) => ({
      ...b,
      growth:
        b.previousAmount > 0
          ? ((b.amount - b.previousAmount) / b.previousAmount) * 100
          : 0,
    }))
    .sort((a, b) => b.growth - a.growth)[0];
  const followUpCount = students.filter(
    (s) => s.outstanding > 0 && s.overdue > 0,
  ).length;

  const insights = [
    delta > 0
      ? `Collection rate is ${delta.toFixed(1)}% higher than the previous term.`
      : `Collection rate is ${Math.abs(delta).toFixed(1)}% below the previous term — plan parent follow-up.`,
    topOutstandingClass
      ? `${topOutstandingClass.className} has the highest outstanding balance at ${formatKES(topOutstandingClass.outstanding, { compact: true })}.`
      : null,
    topMethod
      ? `${topMethod[0]} accounts for the largest share of recorded payments.`
      : null,
    risingExpense && risingExpense.growth > 0
      ? `${risingExpense.category} expenses grew ${risingExpense.growth.toFixed(1)}% vs the previous period.`
      : null,
    `${followUpCount} student accounts require fee follow-up this week.`,
  ].filter(Boolean) as string[];

  return (
    <div className={s.insightList}>
      {insights.map((text, i) => (
        <div key={i} className={s.insight}>
          <span className={s.insightBullet} />
          <span>{text}</span>
        </div>
      ))}
    </div>
  );
};
