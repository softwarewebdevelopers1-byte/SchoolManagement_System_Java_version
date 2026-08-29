// components/Sidebar.tsx
import React from "react";
import "./Sidebar.css";

interface SidebarProps {
  activeTab: "schools" | "teachers";
  onTabChange: (tab: "schools" | "teachers") => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const user = JSON.parse(localStorage.getItem("edunex_user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("edunex_user");
    window.location.reload();
  };

  const navItems = [
    { id: "overview", icon: "📊", label: "Overview" },
    { id: "classes", icon: "🏫", label: "Classes" },
    { id: "students", icon: "👨‍🎓", label: "Students" },
    { id: "performance", icon: "📈", label: "Performance & Analytics" },
    { id: "subjects", icon: "📚", label: "Subjects" },
    { id: "staff", icon: "👨‍🏫", label: "Staff", active: true },
    { id: "approvals", icon: "✅", label: "User Approvals" },
    { id: "assignments", icon: "📋", label: "Teachers Assignments" },
    { id: "timetables", icon: "🕐", label: "Timetables" },
    { id: "academic", icon: "📅", label: "Academic Cycle" },
    { id: "settings", icon: "⚙️", label: "School Settings" },
    { id: "grading", icon: "📊", label: "CBC Grading Configuration" },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <div className="admin-sidebar-logo">E</div>
        <div>
          <span>Edunex</span>
          <small>Super Admin</small>
        </div>
      </div>

      <nav className="admin-sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`admin-nav-item ${item.active ? "active" : ""}`}
            onClick={() => {
              if (item.id === "staff") onTabChange("teachers");
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <div className="admin-sidebar-user">
          <div className="admin-sidebar-avatar">
            {user.firstName?.[0]}
            {user.lastName?.[0] || "SA"}
          </div>
          <div>
            <div>
              {user.firstName} {user.lastName}
            </div>
            <small>{user.email}</small>
          </div>
        </div>

        <div className="admin-sidebar-status">
          <div className="admin-status-item">
            <span className="admin-status-dot green"></span>
            <span>System Health</span>
          </div>
          <div className="admin-status-item">
            <span>CT assigned</span>
            <span className="admin-status-badge">12</span>
          </div>
          <div className="admin-status-item">
            <span>Open alerts</span>
            <span className="admin-status-badge alert">3</span>
          </div>
          <div className="admin-status-item">
            <span>Unassigned</span>
            <span className="admin-status-badge">5</span>
          </div>
        </div>

        <button className="admin-logout-button" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;