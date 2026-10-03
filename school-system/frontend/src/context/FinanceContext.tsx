import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type {
  Role,
  School,
  AcademicYear,
  Term,
  Payment,
  Invoice,
  Expense,
  Voucher,
  Lpo,
  Lso,
  Pledge,
  Adjustment,
  SmsMessage,
  AuditEntry,
  AppSettings,
} from "@/types/finance";
import { SCHOOLS, ACADEMIC_YEARS } from "@/data/schools";
import { STUDENTS } from "@/data/students";
import { INVOICES, FEE_STRUCTURES } from "@/data/fees";
import { PAYMENTS, RECEIPTS, PLEDGES, ADJUSTMENTS } from "@/data/transactions";
import { EXPENSES, VOUCHERS, LPOS, LSOS, CASHBOOK } from "@/data/expenses";
import { SMS_HISTORY, REMINDER_TEMPLATE } from "@/data/sms";
import { DEMO_USERS, getDemoUser } from "@/data/users";

type State = {
  role: Role;
  schoolId: string;
  academicYearId: string;
  termId: string;
  payments: Payment[];
  receipts: typeof RECEIPTS;
  expenses: Expense[];
  vouchers: Voucher[];
  lpos: Lpo[];
  lsos: Lso[];
  pledges: Pledge[];
  adjustments: Adjustment[];
  sms: SmsMessage[];
  audit: AuditEntry[];
  settings: AppSettings;
};

type Action =
  | { type: "SET_ROLE"; role: Role }
  | { type: "SET_SCHOOL"; schoolId: string }
  | { type: "SET_YEAR"; yearId: string }
  | { type: "SET_TERM"; termId: string }
  | { type: "ADD_PAYMENT"; payment: Payment; receiptId: string }
  | { type: "ADD_EXPENSE"; expense: Expense }
  | { type: "UPDATE_EXPENSE_STATUS"; id: string; status: Expense["status"] }
  | { type: "ADD_VOUCHER"; voucher: Voucher }
  | {
      type: "UPDATE_VOUCHER_STATUS";
      id: string;
      status: Voucher["status"];
      approvedBy?: string;
    }
  | { type: "ADD_LPO"; lpo: Lpo }
  | { type: "UPDATE_LPO_STATUS"; id: string; status: Lpo["status"] }
  | { type: "ADD_LSO"; lso: Lso }
  | { type: "UPDATE_LSO_STATUS"; id: string; status: Lso["status"] }
  | { type: "ADD_PLEDGE"; pledge: Pledge }
  | { type: "ADD_ADJUSTMENT"; adjustment: Adjustment }
  | { type: "SEND_SMS_BATCH"; messages: SmsMessage[] }
  | { type: "LOG_AUDIT"; entry: AuditEntry }
  | { type: "UPDATE_SETTINGS"; patch: Partial<AppSettings> };

const currentYear = ACADEMIC_YEARS[0];
const currentTerm =
  currentYear.terms.find((t) => t.isCurrent) ?? currentYear.terms[0];

const initialSettings: AppSettings = {
  invoicePrefix: "INV",
  receiptPrefix: "RCP",
  smsSenderId: "EDUNEX",
  financialYear: "2026",
  reminderTemplate: REMINDER_TEMPLATE,
  approvalThreshold: 100_000,
  bankAccounts: [
    {
      id: "ba_1",
      name: "Operating Account",
      number: "0123456789",
      branch: "KCB Kenyatta Ave",
    },
    {
      id: "ba_2",
      name: "Fees Collection Account",
      number: "0987654321",
      branch: "Equity Westlands",
    },
  ],
  mpesaPaybill: "522522",
  mpesaAccount: "EDUNEX-ACAD",
};

const initialState: State = {
  role: "finance_manager",
  schoolId: "sch_edunex",
  academicYearId: currentYear.id,
  termId: currentTerm.id,
  payments: PAYMENTS,
  receipts: RECEIPTS,
  expenses: EXPENSES,
  vouchers: VOUCHERS,
  lpos: LPOS,
  lsos: LSOS,
  pledges: PLEDGES,
  adjustments: ADJUSTMENTS,
  sms: SMS_HISTORY,
  audit: [
    {
      id: "aud_seed",
      user: "Grace Njeri",
      role: "finance_manager",
      action: "Payment recorded",
      entity: "John Kamau",
      detail: "M-Pesa payment received",
      amount: 5000,
      date: "2026-10-15",
      timestamp: new Date().toISOString(),
      status: "success",
    },
  ],
  settings: initialSettings,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_ROLE":
      return { ...state, role: action.role };
    case "SET_SCHOOL":
      return { ...state, schoolId: action.schoolId };
    case "SET_YEAR":
      return { ...state, academicYearId: action.yearId };
    case "SET_TERM":
      return { ...state, termId: action.termId };
    case "ADD_PAYMENT": {
      const receipt = {
        id: action.receiptId,
        number: action.payment.receiptNo,
        paymentId: action.payment.id,
        studentId: action.payment.studentId,
        studentName: action.payment.studentName,
        admissionNo: action.payment.admissionNo,
        className: action.payment.className,
        parentName: action.payment.parentName,
        amount: action.payment.amount,
        method: action.payment.method,
        reference: action.payment.reference,
        date: action.payment.date,
        term: action.payment.term,
        previousBalance: 0,
        newBalance: 0,
        issuedBy: action.payment.recordedBy,
      };
      return {
        ...state,
        payments: [action.payment, ...state.payments],
        receipts: [receipt, ...state.receipts],
      };
    }
    case "ADD_EXPENSE":
      return { ...state, expenses: [action.expense, ...state.expenses] };
    case "UPDATE_EXPENSE_STATUS":
      return {
        ...state,
        expenses: state.expenses.map((e) =>
          e.id === action.id ? { ...e, status: action.status } : e,
        ),
      };
    case "ADD_VOUCHER":
      return { ...state, vouchers: [action.voucher, ...state.vouchers] };
    case "UPDATE_VOUCHER_STATUS":
      return {
        ...state,
        vouchers: state.vouchers.map((v) =>
          v.id === action.id
            ? {
                ...v,
                status: action.status,
                approvedBy: action.approvedBy ?? v.approvedBy,
              }
            : v,
        ),
      };
    case "ADD_LPO":
      return { ...state, lpos: [action.lpo, ...state.lpos] };
    case "UPDATE_LPO_STATUS":
      return {
        ...state,
        lpos: state.lpos.map((l) =>
          l.id === action.id ? { ...l, status: action.status } : l,
        ),
      };
    case "ADD_LSO":
      return { ...state, lsos: [action.lso, ...state.lsos] };
    case "UPDATE_LSO_STATUS":
      return {
        ...state,
        lsos: state.lsos.map((l) =>
          l.id === action.id ? { ...l, status: action.status } : l,
        ),
      };
    case "ADD_PLEDGE":
      return { ...state, pledges: [action.pledge, ...state.pledges] };
    case "ADD_ADJUSTMENT":
      return {
        ...state,
        adjustments: [action.adjustment, ...state.adjustments],
      };
    case "SEND_SMS_BATCH":
      return { ...state, sms: [...action.messages, ...state.sms] };
    case "LOG_AUDIT":
      return { ...state, audit: [action.entry, ...state.audit].slice(0, 200) };
    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.patch } };
    default:
      return state;
  }
};

type Derived = {
  school: School;
  year: AcademicYear;
  term: Term;
  currentUser: ReturnType<typeof getDemoUser>;
  students: typeof STUDENTS;
  invoices: Invoice[];
  kpis: {
    expected: number;
    collected: number;
    outstanding: number;
    overdue: number;
    expenses: number;
    netCashflow: number;
    collectionRate: number;
  };
};

type Ctx = State &
  Derived & {
    dispatch: React.Dispatch<Action>;
    setRole: (r: Role) => void;
    setSchool: (id: string) => void;
    setYear: (id: string) => void;
    setTerm: (id: string) => void;
    logAudit: (entry: Omit<AuditEntry, "id" | "timestamp" | "date">) => void;
    isAllowed: (navKey: string) => boolean;
  };

const FinanceContext = createContext<Ctx | null>(null);

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setRole = useCallback(
    (role: Role) => dispatch({ type: "SET_ROLE", role }),
    [],
  );
  const setSchool = useCallback(
    (schoolId: string) => dispatch({ type: "SET_SCHOOL", schoolId }),
    [],
  );
  const setYear = useCallback(
    (yearId: string) => dispatch({ type: "SET_YEAR", yearId }),
    [],
  );
  const setTerm = useCallback(
    (termId: string) => dispatch({ type: "SET_TERM", termId }),
    [],
  );

  const logAudit = useCallback(
    (entry: Omit<AuditEntry, "id" | "timestamp" | "date">) => {
      dispatch({
        type: "LOG_AUDIT",
        entry: {
          ...entry,
          id: `aud_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          timestamp: new Date().toISOString(),
          date: new Date().toISOString().slice(0, 10),
        },
      });
    },
    [],
  );

  const derived = useMemo<Derived>(() => {
    const school = SCHOOLS.find((s) => s.id === state.schoolId) ?? SCHOOLS[0];
    const year =
      ACADEMIC_YEARS.find((y) => y.id === state.academicYearId) ??
      ACADEMIC_YEARS[0];
    const term = year.terms.find((t) => t.id === state.termId) ?? year.terms[0];
    const currentUser = getDemoUser(state.role);

    // Recompute invoice paid/balance from payments so state stays consistent
    const invoices: Invoice[] = INVOICES.map((inv) => {
      const paid = state.payments
        .filter((p) => p.invoiceId === inv.id && p.status === "Completed")
        .reduce((s, p) => s + p.amount, 0);
      const balance = Math.max(0, inv.amount - paid);
      const status: Invoice["status"] =
        balance <= 0
          ? "Paid"
          : new Date(inv.dueDate).getTime() < Date.now()
            ? "Overdue"
            : paid > 0
              ? "Partially Paid"
              : "Issued";
      return { ...inv, paid, balance, status };
    });

    // Recompute student KPIs from invoices
    const students = STUDENTS.map((s) => {
      const mine = invoices.filter((i) => i.studentId === s.id);
      const billed = mine.reduce((sum, i) => sum + i.amount, 0);
      const paid = mine.reduce((sum, i) => sum + i.paid, 0);
      const outstanding = Math.max(0, billed - paid);
      const now = Date.now();
      const overdue = mine
        .filter((i) => i.balance > 0 && new Date(i.dueDate).getTime() < now)
        .reduce((sum, i) => sum + i.balance, 0);
      const status =
        outstanding <= 0
          ? "PAID"
          : overdue > 0
            ? "OVERDUE"
            : paid > 0
              ? "PARTIALLY_PAID"
              : "UNPAID";
      return { ...s, billed, paid, outstanding, overdue, status } as typeof s;
    });

    const expected = students.reduce((s, x) => s + x.billed, 0);
    const collected = students.reduce((s, x) => s + x.paid, 0);
    const outstanding = expected - collected;
    const overdue = students.reduce((s, x) => s + x.overdue, 0);
    const expenses = state.expenses.reduce((s, e) => s + e.amount, 0);
    const otherIncome = 240_000;
    const netCashflow = collected + otherIncome - expenses;
    const collectionRate = expected > 0 ? (collected / expected) * 100 : 0;

    return {
      school,
      year,
      term,
      currentUser,
      students,
      invoices,
      kpis: {
        expected,
        collected,
        outstanding,
        overdue,
        expenses,
        netCashflow,
        collectionRate,
      },
    };
  }, [
    state.schoolId,
    state.academicYearId,
    state.termId,
    state.role,
    state.payments,
    state.expenses,
  ]);

  const isAllowed = useCallback(
    (navKey: string) => {
      const user = DEMO_USERS.find((u) => u.role === state.role);
      if (!user || user.allowedNavKeys.length === 0) return true;
      return user.allowedNavKeys.includes(navKey);
    },
    [state.role],
  );

  const value: Ctx = {
    ...state,
    ...derived,
    dispatch,
    setRole,
    setSchool,
    setYear,
    setTerm,
    logAudit,
    isAllowed,
  };

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  );
};

export const useFinance = (): Ctx => {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used inside FinanceProvider");
  return ctx;
};

// Convenience hooks
export const useToast = () => {
  const [toast, setToast] = useState<{
    msg: string;
    kind?: "success" | "error" | "info";
  } | null>(null);
  const show = useCallback(
    (msg: string, kind: "success" | "error" | "info" = "success") => {
      setToast({ msg, kind });
      window.setTimeout(() => setToast(null), 3200);
    },
    [],
  );
  return { toast, show };
};
