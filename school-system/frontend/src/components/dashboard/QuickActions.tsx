import { useNavigate } from "react-router-dom";
import {
  Wallet,
  FileText,
  MessageSquare,
  Receipt,
  TrendingUp,
  FileCheck2,
  Truck,
  Briefcase,
  AlertCircle,
  Landmark,
} from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import s from "./Dashboard.module.css";

const ACTIONS: {
  label: string;
  to: string;
  icon: React.ReactNode;
  perm: string;
}[] = [
  {
    label: "Record Payment",
    to: "/finance/payments?action=new",
    icon: <Wallet size={14} />,
    perm: "payments",
  },
  {
    label: "Create Invoice",
    to: "/finance/invoices?action=new",
    icon: <FileText size={14} />,
    perm: "invoices",
  },
  {
    label: "Send Fee Reminder",
    to: "/finance/sms",
    icon: <MessageSquare size={14} />,
    perm: "sms",
  },
  {
    label: "Issue Receipt",
    to: "/finance/receipts",
    icon: <Receipt size={14} />,
    perm: "receipts",
  },
  {
    label: "Record Expense",
    to: "/finance/expenses?action=new",
    icon: <TrendingUp size={14} />,
    perm: "expenses",
  },
  {
    label: "Payment Voucher",
    to: "/finance/vouchers?action=new",
    icon: <FileCheck2 size={14} />,
    perm: "vouchers",
  },
  {
    label: "Create LPO",
    to: "/finance/lpos?action=new",
    icon: <Truck size={14} />,
    perm: "lpos",
  },
  {
    label: "Create LSO",
    to: "/finance/lsos?action=new",
    icon: <Briefcase size={14} />,
    perm: "lsos",
  },
  {
    label: "Outstanding Balances",
    to: "/finance/outstanding",
    icon: <AlertCircle size={14} />,
    perm: "outstanding",
  },
  {
    label: "Reconcile Payment",
    to: "/finance/reconciliation",
    icon: <Landmark size={14} />,
    perm: "reconciliation",
  },
];

export const QuickActions = () => {
  const { isAllowed } = useFinance();
  const navigate = useNavigate();
  const visible = ACTIONS.filter((a) => isAllowed(a.perm));

  return (
    <div className={s.actionsGrid}>
      {visible.map((a) => (
        <button
          key={a.label}
          type="button"
          className={s.quickAction}
          onClick={() => navigate(a.to)}
        >
          <span className={s.quickActionIcon}>{a.icon}</span>
          <span>{a.label}</span>
        </button>
      ))}
    </div>
  );
};
