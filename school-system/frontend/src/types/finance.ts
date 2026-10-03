export type Role =
  | "platform_admin"
  | "school_admin"
  | "finance_manager"
  | "accounts_clerk"
  | "school_administrator"
  | "parent"
  | "student";

export type PaymentMethod =
  "M-Pesa" | "Bank" | "Cash" | "Cheque" | "Card" | "Other";

export type PaymentStatus =
  "Completed" | "Pending" | "Failed" | "Unallocated" | "Reversed";

export type InvoiceStatus =
  "Draft" | "Issued" | "Partially Paid" | "Paid" | "Overdue" | "Cancelled";

export type StudentStatus = "PAID" | "PARTIALLY_PAID" | "UNPAID" | "OVERDUE";

export type ExpenseStatus =
  "Draft" | "Pending Approval" | "Approved" | "Paid" | "Rejected";

export type VoucherStatus =
  "Draft" | "Pending" | "Approved" | "Rejected" | "Paid";

export type LpoStatus =
  "Draft" | "Pending" | "Approved" | "Sent" | "Completed" | "Cancelled";

export type LsoStatus =
  "Draft" | "Pending" | "Approved" | "Rejected" | "Completed";

export type PledgeStatus =
  "Pending" | "Partially Fulfilled" | "Fulfilled" | "Overdue";

export type AdjustmentType = "Discount" | "Waiver" | "Scholarship" | "Bursary";
export type AdjustmentStatus = "Pending" | "Approved" | "Rejected";

export type SmsStatus = "Sent" | "Delivered" | "Failed" | "Pending";

export type FeeCategory =
  | "Tuition"
  | "Boarding"
  | "Meals"
  | "Transport"
  | "Activity"
  | "Examination"
  | "Medical"
  | "Library"
  | "ICT"
  | "Uniform"
  | "Other";

export type ExpenseCategory =
  | "Salaries"
  | "Utilities"
  | "Food"
  | "Transport"
  | "Maintenance"
  | "Supplies"
  | "Learning Materials"
  | "ICT"
  | "Administration"
  | "Other";

export type RiskLabel =
  "On Track" | "Attention Needed" | "Overdue" | "Critical Balance";

export interface School {
  id: string;
  name: string;
  code: string;
  county: string;
  logoColor: string;
  studentCount: number;
  usesFinance: boolean;
  subscriptionTier: "Starter" | "Standard" | "Premium";
  monthlyRevenue: number;
}

export interface AcademicYear {
  id: string;
  label: string;
  terms: Term[];
}

export interface Term {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface Guardian {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: "Father" | "Mother" | "Guardian";
}

export interface Student {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  fullName: string;
  classId: string;
  className: string;
  stream?: string;
  boarding: "Boarding" | "Day";
  guardianId: string;
  guardian: Guardian;
  status: StudentStatus;
  billed: number;
  paid: number;
  outstanding: number;
  overdue: number;
  photoInitials: string;
}

export interface FeeStructureLine {
  category: FeeCategory;
  amount: number;
}

export interface FeeStructure {
  id: string;
  academicYear: string;
  term: string;
  classId: string;
  className: string;
  boarding: "Boarding" | "Day" | "Both";
  lines: FeeStructureLine[];
  total: number;
  dueDate: string;
  active: boolean;
}

export interface Invoice {
  id: string;
  number: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  className: string;
  term: string;
  academicYear: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  paid: number;
  balance: number;
  status: InvoiceStatus;
  lines: FeeStructureLine[];
}

export interface Payment {
  id: string;
  transactionId: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  className: string;
  parentName: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  date: string;
  term: string;
  academicYear: string;
  invoiceId?: string;
  invoiceNo?: string;
  status: PaymentStatus;
  recordedBy: string;
}

export interface Receipt {
  id: string;
  number: string;
  paymentId: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  className: string;
  parentName: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  date: string;
  term: string;
  previousBalance: number;
  newBalance: number;
  issuedBy: string;
}

export interface StatementLine {
  id: string;
  date: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface Pledge {
  id: string;
  parentName: string;
  studentId: string;
  studentName: string;
  className: string;
  pledged: number;
  fulfilled: number;
  remaining: number;
  pledgeDate: string;
  expectedDate: string;
  status: PledgeStatus;
}

export interface Adjustment {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  type: AdjustmentType;
  mode: "Percentage" | "Fixed";
  value: number;
  amount: number;
  reason: string;
  term: string;
  academicYear: string;
  approvedBy: string;
  status: AdjustmentStatus;
  date: string;
}

export interface Expense {
  id: string;
  number: string;
  category: ExpenseCategory;
  description: string;
  supplier: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  reference: string;
  status: ExpenseStatus;
  hasAttachment: boolean;
  recordedBy: string;
}

export interface Voucher {
  id: string;
  number: string;
  payee: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  method: PaymentMethod;
  date: string;
  preparedBy: string;
  approvedBy?: string;
  status: VoucherStatus;
}

export interface LpoItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Lpo {
  id: string;
  number: string;
  supplier: string;
  items: LpoItem[];
  total: number;
  date: string;
  expectedDelivery: string;
  status: LpoStatus;
  department: string;
}

export interface Lso {
  id: string;
  number: string;
  serviceProvider: string;
  description: string;
  amount: number;
  date: string;
  department: string;
  status: LsoStatus;
}

export interface CashbookEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  account: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface SmsMessage {
  id: string;
  messageId: string;
  recipientName: string;
  recipientPhone: string;
  studentId: string;
  studentName: string;
  type: "Fee Reminder" | "Payment Confirmation" | "Custom";
  body: string;
  date: string;
  status: SmsStatus;
}

export interface AuditEntry {
  id: string;
  user: string;
  role: Role;
  action: string;
  entity: string;
  detail: string;
  amount?: number;
  date: string;
  timestamp: string;
  status: "success" | "pending" | "failed";
}

export interface KpiSnapshot {
  expected: number;
  collected: number;
  outstanding: number;
  overdue: number;
  expenses: number;
  netCashflow: number;
  collectionRate: number;
  previousExpected: number;
  previousCollected: number;
}

export interface ClassPerformance {
  className: string;
  expected: number;
  collected: number;
  rate: number;
  outstanding: number;
}

export interface MonthlyPoint {
  month: string;
  expected: number;
  collected: number;
  outstanding: number;
  inflows: number;
  outflows: number;
  net: number;
}

export interface ExpenseCategoryPoint {
  category: ExpenseCategory;
  amount: number;
  previousAmount: number;
  percentage: number;
}

export interface PaymentMethodPoint {
  method: PaymentMethod;
  amount: number;
  count: number;
}

export interface AppSettings {
  invoicePrefix: string;
  receiptPrefix: string;
  smsSenderId: string;
  financialYear: string;
  reminderTemplate: string;
  approvalThreshold: number;
  bankAccounts: { id: string; name: string; number: string; branch: string }[];
  mpesaPaybill: string;
  mpesaAccount: string;
}
