import type { Payment, Receipt, Pledge, Adjustment } from "@/types/finance";
import { STUDENTS } from "./students";

const METHODS: Payment["method"][] = [
  "M-Pesa",
  "Bank",
  "Cash",
  "Cheque",
  "Card",
];
const pad = (n: number, w = 4) => String(n).padStart(w, "0");

const dateOffset = (daysAgo: number): string => {
  const d = new Date("2026-10-15");
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
};

export const PAYMENTS: Payment[] = STUDENTS.flatMap((s, idx) => {
  if (s.paid <= 0) return [];
  const slices = s.paid > 30000 ? 2 : 1;
  return Array.from({ length: slices }, (_, k): Payment => {
    const amt = Math.round(s.paid / slices);
    const method = METHODS[(idx + k) % METHODS.length];
    const id = `pay_${pad(idx * 3 + k + 1, 5)}`;
    return {
      id,
      transactionId: `TXN-${pad(idx * 3 + k + 1, 7)}`,
      receiptNo: `RCP-2026-${pad(idx * 3 + k + 1, 5)}`,
      studentId: s.id,
      studentName: s.fullName,
      admissionNo: s.admissionNo,
      className: s.className,
      parentName: s.guardian.name,
      amount: amt,
      method,
      reference:
        method === "M-Pesa" ? `SJ${pad(idx + k, 8)}` : `REF${pad(idx + k, 6)}`,
      date: dateOffset(20 + (idx % 30) + k * 3),
      term: "Term 3",
      academicYear: "2026",
      invoiceId: `inv_${pad(idx + 1)}`,
      invoiceNo: `INV-2026-T3-${pad(idx + 1, 5)}`,
      status: "Completed",
      recordedBy: "Grace Njeri",
    };
  });
});

export const RECEIPTS: Receipt[] = PAYMENTS.map((p, i) => ({
  id: `rcp_${pad(i + 1, 5)}`,
  number: p.receiptNo,
  paymentId: p.id,
  studentId: p.studentId,
  studentName: p.studentName,
  admissionNo: p.admissionNo,
  className: p.className,
  parentName: p.parentName,
  amount: p.amount,
  method: p.method,
  reference: p.reference,
  date: p.date,
  term: p.term,
  previousBalance: 0,
  newBalance: 0,
  issuedBy: p.recordedBy,
}));

export const PLEDGES: Pledge[] = [
  {
    id: "pld_001",
    parentName: "Samuel Kariuki",
    studentId: "std_001",
    studentName: "John Kamau",
    className: "Form 3A",
    pledged: 13000,
    fulfilled: 5000,
    remaining: 8000,
    pledgeDate: "2026-09-05",
    expectedDate: "2026-10-30",
    status: "Partially Fulfilled",
  },
  {
    id: "pld_002",
    parentName: "Elizabeth Achieng",
    studentId: "std_005",
    studentName: "Kevin Achieng",
    className: "Form 3B",
    pledged: 24000,
    fulfilled: 0,
    remaining: 24000,
    pledgeDate: "2026-09-10",
    expectedDate: "2026-10-15",
    status: "Overdue",
  },
  {
    id: "pld_003",
    parentName: "Joseph Mutua",
    studentId: "std_009",
    studentName: "Peter Atieno",
    className: "Form 3A",
    pledged: 30000,
    fulfilled: 30000,
    remaining: 0,
    pledgeDate: "2026-08-20",
    expectedDate: "2026-09-30",
    status: "Fulfilled",
  },
  {
    id: "pld_004",
    parentName: "Anne Njoki",
    studentId: "std_007",
    studentName: "Daniel Njoki",
    className: "Form 2B",
    pledged: 25000,
    fulfilled: 8000,
    remaining: 17000,
    pledgeDate: "2026-09-15",
    expectedDate: "2026-11-15",
    status: "Partially Fulfilled",
  },
  {
    id: "pld_005",
    parentName: "Rose Atieno",
    studentId: "std_009",
    studentName: "Peter Atieno",
    className: "Form 3A",
    pledged: 15000,
    fulfilled: 0,
    remaining: 15000,
    pledgeDate: "2026-10-01",
    expectedDate: "2026-11-30",
    status: "Pending",
  },
];

export const ADJUSTMENTS: Adjustment[] = [
  {
    id: "adj_001",
    studentId: "std_004",
    studentName: "Alice Mwangi",
    className: "Form 4A",
    type: "Scholarship",
    mode: "Percentage",
    value: 25,
    amount: 12000,
    reason: "County scholarship for academic excellence",
    term: "Term 3",
    academicYear: "2026",
    approvedBy: "David Otieno",
    status: "Approved",
    date: "2026-09-02",
  },
  {
    id: "adj_002",
    studentId: "std_009",
    studentName: "Peter Atieno",
    className: "Form 3A",
    type: "Bursary",
    mode: "Fixed",
    value: 8000,
    amount: 8000,
    reason: "CDF bursary allocation",
    term: "Term 3",
    academicYear: "2026",
    approvedBy: "David Otieno",
    status: "Approved",
    date: "2026-09-04",
  },
  {
    id: "adj_003",
    studentId: "std_015",
    studentName: "Dennis Wambui",
    className: "Form 2B",
    type: "Waiver",
    mode: "Fixed",
    value: 5000,
    amount: 5000,
    reason: "Hardship waiver — family circumstances",
    term: "Term 3",
    academicYear: "2026",
    approvedBy: "Pending",
    status: "Pending",
    date: "2026-10-10",
  },
  {
    id: "adj_004",
    studentId: "std_027",
    studentName: "Alex Njoki",
    className: "Form 2A",
    type: "Discount",
    mode: "Percentage",
    value: 10,
    amount: 4200,
    reason: "Sibling discount — second child enrolled",
    term: "Term 3",
    academicYear: "2026",
    approvedBy: "Grace Njeri",
    status: "Approved",
    date: "2026-09-06",
  },
];
