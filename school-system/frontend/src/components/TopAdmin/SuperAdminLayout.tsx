import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Users,
  Mail,
  BarChart3,
  LogOut,
  Moon,
  SunMedium,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDashboardTheme } from "../../lib/useDashboardTheme";

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useDashboardTheme();
  const [userName, setUserName] = useState("Super Admin");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 900);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserName(userData.firstName || userData.email || "Super Admin");
      } catch {
        // Keep default
      }
    }
  }, []);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);
      if (!mobile) setMobileMenuOpen(false);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const navigationItems = [
    { path: "/edunex-org/superAdmin", label: "Overview", icon: LayoutDashboard },
    { path: "/edunex-org/superAdmin/schools", label: "Schools", icon: Building2 },
    { path: "/edunex-org/superAdmin/staff", label: "Staff", icon: Users },
    { path: "/edunex-org/superAdmin/invitations", label: "Invitations", icon: Mail },
    { path: "/edunex-org/superAdmin/analytics", label: "Analytics", icon: BarChart3 },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path: string) => {
    if (path === "/edunex-org/superAdmin") {
      return location.pathname === path || location.pathname === "/edunex-org/superAdmin/";
    }
    return location.pathname.startsWith(path);
  };

  const palette = theme === "dark"
    ? {
        bg: "#08110d",
        panel: "#0f1d17",
        panelSoft: "rgba(18, 23, 20, 0.88)",
        panelAlt: "#121e1a",
        sidebar: "#08110d",
        sidebarBorder: "rgba(255,255,255,0.06)",
        text: "#f3eadb",
        textSoft: "#ddcdb8",
        textMuted: "#ad9d87",
        accent: "#D7AB59",
        accentSoft: "rgba(215,171,89,0.18)",
        success: "#98cd73",
        warn: "#e7bc71",
        danger: "#f09b9b",
        overlay: "rgba(3, 7, 5, 0.58)",
        chip: "rgba(215,171,89,0.12)",
      }
    : {
        bg: "#f5f0e7",
        panel: "rgba(255,255,255,0.82)",
        panelSoft: "rgba(255,255,255,0.68)",
        panelAlt: "#fdfbf7",
        sidebar: "#0B2018",
        sidebarBorder: "rgba(255,255,255,0.07)",
        text: "#1a1208",
        textSoft: "#4a3820",
        textMuted: "#7a6040",
        accent: "#C9963D",
        accentSoft: "rgba(201,150,61,0.12)",
        success: "#3b6d11",
        warn: "#854f0b",
        danger: "#a32d2d",
        overlay: "rgba(11,32,24,0.34)",
        chip: "rgba(201,150,61,0.08)",
      };

  const sidebarWidth = collapsed && !isMobile ? 76 : 240;

  return (
    <div
      style={{
        ...styles.page,
        background: `linear-gradient(180deg, ${palette.bg} 0%, ${theme === "dark" ? "#0f1d17" : "#edf1ec"} 100%)`,
        color: palette.text,
      }}
    >
      {isMobile && mobileMenuOpen && (
        <button
          aria-label="Close mobile menu"
          onClick={() => setMobileMenuOpen(false)}
          style={{
            ...styles.mobileOverlay,
            background: palette.overlay,
          }}
        />
      )}

      <div style={styles.shell}>
        <aside
          style={{
            ...styles.sidebar,
            background: palette.sidebar,
            borderColor: palette.sidebarBorder,
            width: isMobile ? (mobileMenuOpen ? 250 : 0) : sidebarWidth,
            padding: isMobile ? "18px 14px" : "18px 14px 18px",
            opacity: isMobile && !mobileMenuOpen ? 0 : 1,
            pointerEvents: isMobile && !mobileMenuOpen ? "none" : "auto",
            position: isMobile ? "fixed" : "relative",
            left: isMobile ? 0 : undefined,
            top: isMobile ? 0 : undefined,
            height: isMobile ? "100vh" : "auto",
            zIndex: isMobile ? 1000 : 1,
            boxShadow: isMobile ? "0 18px 42px rgba(11,32,24,0.24)" : "0 20px 40px rgba(11,32,24,0.10)",
          }}
        >
          <div style={{
            ...styles.brandRow,
            justifyContent: collapsed && !isMobile ? "center" : "space-between",
          }}>
            {(!collapsed || isMobile) && (
              <div style={styles.brandWrap}>
                <div style={{ ...styles.brandBadge, background: palette.accent }}>{"E"}</div>
                <div>
                  <div style={{ ...styles.brand, color: palette.text }}>EduNex</div>
                  <div style={{ ...styles.brandSub, color: palette.textMuted }}>Super Admin</div>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                if (isMobile) setMobileMenuOpen(false);
                else setCollapsed((prev) => !prev);
              }}
              style={{
                ...styles.collapseButton,
                background: palette.chip,
                borderColor: palette.sidebarBorder,
                color: palette.textSoft,
              }}
              aria-label={isMobile ? "Close navigation menu" : collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isMobile ? <Menu size={16} /> : collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
          </div>

          {(!collapsed || isMobile) && (
            <div style={{ ...styles.userCard, borderColor: palette.sidebarBorder, background: palette.panelAlt }}>
              <div style={{ ...styles.userBadge, background: palette.accent }}>{userName.slice(0, 1).toUpperCase()}</div>
              <div style={styles.userMeta}>
                <div style={{ ...styles.userName, color: palette.text }}>{userName}</div>
                <div style={{ ...styles.userRole, color: palette.textMuted }}>Platform admin</div>
              </div>
            </div>
          )}

          <nav style={styles.nav}>
            {navigationItems.map(({ path, label, icon: Icon }) => {
              const active = isActive(path);
              return (
                <button
                  key={path}
                  onClick={() => {
                    navigate(path);
                    if (isMobile) setMobileMenuOpen(false);
                  }}
                  style={{
                    ...styles.navItem,
                    background: active ? palette.accentSoft : "rgba(255,255,255,0.03)",
                    color: "#fff",
                    borderLeft: active ? `3px solid ${palette.accent}` : "3px solid transparent",
                    paddingLeft: active ? "11px" : "14px",
                  }}
                >
                  <Icon size={16} />
                  {(!collapsed || isMobile) && <span>{label}</span>}
                </button>
              );
            })}
          </nav>

          {(!collapsed || isMobile) && (
            <>
              <div style={{ ...styles.navDivider, background: palette.sidebarBorder }} />

              <button
                onClick={toggleTheme}
                style={{
                  ...styles.utilityButton,
                  background: palette.panelAlt,
                  borderColor: palette.sidebarBorder,
                  color: palette.textSoft,
                }}
              >
                {theme === "dark" ? <SunMedium size={16} /> : <Moon size={16} />}
                <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
              </button>

              <button onClick={handleLogout} style={{ ...styles.logoutButton, background: "rgba(240,155,155,0.08)", borderColor: "rgba(240,155,155,0.28)", color: palette.danger }}>
                <LogOut size={16} />
                {(!collapsed || isMobile) && <span>Logout</span>}
              </button>
            </>
          )}
        </aside>

        <main style={styles.main}>
          {!isMobile && (
            <button
              onClick={() => setCollapsed((prev) => !prev)}
              style={{ ...styles.mobileToggle, background: palette.panel, borderColor: palette.sidebarBorder, color: palette.textSoft }}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
          )}

          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={{ ...styles.mobileMenuButton, background: palette.panel, borderColor: palette.sidebarBorder, color: palette.textSoft }}
              aria-label="Open navigation menu"
            >
              <Menu size={18} />
            </button>
          )}

          <div
            style={{
              ...styles.mainPanel,
              background: theme === "dark" ? "rgba(18,23,20,0.88)" : "rgba(255,255,255,0.74)",
              borderColor: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(15,46,34,0.08)",
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    color: "#1a1208",
    fontFamily: "Nunito, Inter, system-ui, sans-serif",
    transition: "background 0.2s ease",
  },
  shell: {
    display: "flex",
    minHeight: "100vh",
    position: "relative",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    color: "#ecfdf5",
    borderRight: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 20px 40px rgba(11,32,24,0.10)",
    transition: "width 0.28s cubic-bezier(.22,1,.36,1), opacity 0.2s ease",
    overflow: "hidden",
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    padding: "8px 2px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    marginBottom: 4,
  },
  brandWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  brandBadge: {
    width: 30,
    height: 30,
    borderRadius: 9,
    display: "grid",
    placeItems: "center",
    color: "#fff",
    fontWeight: 800,
    fontSize: 14,
  },
  brand: {
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    margin: 0,
  },
  brandSub: {
    fontSize: 11,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    marginTop: 2,
  },
  collapseButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    border: "1px solid",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    flexShrink: 0,
    transition: "all 0.15s ease",
  },
  userCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    border: "1px solid",
    borderRadius: 12,
    padding: "10px 12px",
  },
  userBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    color: "#fff",
    flexShrink: 0,
  },
  userMeta: {
    minWidth: 0,
    flex: 1,
  },
  userName: {
    fontWeight: 700,
    fontSize: 13,
    lineHeight: 1.2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  userRole: {
    fontSize: 11,
    marginTop: 2,
  },
  nav: {
    display: "grid",
    gap: 8,
    marginTop: 8,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 14px",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    textAlign: "left",
    transition: "all 0.18s ease",
    fontSize: 14,
  },
  navDivider: {
    height: 1,
    width: "100%",
    margin: "6px 0",
  },
  utilityButton: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 12,
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 12,
    marginTop: "auto",
  },
  mobileOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 999,
    border: "none",
    cursor: "pointer",
  },
  main: {
    flex: 1,
    display: "flex",
    padding: 24,
    position: "relative",
    minWidth: 0,
  },
  mainPanel: {
    flex: 1,
    borderRadius: 24,
    border: "1px solid",
    padding: 24,
    boxShadow: "0 18px 40px rgba(11,32,24,0.08)",
    overflow: "hidden",
  },
  mobileToggle: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 2,
    border: "1px solid",
    borderRadius: 10,
    width: 36,
    height: 36,
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
  },
  mobileMenuButton: {
    position: "absolute",
    top: 18,
    right: 18,
    zIndex: 2,
    border: "1px solid",
    borderRadius: 10,
    width: 40,
    height: 40,
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
  },
};
