import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  X,
  LayoutDashboard,
  Users,
  Wallet,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import s from "./MobileNav.module.css";

const LINKS = [
  {
    to: "/finance/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  { to: "/finance/students", label: "Students", icon: <Users size={18} /> },
  { to: "/finance/payments", label: "Payments", icon: <Wallet size={18} /> },
  { to: "/finance/sms", label: "Reminders", icon: <MessageSquare size={18} /> },
  { to: "/finance/reports", label: "Reports", icon: <BarChart3 size={18} /> },
];

export const MobileNav = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const { school } = useFinance();
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {open && <div className={s.backdrop} onClick={onClose} />}
      <div className={`${s.drawer} ${open ? s.open : ""}`} aria-hidden={!open}>
        <div className={s.head}>
          <div>
            <div className={s.schoolName}>{school.name}</div>
            <div className={s.sub}>Finance</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className={s.closeBtn}
          >
            <X size={18} />
          </button>
        </div>
        <nav className={s.nav}>
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={onClose}
              className={({ isActive }) =>
                `${s.link} ${isActive ? s.active : ""}`
              }
            >
              {l.icon}
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};
