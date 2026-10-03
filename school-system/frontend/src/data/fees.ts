import type { FeeStructure, Invoice, FeeCategory } from "@/types/finance";
import { STUDENTS } from "./students";

const catAmt = (c: FeeCategory, amt: number) => ({ category: c, amount: amt });

export const FEE_STRUCTURES: FeeStructure[] = [
  {
    id: "fs_f1a_2026t3",
    academicYear: "2026",
    term: "Term 3",
    classId: "c_f1a",
    className: "Form 1A",
    boarding: "Both",
    lines: [
      catAmt("Tuition", 18000),
      catAmt("Meals", 8000),
      catAmt("Activity", 2000),
      catAmt("Examination", 2000),
      catAmt("Medical", 1000),
      catAmt("Library", 1000),
    ],
    total: 32000,
    dueDate: "2026-09-15",
    active: true,
  },
  {
    id: "fs_f2a_2026t3",
    academicYear: "2026",
    term: "Term 3",
    classId: "c_f2a",
    className: "Form 2A",
    boarding: "Both",
    lines: [
      catAmt("Tuition", 22000),
      catAmt("Meals", 10000),
      catAmt("Activity", 2500),
      catAmt("Examination", 3000),
      catAmt("Medical", 1500),
      catAmt("Library", 1500),
      catAmt("ICT", 1500),
    ],
    total: 42000,
    dueDate: "2026-09-15",
    active: true,
  },
  {
    id: "fs_f3a_2026t3",
    academicYear: "2026",
    term: "Term 3",
    classId: "c_f3a",
    className: "Form 3A",
    boarding: "Both",
    lines: [
      catAmt("Tuition", 24000),
      catAmt("Boarding", 12000),
      catAmt("Meals", 5000),
      catAmt("Activity", 2000),
      catAmt("Examination", 1500),
      catAmt("Library", 500),
    ],
    total: 45000,
    dueDate: "2026-09-15",
    active: true,
  },
  {
    id: "fs_f4a_2026t3",
    academicYear: "2026",
    term: "Term 3",
    classId: "c_f4a",
    className: "Form 4A",
    boarding: "Both",
    lines: [
      catAmt("Tuition", 26000),
      catAmt("Boarding", 12000),
      catAmt("Meals", 5500),
      catAmt("Activity", 2000),
      catAmt("Examination", 2000),
      catAmt("Library", 500),
    ],
    total: 48000,
    dueDate: "2026-09-15",
    active: true,
  },
];

const structFor = (
  className: string,
  billed: number,
): FeeStructure | undefined =>
  FEE_STRUCTURES.find((f) => f.className === className) ??
  (FEE_STRUCTURES[0] && { ...FEE_STRUCTURES[0], className, total: billed });

const pad = (n: number, w = 4) => String(n).padStart(w, "0");

export const INVOICES: Invoice[] = STUDENTS.flatMap((s, idx) => {
  const struct = structFor(s.className, s.billed);
  if (!struct) return [];
  const lines = struct.lines;
  const paidRatio = s.billed > 0 ? s.paid / s.billed : 0;
  const paid = Math.round(s.billed * paidRatio);
  const balance = s.billed - paid;
  const status: Invoice["status"] =
    balance <= 0 ? "Paid" : paid > 0 ? "Partially Paid" : "Issued";
  return [
    {
      id: `inv_${pad(idx + 1)}`,
      number: `INV-2026-T3-${pad(idx + 1, 5)}`,
      studentId: s.id,
      studentName: s.fullName,
      admissionNo: s.admissionNo,
      className: s.className,
      term: "Term 3",
      academicYear: "2026",
      issueDate: "2026-09-01",
      dueDate: "2026-09-15",
      amount: s.billed,
      paid,
      balance,
      status,
      lines,
    },
  ];
});
