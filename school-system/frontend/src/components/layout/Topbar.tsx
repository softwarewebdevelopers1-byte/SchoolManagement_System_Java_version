import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, Search, Bell, LogOut, Check } from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { DEMO_USERS } from "@/data/users";
import { ACADEMIC_YEARS } from "@/data/schools";
import { SCHOOLS } from "@/data/schools";
import type { Role } from "@/types/finance";
import s from "./Topbar.module.css";

const ROLE_LABELS: Record<Role, string> = {
  platform_admin: "Platform Admin",
  school_admin: "School Admin",
  finance_manager: "Finance Manager",
  accounts_clerk: "Accounts Clerk",
  school_administrator: "School Administrator",
  parent: "Parent",
  student: "Student",
};

export const Topbar = ({ onOpenMobile }: { onOpenMobile: () => void }) => {
  const {
    school,
    year,
    term,
    role,
    setRole,
    setSchool,
    setYear,
    setTerm,
    currentUser,
  } = useFinance();
  const [open, setOpen] = useState<null | "role" | "school" | "term" | "notif">(
    null,
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const yearTerms = year.terms;

  return (
    <header className={s.topbar} ref={ref}>
      <button
        type="button"
        className={s.menuBtn}
        onClick={onOpenMobile}
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      <div className={s.context}>
        {/* School selector */}
        <div className={s.dropdown}>
          <button
            type="button"
            className={s.contextBtn}
            onClick={() => setOpen(open === "school" ? null : "school")}
            aria-expanded={open === "school"}
          >
            <span className={s.dot} style={{ background: school.logoColor }} />
            <span className={s.contextLabel}>{school.name}</span>
            <ChevronDown size={14} />
          </button>
          {open === "school" && (
            <div className={s.menu}>
              <div className={s.menuLabel}>Switch school</div>
              {SCHOOLS.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  className={`${s.menuItem} ${sc.id === school.id ? s.menuItemActive : ""}`}
                  onClick={() => {
                    setSchool(sc.id);
                    setOpen(null);
                  }}
                >
                  <span
                    className={s.dot}
                    style={{ background: sc.logoColor }}
                  />
                  <span>{sc.name}</span>
                  {sc.id === school.id && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Year / Term */}
        <div className={s.dropdown}>
          <button
            type="button"
            className={s.contextBtn}
            onClick={() => setOpen(open === "term" ? null : "term")}
            aria-expanded={open === "term"}
          >
            <span className={s.contextLabel}>
              {year.label} · {term.label}
            </span>
            <ChevronDown size={14} />
          </button>
          {open === "term" && (
            <div className={s.menu}>
              <div className={s.menuLabel}>Academic Year</div>
              {ACADEMIC_YEARS.map((y) => (
                <button
                  key={y.id}
                  type="button"
                  className={`${s.menuItem} ${y.id === year.id ? s.menuItemActive : ""}`}
                  onClick={() => {
                    setYear(y.id);
                    const t = y.terms.find((x) => x.isCurrent) ?? y.terms[0];
                    setTerm(t.id);
                    setOpen(null);
                  }}
                >
                  <span>{y.label}</span>
                  {y.id === year.id && <Check size={14} />}
                </button>
              ))}
              <div className={s.menuLabel}>Term</div>
              {yearTerms.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`${s.menuItem} ${t.id === term.id ? s.menuItemActive : ""}`}
                  onClick={() => {
                    setTerm(t.id);
                    setOpen(null);
                  }}
                >
                  <span>{t.label}</span>
                  {t.id === term.id && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={s.search}>
        <Search size={16} className={s.searchIcon} />
        <input
          type="text"
          placeholder="Search students, invoices, payments…"
          className={s.searchInput}
          aria-label="Global search"
        />
        <kbd className={s.kbd}>⌘K</kbd>
      </div>

      <div className={s.actions}>
        <button type="button" className={s.iconBtn} aria-label="Notifications">
          <Bell size={18} />
          <span className={s.badge}>3</span>
        </button>

        <div className={s.dropdown}>
          <button
            type="button"
            className={s.userBtn}
            onClick={() => setOpen(open === "role" ? null : "role")}
            aria-expanded={open === "role"}
          >
            <div className={s.avatar}>{currentUser.initials}</div>
            <div className={s.userMeta}>
              <span className={s.userName}>{currentUser.name}</span>
              <span className={s.userRole}>{ROLE_LABELS[role]}</span>
            </div>
            <ChevronDown size={14} />
          </button>
          {open === "role" && (
            <div className={`${s.menu} ${s.menuRight}`}>
              <div className={s.menuLabel}>Demo: Switch role</div>
              {DEMO_USERS.map((u) => (
                <button
                  key={u.role}
                  type="button"
                  className={`${s.menuItem} ${u.role === role ? s.menuItemActive : ""}`}
                  onClick={() => {
                    setRole(u.role);
                    setOpen(null);
                  }}
                >
                  <div className={s.menuAvatar}>{u.initials}</div>
                  <div className={s.menuUserMeta}>
                    <span className={s.menuUserName}>
                      {ROLE_LABELS[u.role]}
                    </span>
                    <span className={s.menuUserTitle}>{u.name}</span>
                  </div>
                  {u.role === role && <Check size={14} />}
                </button>
              ))}
              <div className={s.menuDivider} />
              <button type="button" className={s.menuItem}>
                <LogOut size={14} />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
