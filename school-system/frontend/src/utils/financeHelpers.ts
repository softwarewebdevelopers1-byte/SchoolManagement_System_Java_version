import type { Student, Payment, Invoice } from "@/types/finance";

export const fullName = (s: Student): string =>
  `${s.firstName} ${s.lastName}`.trim();

export const searchStudents = (students: Student[], q: string): Student[] => {
  if (!q.trim()) return students;
  const lower = q.toLowerCase();
  return students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(lower) ||
      s.admissionNo.toLowerCase().includes(lower) ||
      s.className.toLowerCase().includes(lower) ||
      s.guardian.name.toLowerCase().includes(lower) ||
      s.guardian.phone.includes(q),
  );
};

export const filterByClass = <T extends { className: string }>(
  items: T[],
  klass: string,
): T[] =>
  !klass || klass === "all"
    ? items
    : items.filter((i) => i.className === klass);

export const filterByStatus = <T extends { status: string }>(
  items: T[],
  status: string,
): T[] =>
  !status || status === "all"
    ? items
    : items.filter((i) => i.status === status);

export const sortBy = <T>(items: T[], key: keyof T, dir: "asc" | "desc"): T[] =>
  [...items].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av === bv) return 0;
    const cmp = av > bv ? 1 : -1;
    return dir === "asc" ? cmp : -cmp;
  });

export const paginate = <T>(
  items: T[],
  page: number,
  perPage: number,
): {
  items: T[];
  total: number;
  pages: number;
  page: number;
} => {
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const clamped = Math.min(Math.max(1, page), pages);
  const start = (clamped - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    total,
    pages,
    page: clamped,
  };
};

export const uniqueClasses = (students: Student[]): string[] =>
  Array.from(new Set(students.map((s) => s.className))).sort();

export const sumPayments = (payments: Payment[], since?: Date): number =>
  payments
    .filter(
      (p) => p.status === "Completed" && (!since || new Date(p.date) >= since),
    )
    .reduce((s, p) => s + p.amount, 0);

export const applyVariables = (
  template: string,
  vars: Record<string, string | number>,
): string =>
  template.replace(/\[([A-Z_]+)\]/g, (_, key) =>
    String(vars[key] ?? `[${key}]`),
  );

export const smsSegments = (body: string): number => {
  const len = body.length;
  if (len <= 160) return 1;
  return Math.ceil(len / 153);
};

export const studentStatement = (
  student: Student,
  invoices: Invoice[],
  payments: Payment[],
) => {
  type Line = {
    date: string;
    description: string;
    reference: string;
    debit: number;
    credit: number;
  };
  const lines: Line[] = [];
  for (const inv of invoices.filter((i) => i.studentId === student.id)) {
    lines.push({
      date: inv.issueDate,
      description: `Invoice ${inv.number} — ${inv.term}`,
      reference: inv.number,
      debit: inv.amount,
      credit: 0,
    });
  }
  for (const p of payments.filter((p) => p.studentId === student.id)) {
    lines.push({
      date: p.date,
      description: `Payment — ${p.method}${p.reference ? ` (${p.reference})` : ""}`,
      reference: p.receiptNo,
      debit: 0,
      credit: p.status === "Completed" ? p.amount : 0,
    });
  }
  lines.sort((a, b) => a.date.localeCompare(b.date));
  let balance = 0;
  return lines.map((l, i) => {
    balance += l.debit - l.credit;
    return { ...l, id: `L${i + 1}`, balance };
  });
};
