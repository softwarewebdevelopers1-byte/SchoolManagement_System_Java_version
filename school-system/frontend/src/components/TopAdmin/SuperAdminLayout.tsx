import React, { useEffect, useState } from "react";
import { LayoutDashboard, Building2, Users, Mail, BarChart3, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState("Super Admin");

  useEffect(() => {
    // Try to get user info from localStorage or auth context
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
    navigate("/auth/login");
  };

  const isActive = (path: string) => {
    if (path === "/edunex-org/superAdmin") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <aside style={styles.sidebar}>
          <div style={styles.brandSection}>
            <div style={styles.brand}>EduNex</div>
            <div style={styles.brandSub}>Super Admin</div>
          </div>

          <nav style={styles.nav}>
            {navigationItems.map(({ path, label, icon: Icon }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                style={{
                  ...styles.navItem,
                  ...(isActive(path) ? styles.navItemActive : {}),
                }}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div style={styles.navDivider} />

          <div style={styles.userSection}>
            <div style={styles.userBadge}>{userName.slice(0, 1).toUpperCase()}</div>
            <div style={styles.userInfo}>
              <div style={styles.userName}>{userName}</div>
              <div style={styles.userRole}>Platform Admin</div>
            </div>
          </div>

          <button onClick={handleLogout} style={styles.logoutButton}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </aside>

        <main style={styles.main}>{children}</main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f6f8f6 0%, #edf3ee 100%)",
    color: "#0f2e22",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  shell: {
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    minHeight: "100vh",
  },
  sidebar: {
    background: "#163325",
    color: "#ecfdf5",
    borderRight: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    flexDirection: "column",
    padding: 20,
    boxShadow: "0 24px 48px rgba(16, 36, 28, 0.12)",
  },
  brandSection: {
    marginBottom: 28,
  },
  brand: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: -0.04,
    marginBottom: 6,
  },
  brandSub: {
    color: "#b7d0c2",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.12,
  },
  nav: {
    display: "grid",
    gap: 10,
    flex: 1,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 14px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    color: "#ecfdf5",
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: 14,
  },
  navItemActive: {
    background: "#c9963d",
    color: "#fff",
  },
  navDivider: {
    height: 1,
    background: "rgba(255,255,255,0.1)",
    margin: "20px 0",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  userBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    background: "#c9963d",
    fontWeight: 800,
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontWeight: 700,
    fontSize: 13,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  userRole: {
    fontSize: 11,
    color: "#b7d0c2",
    marginTop: 4,
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    background: "rgba(239, 68, 68, 0.1)",
    color: "#fecaca",
    fontWeight: 600,
    border: "1px solid rgba(239, 68, 68, 0.3)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: 14,
  },
  main: {
    padding: 24,
    overflowY: "auto",
  },
};
