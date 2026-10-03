import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Receipt,
  FileText,
  Wallet,
  ArrowLeftRight,
  BookOpen,
  Landmark,
  TrendingUp,
  MessageSquare,
  BarChart3,
  Settings,
  FileCheck2,
  Truck,
  Briefcase,
  ClipboardList,
  ScrollText,
  Building2,
  GraduationCap,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import s from "./Sidebar.module.css";

interface NavItem {
  key: string;
  to: string;
  label: string;
  icon: React.ReactNode;
}
interface NavGroup {
  title: string;
  items: NavItem[];
}

const GROUPS: NavGroup[] = [
  {
    title: "Overview",
    items: [
      {
        key: "dashboard",
        to: "/finance/dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard size={16} />,
      },
    ],
  },
  {
    title: "Fees",
    items: [
      {
        key: "students",
        to: "/finance/students",
        label: "Students",
        icon: <Users size={16} />,
      },
      {
        key: "fee_structures",
        to: "/finance/fees",
        label: "Fee Structures",
        icon: <ClipboardList size={16} />,
      },
      {
        key: "invoices",
        to: "/finance/invoices",
        label: "Invoices",
        icon: <FileText size={16} />,
      },
      {
        key: "outstanding",
        to: "/finance/outstanding",
        label: "Outstanding",
        icon: <ScrollText size={16} />,
      },
      {
        key: "payments",
        to: "/finance/payments",
        label: "Payments",
        icon: <Wallet size={16} />,
      },
      {
        key: "receipts",
        to: "/finance/receipts",
        label: "Receipts",
        icon: <Receipt size={16} />,
      },
      {
        key: "statements",
        to: "/finance/statements",
        label: "Statements",
        icon: <BookOpen size={16} />,
      },
      {
        key: "pledges",
        to: "/finance/pledges",
        label: "Pledges",
        icon: <Sparkles size={16} />,
      },
      {
        key: "adjustments",
        to: "/finance/adjustments",
        label: "Discounts / Waivers",
        icon: <ShieldCheck size={16} />,
      },
    ],
  },
  {
    title: "Expenses",
    items: [
      {
        key: "expenses",
        to: "/finance/expenses",
        label: "Expenses",
        icon: <TrendingUp size={16} />,
      },
      {
        key: "vouchers",
        to: "/finance/vouchers",
        label: "Payment Vouchers",
        icon: <FileCheck2 size={16} />,
      },
      {
        key: "lpos",
        to: "/finance/lpos",
        label: "LPOs",
        icon: <Truck size={16} />,
      },
      {
        key: "lsos",
        to: "/finance/lsos",
        label: "LSOs",
        icon: <Briefcase size={16} />,
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        key: "cashbook",
        to: "/finance/cashbook",
        label: "Cashbook",
        icon: <BookOpen size={16} />,
      },
      {
        key: "cashflow",
        to: "/finance/cashflow",
        label: "Cashflow",
        icon: <ArrowLeftRight size={16} />,
      },
      {
        key: "reconciliation",
        to: "/finance/reconciliation",
        label: "Reconciliation",
        icon: <Landmark size={16} />,
      },
      {
        key: "accounts",
        to: "/finance/accounts",
        label: "Accounts",
        icon: <Building2 size={16} />,
      },
    ],
  },
  {
    title: "Communication",
    items: [
      {
        key: "sms",
        to: "/finance/sms",
        label: "Fee Reminders",
        icon: <MessageSquare size={16} />,
      },
      {
        key: "sms_history",
        to: "/finance/sms/history",
        label: "Message History",
        icon: <MessageSquare size={16} />,
      },
    ],
  },
  {
    title: "Reports",
    items: [
      {
        key: "reports",
        to: "/finance/reports",
        label: "Reports Center",
        icon: <BarChart3 size={16} />,
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        key: "settings",
        to: "/finance/settings",
        label: "Settings",
        icon: <Settings size={16} />,
      },
      {
        key: "audit",
        to: "/finance/audit",
        label: "Audit Log",
        icon: <ScrollText size={16} />,
      },
    ],
  },
];

export const Sidebar = () => {
  const { role, isAllowed, school } = useFinance();

  const showStudentNav = role !== "student" && role !== "parent";
  const showParentNav = role === "parent";
  const showStudentSelfNav = role === "student";

  return (
    <aside className={s.sidebar} aria-label="Finance navigation">
      <div className={s.brand}>
        <div className={s.logo} style={{ background: school.logoColor }}>
          <GraduationCap size={18} />
        </div>
        <div className={s.brandText}>
          <span className={s.brandName}>Edunex</span>
          <span className={s.brandSub}>Finance</span>
        </div>
      </div>

      <nav className={s.nav}>
        {showStudentNav &&
          GROUPS.map((group) => {
            const items = group.items.filter((i) => isAllowed(i.key));
            if (!items.length) return null;
            return (
              <div key={group.title} className={s.group}>
                <div className={s.groupTitle}>{group.title}</div>
                {items.map((item) => (
                  <NavLink
                    key={item.key}
                    to={item.to}
                    className={({ isActive }) =>
                      `${s.item} ${isActive ? s.active : ""}`
                    }
                  >
                    <span className={s.icon}>{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            );
          })}

        {showParentNav && (
          <div className={s.group}>
            <div className={s.groupTitle}>My Children</div>
            <NavLink
              to="/parent/finance"
              className={({ isActive }) =>
                `${s.item} ${isActive ? s.active : ""}`
              }
            >
              <span className={s.icon}>
                <LayoutDashboard size={16} />
              </span>
              <span>Overview</span>
            </NavLink>
            <NavLink
              to="/parent/finance/statements"
              className={({ isActive }) =>
                `${s.item} ${isActive ? s.active : ""}`
              }
            >
              <span className={s.icon}>
                <BookOpen size={16} />
              </span>
              <span>Statements</span>
            </NavLink>
            <NavLink
              to="/parent/finance/receipts"
              className={({ isActive }) =>
                `${s.item} ${isActive ? s.active : ""}`
              }
            >
              <span className={s.icon}>
                <Receipt size={16} />
              </span>
              <span>Receipts</span>
            </NavLink>
          </div>
        )}

        {showStudentSelfNav && (
          <div className={s.group}>
            <div className={s.groupTitle}>My Account</div>
            <NavLink
              to="/student/finance"
              className={({ isActive }) =>
                `${s.item} ${isActive ? s.active : ""}`
              }
            >
              <span className={s.icon}>
                <LayoutDashboard size={16} />
              </span>
              <span>Finance Overview</span>
            </NavLink>
          </div>
        )}
      </nav>

      <div className={s.footer}>
        <div className={s.footerText}>
          Edunex Finance <span className={s.version}>v0.1</span>
        </div>
      </div>
    </aside>
  );
};
