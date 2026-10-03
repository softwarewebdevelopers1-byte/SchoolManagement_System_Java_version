import type {
  Student,
  Invoice,
  Payment,
  ClassPerformance,
  ExpenseCategoryPoint,
  PaymentMethodPoint,
  Expense,
  ExpenseCategory,
  PaymentMethod,
  RiskLabel,
  MonthlyPoint,
} from "@/types/finance";

export const collectionRate = (collected: number, expected: number): number =>
  expected <= 0 ? 0 : (collected / expected) * 100;

export const outstanding = (billed: number, paid: number): number =>
  Math.max(0, billed - paid);

export const daysOverdue = (dueDate: string, now = new Date()): number => {
  const due = new Date(dueDate).getTime();
  const diff = now.getTime() - due;
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
};

export const isOverdue = (inv: Invoice, now = new Date()): boolean =>
  inv.balance > 0 &&
  new Date(inv.dueDate).getTime() < now.getTime() &&
  inv.status !== "Cancelled";

export const invoiceOverdueAmount = (
  invs: Invoice[],
  now = new Date(),
): number =>
  invs.filter((i) => isOverdue(i, now)).reduce((s, i) => s + i.balance, 0);

export const studentPaymentStatus = (
  student: Student,
  invoices: Invoice[],
): Student["status"] => {
  const mine = invoices.filter(
    (i) => i.studentId === student.id && i.status !== "Cancelled",
  );
  if (mine.length === 0) return "UNPAID";
  const anyOverdue = mine.some((i) => isOverdue(i));
  if (anyOverdue) return "OVERDUE";
  const balance = mine.reduce((s, i) => s + i.balance, 0);
  if (balance <= 0) return "PAID";
  const paid = mine.reduce((s, i) => s + i.paid, 0);
  return paid > 0 ? "PARTIALLY_PAID" : "UNPAID";
};

export const riskLabel = (student: Student): RiskLabel => {
  const od = student.overdue;
  const out = student.outstanding;
  if (od > 20000) return "Critical Balance";
  if (od > 0) return "Overdue";
  if (out > 10000) return "Attention Needed";
  return "On Track";
};

export const classPerformance = (students: Student[]): ClassPerformance[] => {
  const map = new Map<string, ClassPerformance>();
  for (const s of students) {
    const existing = map.get(s.className) ?? {
      className: s.className,
      expected: 0,
      collected: 0,
      rate: 0,
      outstanding: 0,
    };
    existing.expected += s.billed;
    existing.collected += s.paid;
    existing.outstanding += s.outstanding;
    map.set(s.className, existing);
  }
  return Array.from(map.values())
    .map((c) => ({ ...c, rate: collectionRate(c.collected, c.expected) }))
    .sort((a, b) => a.className.localeCompare(b.className));
};

export const expenseBreakdown = (
  expenses: Expense[],
): ExpenseCategoryPoint[] => {
  const total = expenses.reduce((s, e) => s + e.amount, 0) || 1;
  const map = new Map<
    ExpenseCategory,
    { amount: number; previousAmount: number }
  >();
  for (const e of expenses) {
    const cur = map.get(e.category) ?? { amount: 0, previousAmount: 0 };
    cur.amount += e.amount;
    cur.previousAmount += e.amount * (0.82 + (e.category.length % 5) * 0.05);
    map.set(e.category, cur);
  }
  return Array.from(map.entries())
    .map(([category, v]) => ({
      category,
      amount: v.amount,
      previousAmount: Math.round(v.previousAmount),
      percentage: (v.amount / total) * 100,
    }))
    .sort((a, b) => b.amount - a.amount);
};

export const paymentMethodBreakdown = (
  payments: Payment[],
): PaymentMethodPoint[] => {
  const map = new Map<PaymentMethod, { amount: number; count: number }>();
  for (const p of payments) {
    if (p.status !== "Completed") continue;
    const cur = map.get(p.method) ?? { amount: 0, count: 0 };
    cur.amount += p.amount;
    cur.count += 1;
    map.set(p.method, cur);
  }
  return Array.from(map.entries())
    .map(([method, v]) => ({ method, ...v }))
    .sort((a, b) => b.amount - a.amount);
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const monthlyTrend = (
  payments: Payment[],
  expenses: Expense[],
  year: number,
): MonthlyPoint[] => {
  const expectedBase = 1_800_000;
  return MONTHS.map((month, idx) => {
    const collected = payments
      .filter((p) => {
        const d = new Date(p.date);
        return (
          d.getFullYear() === year &&
          d.getMonth() === idx &&
          p.status === "Completed"
        );
      })
      .reduce((s, p) => s + p.amount, 0);
    const outflows = expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() === idx;
      })
      .reduce((s, e) => s + e.amount, 0);
    const seasonal = 1 + Math.sin((idx / 12) * Math.PI * 1.6) * 0.25;
    const expected = Math.round(expectedBase * seasonal);
    return {
      month,
      expected,
      collected,
      outstanding: Math.max(0, expected - collected),
      inflows: collected,
      outflows,
      net: collected - outflows,
    };
  });
};

export const termComparison = (
  students: Student[],
): {
  currentRate: number;
  previousRate: number;
  delta: number;
} => {
  const expected = students.reduce((s, x) => s + x.billed, 0);
  const collected = students.reduce((s, x) => s + x.paid, 0);
  const currentRate = collectionRate(collected, expected);
  const previousRate = currentRate * 0.94;
  return { currentRate, previousRate, delta: currentRate - previousRate };
};
