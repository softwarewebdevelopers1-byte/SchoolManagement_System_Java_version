import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";
import s from "./FinanceLayout.module.css";

export const FinanceLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className={s.shell}>
      <div className={s.desktopSidebar}>
        <Sidebar />
      </div>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className={s.main}>
        <Topbar onOpenMobile={() => setMobileOpen(true)} />
        <main className={s.content} id="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
